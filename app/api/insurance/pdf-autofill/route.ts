import { NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import { DEFAULT_OPENAI_CHAT_MODEL } from "@/lib/openai-models";
import {
  extractPdfTextPreview,
  fillPdfOverlay,
  fillPdfForm,
  inspectPdfForm,
  renderPdfPageImages,
  type FieldFillInput,
  type PdfFieldDescriptor,
  type PdfOverlayInput,
} from "@/lib/insurance/pdf-autofill";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_TEMPLATE_BYTES = 12 * 1024 * 1024;
const MAX_CONTEXT_BYTES = 3 * 1024 * 1024;
const MAX_CONTEXT_CHARS = 18000;
const MAX_FIELDS_FOR_MODEL = 320;
const MAX_FIELDS_PER_MODEL_BATCH = 80;
const MAX_FIELD_BATCHES = 16;
const MAX_FIELD_BATCH_CONCURRENCY = 4;
const MAX_FLAT_OVERLAY_PAGES = 4;

interface ModelFieldValue {
  fieldName: string;
  value: string | number | boolean | string[] | null;
  confidence: number;
  sourceQuote?: string;
  reasoning?: string;
}

interface ModelUnfilledField {
  fieldName: string;
  reason: string;
  followUpQuestion?: string;
}

interface ModelAutofillResponse {
  documentTitle?: string;
  fieldValues?: ModelFieldValue[];
  unfilledFields?: ModelUnfilledField[];
  summary?: {
    extractedFacts?: string[];
    assumptions?: string[];
    warnings?: string[];
  };
}

interface ModelEvidenceFact {
  label: string;
  value: string;
  sourceQuote: string;
}

interface ModelEvidenceResponse {
  facts?: ModelEvidenceFact[];
  warnings?: string[];
}

interface ModelOverlayValue {
  label: string;
  value: string | number | boolean | null;
  pageIndex: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  kind?: "text" | "checkbox";
  confidence: number;
  sourceQuote?: string;
  reasoning?: string;
}

interface ModelOverlayResponse {
  documentTitle?: string;
  overlays?: ModelOverlayValue[];
  unfilledFields?: ModelUnfilledField[];
  summary?: {
    extractedFacts?: string[];
    assumptions?: string[];
    warnings?: string[];
  };
}

function isFile(value: FormDataEntryValue | null): value is File {
  return Boolean(value && typeof value === "object" && "arrayBuffer" in value && "name" in value);
}

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function isAudio(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type.startsWith("audio/") ||
    [".webm", ".m4a", ".mp3", ".mp4", ".mpeg", ".mpga", ".wav", ".ogg"].some((ext) => name.endsWith(ext))
  );
}

function isTextLike(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type.startsWith("text/") ||
    file.type === "application/json" ||
    [".txt", ".md", ".csv", ".json", ".eml", ".rtf", ".log"].some((ext) => name.endsWith(ext))
  );
}

function limitText(text: string, limit = MAX_CONTEXT_CHARS): string {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}\n\n[truncated ${text.length - limit} characters]`;
}

function cleanJson(raw: string): string {
  return raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function parseModelJson<T = ModelAutofillResponse>(raw: string): T {
  try {
    return JSON.parse(cleanJson(raw)) as T;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as T;
    }
    throw new Error("The model did not return valid JSON.");
  }
}

const evidenceResponseFormat = {
  type: "json_schema",
  json_schema: {
    name: "pdf_autofill_evidence",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        facts: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              label: { type: "string" },
              value: { type: "string" },
              sourceQuote: { type: "string" },
            },
            required: ["label", "value", "sourceQuote"],
          },
        },
        warnings: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["facts", "warnings"],
    },
  },
} as const;

const fieldMappingResponseFormat = {
  type: "json_schema",
  json_schema: {
    name: "pdf_field_mapping",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        documentTitle: { type: "string" },
        fieldValues: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              fieldName: { type: "string" },
              value: { type: "string" },
              confidence: { type: "number" },
              sourceQuote: { type: "string" },
              reasoning: { type: "string" },
            },
            required: ["fieldName", "value", "confidence", "sourceQuote", "reasoning"],
          },
        },
        unfilledFields: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              fieldName: { type: "string" },
              reason: { type: "string" },
              followUpQuestion: { type: "string" },
            },
            required: ["fieldName", "reason", "followUpQuestion"],
          },
        },
        summary: {
          type: "object",
          additionalProperties: false,
          properties: {
            extractedFacts: {
              type: "array",
              items: { type: "string" },
            },
            assumptions: {
              type: "array",
              items: { type: "string" },
            },
            warnings: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["extractedFacts", "assumptions", "warnings"],
        },
      },
      required: ["documentTitle", "fieldValues", "unfilledFields", "summary"],
    },
  },
} as const;

const overlayResponseFormat = {
  type: "json_schema",
  json_schema: {
    name: "pdf_overlay_mapping",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        documentTitle: { type: "string" },
        overlays: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              label: { type: "string" },
              value: { type: "string" },
              pageIndex: { type: "number" },
              x: { type: "number" },
              y: { type: "number" },
              width: { type: "number" },
              height: { type: "number" },
              fontSize: { type: "number" },
              kind: { type: "string", enum: ["text", "checkbox"] },
              confidence: { type: "number" },
              sourceQuote: { type: "string" },
              reasoning: { type: "string" },
            },
            required: [
              "label",
              "value",
              "pageIndex",
              "x",
              "y",
              "width",
              "height",
              "fontSize",
              "kind",
              "confidence",
              "sourceQuote",
              "reasoning",
            ],
          },
        },
        unfilledFields: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              fieldName: { type: "string" },
              reason: { type: "string" },
              followUpQuestion: { type: "string" },
            },
            required: ["fieldName", "reason", "followUpQuestion"],
          },
        },
        summary: {
          type: "object",
          additionalProperties: false,
          properties: {
            extractedFacts: {
              type: "array",
              items: { type: "string" },
            },
            assumptions: {
              type: "array",
              items: { type: "string" },
            },
            warnings: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["extractedFacts", "assumptions", "warnings"],
        },
      },
      required: ["documentTitle", "overlays", "unfilledFields", "summary"],
    },
  },
} as const;

async function transcribeVoiceNote(openai: OpenAI, file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const upload = await toFile(buffer, file.name || "voice-note.webm", {
    type: file.type || "audio/webm",
  });

  const transcription = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file: upload,
  });

  return transcription.text || "";
}

async function readSupportingFiles(files: File[]): Promise<{ contextBlocks: string[]; warnings: string[] }> {
  const contextBlocks: string[] = [];
  const warnings: string[] = [];

  for (const file of files) {
    if (file.size > MAX_CONTEXT_BYTES) {
      warnings.push(`${file.name} was skipped because it is larger than 3MB.`);
      continue;
    }

    if (isPdf(file)) {
      const text = await extractPdfTextPreview(new Uint8Array(await file.arrayBuffer()));
      if (text.trim()) {
        contextBlocks.push(`<pdf_source name="${file.name}">\n${limitText(text, 7000)}\n</pdf_source>`);
      } else {
        warnings.push(`${file.name} did not expose readable text; paste its contents into notes if needed.`);
      }
      continue;
    }

    if (!isTextLike(file)) {
      warnings.push(`${file.name} was not parsed; upload text, markdown, CSV, JSON, EML, or paste its contents into notes.`);
      continue;
    }

    const text = await file.text();
    contextBlocks.push(`<file name="${file.name}">\n${limitText(text, 6000)}\n</file>`);
  }

  return { contextBlocks, warnings };
}

function fieldListForModel(fields: PdfFieldDescriptor[]): PdfFieldDescriptor[] {
  return fields
    .filter((field) => !field.readOnly)
    .map((field) => ({
      name: field.name,
      type: field.type,
      options: field.options,
      readOnly: field.readOnly,
      visualOrder: field.visualOrder,
      nameHints: field.nameHints,
      isMessyName: field.isMessyName,
      pageIndex: field.pageIndex,
      position: field.position,
      rect: field.rect,
      widgets: field.widgets,
      nearbyText: field.nearbyText,
    }));
}

function fieldBatchesForModel(fields: PdfFieldDescriptor[]): PdfFieldDescriptor[][] {
  const usableFields = fieldListForModel(fields).slice(0, MAX_FIELDS_FOR_MODEL);
  const byPage = new Map<number, PdfFieldDescriptor[]>();

  for (const field of usableFields) {
    const page = field.pageIndex ?? Number.MAX_SAFE_INTEGER;
    byPage.set(page, [...(byPage.get(page) || []), field]);
  }

  const batches: PdfFieldDescriptor[][] = [];
  const sortedPages = [...byPage.keys()].sort((a, b) => a - b);
  for (const page of sortedPages) {
    const pageFields = byPage.get(page) || [];
    for (let index = 0; index < pageFields.length; index += MAX_FIELDS_PER_MODEL_BATCH) {
      batches.push(pageFields.slice(index, index + MAX_FIELDS_PER_MODEL_BATCH));
    }
  }

  return batches.slice(0, MAX_FIELD_BATCHES);
}

function pageSummariesForFields(
  descriptor: Awaited<ReturnType<typeof inspectPdfForm>>,
  fields: PdfFieldDescriptor[]
) {
  const pageIndexes = Array.from(
    new Set(fields.map((field) => field.pageIndex).filter((page): page is number => page !== undefined))
  );

  return pageIndexes.map((pageIndex) => descriptor.pages[pageIndex]).filter(Boolean);
}

function mergeAutofillResponses(responses: ModelAutofillResponse[]): ModelAutofillResponse {
  const bestFieldValues = new Map<string, ModelFieldValue>();

  for (const response of responses) {
    for (const field of response.fieldValues || []) {
      if (!field.fieldName) continue;
      const previous = bestFieldValues.get(field.fieldName);
      if ((previous?.confidence ?? 0) >= 2) continue;
      if (!previous || (field.confidence ?? 0) > (previous.confidence ?? 0)) {
        bestFieldValues.set(field.fieldName, field);
      }
    }
  }

  return {
    documentTitle: responses.find((response) => response.documentTitle)?.documentTitle,
    fieldValues: [...bestFieldValues.values()],
    unfilledFields: responses.flatMap((response) => response.unfilledFields || []),
    summary: {
      extractedFacts: Array.from(new Set(responses.flatMap((response) => response.summary?.extractedFacts || []))),
      assumptions: Array.from(new Set(responses.flatMap((response) => response.summary?.assumptions || []))),
      warnings: Array.from(new Set(responses.flatMap((response) => response.summary?.warnings || []))),
    },
  };
}

function compactEvidence(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function descriptorText(field: PdfFieldDescriptor): string {
  return [field.name, ...(field.nearbyText || [])].join(" ");
}

function isForbiddenField(field: PdfFieldDescriptor): boolean {
  const text = descriptorText(field);
  const normalizedName = field.name.trim().toLowerCase();

  return (
    /\b(signature|sign here|initials?|attestation|certification|perjury|reviewed by)\b/i.test(text) ||
    /\b(tenant|landlord|guarantor|agent)\s+date\b/i.test(text) ||
    /\bdate\s+(tenant|landlord|guarantor|agent)\b/i.test(text) ||
    (/^date(?:_\d+)?$/.test(normalizedName) && /\bpremises:\s*date\b/i.test(text)) ||
    (/^(landlord|tenant)(?:[_\s-]?\d+)?$/.test(normalizedName) &&
      !/\bagree as follows\b/i.test(text) &&
      !/\bnamed person/i.test(text)) ||
    /^(undefined(?:_\d+)?|or(?:_\d+)?|and(?:_\d+)?|at(?:_\d+)?|am|pm|\d+(?:_\d+)?)$/.test(normalizedName) ||
    (/^name(?:_\d+)?$/.test(normalizedName) && /\bphone\b|\baddress\b|\bpayment\b|\bpaid\b/i.test(text))
  );
}

function isFalseValue(value: unknown): boolean {
  return ["false", "no", "n", "0", "unchecked", "off"].includes(String(value).trim().toLowerCase());
}

function isTextValueSupportedByEvidence(value: unknown, evidenceText: string): boolean {
  const compactValue = compactEvidence(String(value || ""));
  if (!compactValue) return false;
  if (compactValue.length <= 2) return false;

  const compactSource = compactEvidence(evidenceText);
  return compactSource.includes(compactValue);
}

function isFieldTopicSupported(field: PdfFieldDescriptor, evidenceText: string): boolean {
  const text = [field.name, ...(field.nearbyText || []).slice(0, 1)].join(" ");
  const topicRequirements: Array<{ field: RegExp; evidence: RegExp }> = [
    { field: /\bsecurity deposit\b/i, evidence: /\bsecurity deposit\b|\bdeposit\b/i },
    { field: /\bpersonal property\b/i, evidence: /\bpersonal property\b|\bappliance|furniture|fixture/i },
    { field: /\bparking\b/i, evidence: /\bparking\b/i },
    { field: /\bstorage\b/i, evidence: /\bstorage\b/i },
    { field: /\butilities\b/i, evidence: /\butilities?\b/i },
    { field: /\bcommencement date falls\b|\bpaid one full month/i, evidence: /\bprorat|\badvance\b|\bsecond calendar\b|\brent payable day\b/i },
    { field: /\badditional sum\b|\bshall pay to landlord respectively\b/i, evidence: /\badditional sum\b|\badditional rent\b|\bprorat|\badvance\b|\bpayment schedule\b/i },
    { field: /\bneighborhood\b/i, evidence: /\bneighborhood\b/i },
    { field: /\bkeys?\b|\blocks?\b|\brekey/i, evidence: /\bkeys?\b|\blocks?\b|\brekey/i },
    { field: /\blate charge\b|\bnsf\b|\breturned check\b/i, evidence: /\blate charge\b|\bnsf\b|\breturned check\b/i },
    { field: /\bpets?\b/i, evidence: /\bpets?\b|animal/i },
    { field: /\bhoa\b|\bhomeowners/i, evidence: /\bhoa\b|\bhomeowners/i },
    { field: /\bagency relationships?\b|\bdisclosure\b/i, evidence: /\bagency relationships?\b|\bdisclosure\b/i },
    { field: /\bbroker\b|\bleasing firm\b|\blisting firm\b|\bleasing agent\b|\blisting agent\b|\bagent print firm\b/i, evidence: /\bbroker\b|\bleasing firm\b|\blisting firm\b|\bleasing agent\b|\blisting agent\b|\bagent firm\b/i },
    { field: /\bguarantor\b|\bguarantee\b/i, evidence: /\bguarantor\b|\bguarantee\b/i },
    { field: /\bmove-?in\b/i, evidence: /\bmove-?in\b/i },
    { field: /\bD\.\s*PAYMENT\b|\bpaid by\b|\bpayee\b|\bpersonal check\b|\bmoney order\b|\bcashier/i, evidence: /\bpayee\b|\bpayment\b|\bpaid by\b|\bpersonal check\b|\bmoney order\b|\bcashier/i },
  ];

  return topicRequirements.every((requirement) => !requirement.field.test(text) || requirement.evidence.test(evidenceText));
}

function isExplicitCheckboxSupported(field: PdfFieldDescriptor, evidenceText: string): boolean {
  if (
    field.name.trim().toLowerCase() === "b" &&
    /\blease\b/i.test(descriptorText(field)) &&
    /\blease\b|\bterm\b|\bstarts?\b|\bends?\b/i.test(evidenceText)
  ) {
    return true;
  }

  const stopWords = new Set([
    "the",
    "and",
    "or",
    "if",
    "is",
    "are",
    "be",
    "to",
    "of",
    "by",
    "for",
    "with",
    "date",
    "tenant",
    "landlord",
    "premises",
    "agreement",
    "shall",
    "will",
    "rent",
    "month",
    "property",
    "personal",
    "right",
    "rights",
    "included",
    "provided",
    "other",
    "form",
    "check",
    "from",
    "under",
    "paragraph",
    "following",
    "attached",
    "supplements",
    "terms",
    "conditions",
    "lease",
    "term",
    "year",
    "real",
    "estate",
  ]);
  const evidence = new Set(
    evidenceText
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .filter(Boolean)
  );
  const tokens = descriptorText(field)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 3)
    .filter((token) => !stopWords.has(token));

  return tokens.filter((token) => evidence.has(token)).length >= 2;
}

function isSupportedRequestedFill(
  field: ModelFieldValue,
  descriptor: PdfFieldDescriptor | undefined,
  evidenceText: string
): boolean {
  if (!descriptor || isForbiddenField(descriptor)) return false;

  if (descriptor.type === "checkbox" || descriptor.type === "radio") {
    if (isFalseValue(field.value)) return false;
    return isExplicitCheckboxSupported(descriptor, evidenceText);
  }

  return isFieldTopicSupported(descriptor, evidenceText) && isTextValueSupportedByEvidence(field.value, evidenceText);
}

function findFactValue(facts: ModelEvidenceFact[], labelPattern: RegExp, valuePattern?: RegExp): string | undefined {
  return facts.find((fact) => labelPattern.test(fact.label) && (!valuePattern || valuePattern.test(fact.value)))?.value;
}

function buildHeuristicLeaseFills(
  descriptor: Awaited<ReturnType<typeof inspectPdfForm>>,
  facts: ModelEvidenceFact[],
  evidenceText: string
): ModelFieldValue[] {
  const landlord = findFactValue(facts, /\b(landlord|lessor|owner)\b/i);
  const tenants =
    findFactValue(facts, /\b(tenants|lessees|renters)\b/i) ||
    facts
      .filter((fact) => /\b(tenant|lessee|renter)\b/i.test(fact.label))
      .map((fact) => fact.value)
      .filter(Boolean)
      .join(" and ");
  const premises = findFactValue(facts, /\b(premises|property|address)\b/i);
  const startDate = findFactValue(facts, /\b(start|commencement|begin|term begins)\b/i);
  const endDate = findFactValue(facts, /\b(end|terminate|termination|expires?)\b/i);
  const monthlyRent =
    findFactValue(facts, /\b(monthly rent|rent)\b/i, /\d/) ||
    evidenceText.match(/\b(?:monthly\s+)?rent\s+(?:is|of|equals|=)?\s*\$?\s*([0-9][0-9,]*(?:\.\d{2})?)/i)?.[1];
  const fills: ModelFieldValue[] = [];

  function push(fieldName: string, value: string, reason: string) {
    fills.push({
      fieldName,
      value,
      confidence: 2,
      sourceQuote: value,
      reasoning: reason,
    });
  }

  for (const field of descriptor.fields) {
    if (field.readOnly || isForbiddenField(field)) continue;
    const text = descriptorText(field);
    const fieldName = field.name.toLowerCase();

    if (field.type === "checkbox") {
      if (endDate && /\blease\b/i.test(text) && /\bterminate\b/i.test(text)) {
        push(field.name, "true", "Fixed lease term includes an end date.");
      }
      continue;
    }

    if (field.type !== "text") continue;
    if (landlord && /^landlord\b/i.test(field.name) && /\bagree as follows\b/i.test(text)) {
      push(field.name, landlord, "Party line asks for landlord.");
    } else if (tenants && /^tenant\b/i.test(field.name) && /\bagree as follows\b/i.test(text)) {
      push(field.name, tenants, "Party line asks for tenant.");
    } else if (premises && /^premises(?:_\d+)?$/i.test(field.name)) {
      push(field.name, premises, "Premises field asks for property address.");
    } else if (tenants && /\bnamed person/i.test(field.name) && /sole use|named persons|following named/i.test(fieldName)) {
      push(field.name, tenants, "Occupant line asks for named persons.");
    } else if (premises && /\breal property\b/i.test(text)) {
      push(field.name, premises, "Premises field asks for property address.");
    } else if (startDate && /\bterm begins\b/i.test(text)) {
      push(field.name, startDate, "Term field asks for commencement date.");
    } else if (endDate && /\blease\b/i.test(text) && /\bterminate\b/i.test(text)) {
      push(field.name, endDate, "Lease field asks for termination date.");
    } else if (
      monthlyRent &&
      /\btenant agrees to pay\b/i.test(text) &&
      /\b(per month|rent)\b/i.test(text) &&
      !/\bsecurity deposit\b/i.test([field.name, field.nearbyText?.[0] || ""].join(" "))
    ) {
      push(field.name, monthlyRent, "Rent clause asks for monthly rent.");
    }
  }

  return fills;
}

async function extractEvidenceFacts(openai: OpenAI, contextBlocks: string[]): Promise<ModelEvidenceResponse> {
  const response = await openai.chat.completions.create({
    model: process.env.PDF_FACT_MODEL || process.env.PDF_AUTOFILL_MODEL || DEFAULT_OPENAI_CHAT_MODEL,
    temperature: 0,
    response_format: evidenceResponseFormat,
    messages: [
      {
        role: "system",
        content: `Extract every atomic fact that may help fill a PDF form.

Rules:
- Preserve names, organizations, addresses, dates, money amounts, lease/rent terms, contact info, options, and yes/no facts.
- Split combined descriptions into separate facts. Example: landlord, tenant, start date, end date, rent, and security deposit should be separate facts.
- Keep values concise and form-ready.
- Use only supplied evidence. Do not infer signatures, initials, attestations, legal IDs, or account numbers.
- Return structured JSON only.`,
      },
      {
        role: "user",
        content: `Evidence:
${contextBlocks.join("\n\n")}`,
      },
    ],
  });

  return parseModelJson<ModelEvidenceResponse>(response.choices[0]?.message?.content || "{}");
}

async function mapFieldsForBatch({
  openai,
  descriptor,
  fields,
  contextBlocks,
  evidenceFacts,
  batchIndex,
  batchCount,
  omittedFieldCount,
}: {
  openai: OpenAI;
  descriptor: Awaited<ReturnType<typeof inspectPdfForm>>;
  fields: PdfFieldDescriptor[];
  contextBlocks: string[];
  evidenceFacts: ModelEvidenceFact[];
  batchIndex: number;
  batchCount: number;
  omittedFieldCount: number;
}): Promise<ModelAutofillResponse> {
  const response = await openai.chat.completions.create({
    model: process.env.PDF_AUTOFILL_MODEL || DEFAULT_OPENAI_CHAT_MODEL,
    temperature: 0,
    response_format: fieldMappingResponseFormat,
    messages: [
      {
        role: "system",
        content: `You are a careful PDF form filling agent.

Map user-provided evidence into the exact PDF field names supplied by the application.

Rules:
- Use only fieldName values from the supplied batch.
- This is batch ${batchIndex + 1} of ${batchCount}. Treat it independently and fill every supported field in this batch.
- Field names may be generated, cryptic, duplicated, or partial text from the document. Use visualOrder, pageIndex, rect, nearbyText, position, and page text to infer what each blank means.
- For clauses split across adjacent blanks, fill each blank by local reading order. Example: a line reading "(Landlord) and (Tenant) agree..." usually has separate landlord and tenant fields.
- Common lease aliases: landlord/owner/lessor, tenant/lessee/renter, commencement/start date, termination/end date, rent/monthly rent, security deposit.
- Do not invent facts, account numbers, tax IDs, signatures, initials, legal attestations, or certification/perjury answers.
- Fill a field only when evidence or extracted facts directly support it.
- Use concise values that belong in a PDF field, not prose.
- For checkbox fields, return "true" only when the evidence clearly selects the checkbox. Return "false" only when the field must be explicitly unchecked.
- For dropdown, option_list, and radio fields, choose one of the supplied options when options exist.
- Do not list every irrelevant blank as unfilled. Report unfilled fields only when they appear important and source evidence is missing.`,
      },
      {
        role: "user",
        content: `PDF metadata:
${JSON.stringify({ title: descriptor.title, author: descriptor.author, subject: descriptor.subject, fieldCount: descriptor.fieldCount, omittedFieldCount, fieldNameQuality: descriptor.fieldNameQuality }, null, 2)}

PDF page text and dimensions for this batch:
${JSON.stringify(pageSummariesForFields(descriptor, fields), null, 2)}

Extracted evidence facts:
${JSON.stringify(evidenceFacts, null, 2)}

Fillable PDF fields for this batch:
${JSON.stringify(fields, null, 2)}

Original evidence:
${contextBlocks.join("\n\n")}`,
      },
    ],
  });

  return parseModelJson<ModelAutofillResponse>(response.choices[0]?.message?.content || "{}");
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

function outputFileName(inputName: string): string {
  const withoutPdf = inputName.replace(/\.pdf$/i, "");
  return `${withoutPdf || "filled-form"}-filled.pdf`;
}

function isForbiddenOverlayLabel(label: string): boolean {
  return /\b(signature|sign here|initials?|attestation|certification|perjury)\b/i.test(label);
}

function clampUnit(value: unknown): number | null {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.min(1, Math.max(0, number));
}

function roundUnit(value: number): number {
  return Math.round(value * 1000) / 1000;
}

async function fillFlatPdfOverlay({
  openai,
  templateBytes,
  templateName,
  descriptor,
  contextBlocks,
  warnings,
}: {
  openai: OpenAI;
  templateBytes: Uint8Array;
  templateName: string;
  descriptor: Awaited<ReturnType<typeof inspectPdfForm>>;
  contextBlocks: string[];
  warnings: string[];
}) {
  const pageImages = await renderPdfPageImages(templateBytes, {
    maxPages: MAX_FLAT_OVERLAY_PAGES,
    scale: 1.5,
    includeCoordinateGrid: true,
  });

  if (pageImages.length === 0) {
    return NextResponse.json({
      status: "no_fillable_fields",
      message: "This PDF has no fillable fields, and its pages could not be rendered for overlay filling.",
      document: descriptor,
      summary: {
        warnings,
      },
    });
  }

  const pageSummaries = descriptor.pages.slice(0, MAX_FLAT_OVERLAY_PAGES).map((page) => ({
    pageIndex: page.pageIndex,
    width: page.width,
    height: page.height,
    textPreview: page.textPreview,
    textLines: (page.textLines || []).slice(0, 140).map((line) => ({
      text: line.text,
      x: line.x === undefined ? undefined : roundUnit(line.x / page.width),
      y: roundUnit(1 - line.y / page.height),
      width: line.width === undefined ? undefined : roundUnit(line.width / page.width),
      height: line.height === undefined ? undefined : roundUnit(line.height / page.height),
    })),
  }));
  const imageSummaries = pageImages.map(({ dataUrl: _dataUrl, mimeType: _mimeType, ...image }) => image);

  const response = await openai.chat.completions.create({
    model: process.env.PDF_OVERLAY_MODEL || process.env.PDF_AUTOFILL_MODEL || DEFAULT_OPENAI_CHAT_MODEL,
    temperature: 0.05,
    response_format: overlayResponseFormat,
    messages: [
      {
        role: "system",
        content: `You are a careful PDF overlay form filling agent.

The PDF has no fillable AcroForm fields. You must propose text overlays on top of the original PDF pages.

Rules:
- Use only evidence supplied by the user. Do not invent values.
- Never overlay signatures, initials, attestations, or certification/perjury confirmations.
- Do not overlay tax IDs, account numbers, legal identifiers, or similar sensitive identifiers unless explicitly provided.
- Only place overlays in visible blank answer areas: underlines, empty boxes, empty table cells, or open form spaces meant to receive user input.
- Do not draw on top of existing completed prose, instructions, sample values, boilerplate clauses, headings, labels, or signatures.
- If a fact has no visible blank answer area, return it as unfilled instead of forcing a placement.
- The page images include a light coordinate grid labeled from 0.00 to 1.00 on both axes.
- Use normalized coordinates from the TOP-LEFT of the full page image, including margins: x and y must be between 0 and 1.
- For text overlays, put x/y at the top-left of the blank answer area, just inside the line or box.
- Use the grid labels to estimate placement. Page text is helper context only; the page image is the layout source of truth.
- When page textLines are available, their x/y/width/height are also normalized from the TOP-LEFT and can be used to align overlays near labels.
- For checkboxes, use kind "checkbox", value "true", and place x/y near the center of the target box.
- For printed choice tables or rating scales, do not write the selected printed option as text; use kind "checkbox" with value "true" at the center of the selected option cell.
- Return JSON only, with this shape:
{
  "documentTitle": "human readable form name",
  "overlays": [
    { "label": "visible field label", "value": "value to draw", "pageIndex": 0, "x": 0.1, "y": 0.2, "width": 0.3, "height": 0.03, "fontSize": 10, "kind": "text", "confidence": 0.0, "sourceQuote": "short evidence quote", "reasoning": "short placement reason" }
  ],
  "unfilledFields": [
    { "fieldName": "visible field label", "reason": "why missing", "followUpQuestion": "one concise question" }
  ],
  "summary": {
    "extractedFacts": ["important facts used"],
    "assumptions": [],
    "warnings": ["placement risks or low-confidence items"]
  }
}`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `PDF metadata:
${JSON.stringify({ title: descriptor.title, author: descriptor.author, subject: descriptor.subject, pageCount: descriptor.pages.length }, null, 2)}

PDF page text and dimensions:
${JSON.stringify(pageSummaries, null, 2)}

Rendered page image coordinate spaces:
${JSON.stringify(imageSummaries, null, 2)}

Evidence:
${contextBlocks.join("\n\n")}`,
          },
          ...pageImages.map((image) => ({
            type: "image_url" as const,
            image_url: {
              url: image.dataUrl,
              detail: "high" as const,
            },
          })),
        ],
      },
    ],
  });

  const raw = response.choices[0]?.message?.content || "{}";
  const parsed = parseModelJson<ModelOverlayResponse>(raw);
  const requestedOverlays: PdfOverlayInput[] = [];

  for (const overlay of parsed.overlays || []) {
    if (!overlay.label || isForbiddenOverlayLabel(overlay.label)) continue;
    if (typeof overlay.confidence === "number" && overlay.confidence < 0.5) continue;

    const x = clampUnit(overlay.x);
    const y = clampUnit(overlay.y);
    if (x === null || y === null) continue;
    const pageIndex = Math.max(0, Math.min(pageImages.length - 1, Math.floor(Number(overlay.pageIndex) || 0)));
    const pageImage = pageImages[pageIndex];

    requestedOverlays.push({
      label: overlay.label,
      value: overlay.value,
      pageIndex,
      x,
      y,
      width: clampUnit(overlay.width) ?? 0.28,
      height: clampUnit(overlay.height) ?? undefined,
      fontSize: overlay.fontSize,
      kind: overlay.kind === "checkbox" ? "checkbox" : "text",
      confidence: overlay.confidence,
      coordinateSpace: pageImage
        ? {
            width: pageImage.width,
            height: pageImage.height,
            scale: pageImage.scale,
            transform: pageImage.transform,
          }
        : undefined,
    });
  }

  const filled = await fillPdfOverlay(templateBytes, requestedOverlays);
  const pdfBase64 = Buffer.from(filled.pdfBytes).toString("base64");

  return NextResponse.json({
    status: "filled",
    mode: "flat_overlay",
    fileName: outputFileName(templateName),
    pdfBase64,
    mimeType: "application/pdf",
    document: descriptor,
    attemptedCount: requestedOverlays.length,
    filledCount: filled.applied.length,
    appliedFields: filled.applied,
    skippedFields: filled.skipped,
    unfilledFields: parsed.unfilledFields || [],
    summary: {
      extractedFacts: parsed.summary?.extractedFacts || [],
      assumptions: parsed.summary?.assumptions || [],
      warnings: [
        "Flat PDF overlay mode was used because this PDF has no fillable fields. Review placement before sending.",
        ...(parsed.summary?.warnings || []),
        ...warnings,
      ],
    },
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const template = formData.get("template");
    const intent = String(formData.get("intent") || "fill");
    const notes = String(formData.get("notes") || "").trim();
    const voiceNote = formData.get("voiceNote");
    const supportingFiles = formData.getAll("supportingFiles").filter(isFile);

    if (!isFile(template) || !isPdf(template)) {
      return NextResponse.json({ error: "Upload a PDF template." }, { status: 400 });
    }

    if (template.size > MAX_TEMPLATE_BYTES) {
      return NextResponse.json({ error: "PDF templates must be 12MB or smaller." }, { status: 400 });
    }

    const templateBytes = Buffer.from(await template.arrayBuffer());
    const descriptor = await inspectPdfForm(templateBytes);

    if (intent === "inspect") {
      return NextResponse.json({
        status: "inspected",
        mode: descriptor.fieldCount === 0 ? "flat_overlay" : "acroform",
        message:
          descriptor.fieldCount === 0
            ? "No embedded PDF fields found. Generation will use visual overlay mode when source context is available."
            : `${descriptor.fieldCount} PDF fields detected.`,
        document: {
          ...descriptor,
          fields: descriptor.fields.slice(0, 500),
        },
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          status: "missing_api_key",
          message: "OPENAI_API_KEY is required to extract notes into PDF fields or flat-PDF overlays.",
          document: descriptor,
        },
        { status: 200 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const contextBlocks: string[] = [];
    const warnings: string[] = [];

    if (notes) {
      contextBlocks.push(`<notes>\n${limitText(notes)}\n</notes>`);
    }

    if (isFile(voiceNote) && voiceNote.size > 0) {
      if (!isAudio(voiceNote)) {
        warnings.push(`${voiceNote.name} was not transcribed because it is not an audio file.`);
      } else if (voiceNote.size > MAX_CONTEXT_BYTES * 6) {
        warnings.push(`${voiceNote.name} was not transcribed because it is larger than 18MB.`);
      } else {
        const transcript = await transcribeVoiceNote(openai, voiceNote);
        if (transcript.trim()) {
          contextBlocks.push(`<voice_transcript name="${voiceNote.name}">\n${limitText(transcript, 9000)}\n</voice_transcript>`);
        }
      }
    }

    const supporting = await readSupportingFiles(supportingFiles);
    contextBlocks.push(...supporting.contextBlocks);
    warnings.push(...supporting.warnings);

    if (contextBlocks.length === 0) {
      return NextResponse.json({ error: "Add notes, a transcript, a voice note, or a text attachment." }, { status: 400 });
    }

    if (descriptor.fieldCount === 0) {
      return fillFlatPdfOverlay({
        openai,
        templateBytes,
        templateName: template.name,
        descriptor,
        contextBlocks,
        warnings,
      });
    }

    const modelBatches = fieldBatchesForModel(descriptor.fields);
    const modelFieldCount = modelBatches.reduce((count, batch) => count + batch.length, 0);
    const omittedFieldCount = Math.max(0, descriptor.fields.filter((field) => !field.readOnly).length - modelFieldCount);
    const evidence = await extractEvidenceFacts(openai, contextBlocks);
    warnings.push(...(evidence.warnings || []));

    const batchResponses = await mapWithConcurrency(
      modelBatches,
      MAX_FIELD_BATCH_CONCURRENCY,
      (batch, batchIndex) =>
        mapFieldsForBatch({
          openai,
          descriptor,
          fields: batch,
          contextBlocks,
          evidenceFacts: evidence.facts || [],
          batchIndex,
          batchCount: modelBatches.length,
          omittedFieldCount,
        })
    );

    const heuristicFills = buildHeuristicLeaseFills(descriptor, evidence.facts || [], contextBlocks.join("\n\n"));
    const parsed = mergeAutofillResponses([
      {
        fieldValues: heuristicFills,
        unfilledFields: [],
        summary: {
          extractedFacts: [],
          assumptions: [],
          warnings: [],
        },
      },
      ...batchResponses,
    ]);
    const fieldByName = new Map(descriptor.fields.map((field) => [field.name, field]));
    const fieldNames = new Set(fieldByName.keys());
    const evidenceText = contextBlocks.join("\n\n");
    const requestedFills: FieldFillInput[] = (parsed.fieldValues || [])
      .filter((field) => field.fieldName && fieldNames.has(field.fieldName))
      .filter((field) => isSupportedRequestedFill(field, fieldByName.get(field.fieldName), evidenceText))
      .filter((field) => typeof field.confidence !== "number" || field.confidence >= 0.45)
      .map((field) => ({
        fieldName: field.fieldName,
        value: field.value,
        confidence: field.confidence,
      }));

    const filled = await fillPdfForm(templateBytes, requestedFills);
    const pdfBase64 = Buffer.from(filled.pdfBytes).toString("base64");

    return NextResponse.json({
      status: "filled",
      fileName: outputFileName(template.name),
      pdfBase64,
      mimeType: "application/pdf",
      document: {
        ...descriptor,
        fields: descriptor.fields.slice(0, 500),
      },
      attemptedCount: requestedFills.length,
      filledCount: filled.applied.length,
      appliedFields: filled.applied,
      skippedFields: filled.skipped,
      unfilledFields: parsed.unfilledFields || [],
      summary: {
        extractedFacts: [
          ...(evidence.facts || []).map((fact) => `${fact.label}: ${fact.value}`),
          ...(parsed.summary?.extractedFacts || []),
        ],
        assumptions: parsed.summary?.assumptions || [],
        warnings: [
          ...(omittedFieldCount > 0 ? [`${omittedFieldCount} fields were omitted from AI mapping due to field-count limits.`] : []),
          ...(parsed.summary?.warnings || []),
          ...warnings,
        ],
      },
    });
  } catch (error) {
    console.error("PDF autofill error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fill PDF.",
      },
      { status: 500 }
    );
  }
}
