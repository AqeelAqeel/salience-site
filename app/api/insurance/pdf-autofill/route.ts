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
  type PdfPageDescriptor,
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
const MAX_FLAT_FIELD_CANDIDATES = 220;
const MIN_FLAT_TEXT_GAP = 32;
const MAX_CANDIDATES_PER_FACT = 12;
const MAX_FACTS_FOR_FIELD_MATCHING = 36;

const valueKindValues = ["person", "organization", "address", "date", "money", "phone", "email", "option", "free_text", "unknown"] as const;
type FieldValueKind = (typeof valueKindValues)[number];

interface ModelFieldValue {
  fieldName: string;
  value: string | number | boolean | string[] | null;
  confidence: number;
  sourceQuote?: string;
  reasoning?: string;
  visualLabel?: string;
  valueKind?: string;
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
  valueKind: FieldValueKind;
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

interface FieldIntent {
  id: string;
  fieldName: string;
  type: PdfFieldDescriptor["type"];
  pageIndex?: number;
  rect?: PdfFieldDescriptor["rect"];
  visualLabel: string;
  visualPrompt: string;
  expectedValueKind: FieldValueKind;
  controlGroup?: string;
  doNotFillReason?: string;
  descriptor: PdfFieldDescriptor;
}

interface FieldCandidate {
  fieldId: string;
  fieldName: string;
  type: PdfFieldDescriptor["type"];
  visualLabel: string;
  visualPrompt: string;
  expectedValueKind: FieldValueKind;
  pageIndex?: number;
  controlGroup?: string;
  blankRoleLabel?: string;
  optionLabel?: string;
  score: number;
}

interface FlatFieldIntent {
  id: string;
  fieldName: string;
  type: "text" | "checkbox";
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height?: number;
  fontSize: number;
  visualLabel: string;
  visualPrompt: string;
  expectedValueKind: FieldValueKind;
  nearbyText: string[];
  controlGroup?: string;
  optionLabel?: string;
  doNotFillReason?: string;
}

interface FlatFieldCandidate {
  fieldId: string;
  fieldName: string;
  type: "text" | "checkbox";
  visualLabel: string;
  visualPrompt: string;
  expectedValueKind: FieldValueKind;
  pageIndex: number;
  optionLabel?: string;
  score: number;
}

interface ModelCandidateDecision {
  factIndex: number;
  fieldIds: string[];
  value: string;
  confidence: number;
  sourceQuote: string;
  reasoning: string;
}

interface ModelCandidateResponse {
  decisions?: ModelCandidateDecision[];
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
              valueKind: { type: "string", enum: [...valueKindValues] },
              sourceQuote: { type: "string" },
            },
            required: ["label", "value", "valueKind", "sourceQuote"],
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

const candidateDecisionResponseFormat = {
  type: "json_schema",
  json_schema: {
    name: "pdf_candidate_field_decisions",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        decisions: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              factIndex: { type: "number" },
              fieldIds: {
                type: "array",
                items: { type: "string" },
              },
              value: { type: "string" },
              confidence: { type: "number" },
              sourceQuote: { type: "string" },
              reasoning: { type: "string" },
            },
            required: ["factIndex", "fieldIds", "value", "confidence", "sourceQuote", "reasoning"],
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
      required: ["decisions", "unfilledFields", "summary"],
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
  const nearbyText = (field.nearbyText || []).slice(0, 2).join(" ");
  const isBareSingleLabel = matchTokens(field.name).size === 1 && !LOW_SIGNAL_MATCH_TOKENS.has([...matchTokens(field.name)][0]);

  return (
    /\b(signature|sign here|initials?|attestation|certification|perjury|reviewed by)\b/i.test(text) ||
    /\b(signed|signer|reviewed|approved|authorized|witnessed)\s+date\b/i.test(text) ||
    /\bdate\s+(signed|signer|reviewed|approved|authorized|witnessed)\b/i.test(text) ||
    (isBareSingleLabel && /\b(date|address|city|state|zip|postal|telephone|phone|fax|email)\b/i.test(nearbyText)) ||
    /^(undefined(?:_\d+)?|or(?:_\d+)?|and(?:_\d+)?|at(?:_\d+)?|am|pm|\d+(?:_\d+)?)$/.test(normalizedName) ||
    (/^name(?:_\d+)?$/.test(normalizedName) && /\bphone\b|\baddress\b|\bpayment\b|\bpaid\b/i.test(text))
  );
}

function isFalseValue(value: unknown): boolean {
  return ["false", "no", "n", "0", "unchecked", "off"].includes(String(value).trim().toLowerCase());
}

function cleanModelScalarValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  return value.trim().replace(/^['"`]\s*(?=[A-Za-z0-9$])/, "").replace(/(?<=[A-Za-z0-9])\s*['"`]$/, "");
}

function isTextValueSupportedByEvidence(value: unknown, evidenceText: string): boolean {
  const compactValue = compactEvidence(String(value || ""));
  if (!compactValue) return false;
  if (compactValue.length <= 2) return false;

  const compactSource = compactEvidence(evidenceText);
  return compactSource.includes(compactValue);
}

const MATCH_STOP_WORDS = new Set([
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
    "shall",
    "will",
    "agreement",
    "document",
    "form",
    "field",
    "line",
    "blank",
    "section",
    "page",
    "print",
    "enter",
    "write",
    "select",
    "check",
    "right",
    "rights",
    "included",
    "provided",
    "other",
    "from",
    "under",
    "paragraph",
    "following",
    "attached",
    "supplements",
    "terms",
    "conditions",
    "term",
    "year",
    "true",
    "false",
]);

const LOW_SIGNAL_MATCH_TOKENS = new Set([
  "name",
  "address",
  "city",
  "state",
  "zip",
  "postal",
  "phone",
  "telephone",
  "fax",
  "email",
  "date",
  "amount",
  "money",
  "total",
  "location",
]);

function baseMatchToken(token: string): string {
  let normalized = token.toLowerCase().replace(/[^a-z0-9]+/g, "");
  if (normalized.endsWith("ies") && normalized.length > 4) normalized = `${normalized.slice(0, -3)}y`;
  if (normalized.endsWith("ing") && normalized.length > 5) normalized = normalized.slice(0, -3);
  if (normalized.endsWith("ed") && normalized.length > 4) normalized = normalized.slice(0, -2);
  if (normalized.endsWith("ly") && normalized.length > 5) normalized = normalized.slice(0, -2);
  if (normalized.endsWith("s") && normalized.length > 4) normalized = normalized.slice(0, -1);
  return normalized;
}

function tokenAliases(token: string): string[] {
  const aliases: Record<string, string[]> = {
    begin: ["start"],
    commence: ["start"],
    commencement: ["start"],
    effective: ["start"],
    terminate: ["end"],
    termination: ["end"],
    expire: ["end"],
    expiration: ["end"],
    end: ["terminate"],
    amount: ["money"],
    total: ["amount", "money"],
    fee: ["amount", "money"],
    cost: ["amount", "money"],
    price: ["amount", "money"],
    payment: ["pay", "amount", "money"],
    paid: ["pay", "amount", "money"],
    deposit: ["amount", "money"],
    dollar: ["amount", "money"],
    address: ["location"],
    property: ["location"],
    premise: ["location"],
    residence: ["location"],
    organization: ["company", "firm"],
    business: ["company", "organization"],
    firm: ["company", "organization"],
    person: ["name"],
    people: ["person", "name"],
    individual: ["person", "name"],
    occupant: ["person", "name"],
    applicant: ["person", "name"],
    client: ["person", "name"],
    customer: ["person", "name"],
    patient: ["person", "name"],
  };

  return aliases[token] || [];
}

function matchTokens(text: string): Set<string> {
  const tokens = new Set<string>();

  for (const rawToken of text.toLowerCase().split(/[^a-z0-9]+/g)) {
    const token = baseMatchToken(rawToken);
    if (token.length < 3 || MATCH_STOP_WORDS.has(token)) continue;
    tokens.add(token);
    for (const alias of tokenAliases(token)) {
      if (!MATCH_STOP_WORDS.has(alias)) tokens.add(alias);
    }
  }

  return tokens;
}

function countOverlap(left: Set<string>, right: Set<string>): number {
  let count = 0;
  for (const token of left) {
    if (right.has(token)) count += 1;
  }
  return count;
}

function countStrongOverlap(left: Set<string>, right: Set<string>): number {
  let count = 0;
  for (const token of left) {
    if (!LOW_SIGNAL_MATCH_TOKENS.has(token) && right.has(token)) count += 1;
  }
  return count;
}

function hasStrongContext(field: PdfFieldDescriptor): boolean {
  const fieldTokens = matchTokens(field.name);
  const contextTokens = matchTokens((field.nearbyText || []).slice(0, 2).join(" "));
  for (const token of contextTokens) {
    if (!fieldTokens.has(token) && !LOW_SIGNAL_MATCH_TOKENS.has(token)) return true;
  }
  return false;
}

function hasTrailingOrdinal(name: string): boolean {
  return /(?:^|[\s_-])\d+$/.test(name.trim());
}

function isAmbiguousRepeatedField(field: PdfFieldDescriptor, sourceQuote?: string): boolean {
  if (!hasTrailingOrdinal(field.name)) return false;
  if (sourceQuote && compactEvidence(sourceQuote).includes(compactEvidence(field.name))) return false;
  return matchTokens(field.name).size <= 2;
}

function valueMatchesFact(value: unknown, fact: ModelEvidenceFact): boolean {
  const compactValue = compactEvidence(String(value || ""));
  const compactFactValue = compactEvidence(fact.value || "");
  if (!compactValue || !compactFactValue) return false;
  return compactValue === compactFactValue || compactValue.includes(compactFactValue) || compactFactValue.includes(compactValue);
}

function scoreFactForField(field: PdfFieldDescriptor, fact: ModelEvidenceFact): number {
  const fieldNameTokens = matchTokens(field.name);
  const fieldContextTokens = matchTokens((field.nearbyText || []).slice(0, 2).join(" "));
  const factLabelTokens = matchTokens(fact.label);
  const factQuoteTokens = matchTokens(fact.sourceQuote);
  const nameLabelOverlap = countStrongOverlap(fieldNameTokens, factLabelTokens);
  const nameQuoteOverlap = countStrongOverlap(fieldNameTokens, factQuoteTokens);
  const contextLabelOverlap = countStrongOverlap(fieldContextTokens, factLabelTokens);
  const lowSignalNameLabelOverlap = countOverlap(fieldNameTokens, factLabelTokens) - nameLabelOverlap;
  const fieldNameHasStrongToken = [...fieldNameTokens].some((token) => !LOW_SIGNAL_MATCH_TOKENS.has(token));
  const lowSignalScore =
    fieldNameHasStrongToken || hasStrongContext(field) ? 0 : Math.min(lowSignalNameLabelOverlap, 1) * 3;

  return nameLabelOverlap * 4 + Math.min(nameQuoteOverlap, 2) + Math.min(contextLabelOverlap, 2) + lowSignalScore;
}

function isFieldValueAlignedWithEvidence(
  field: PdfFieldDescriptor,
  value: unknown,
  facts: ModelEvidenceFact[],
  sourceQuote?: string
): boolean {
  if (isAmbiguousRepeatedField(field, sourceQuote)) return false;

  const matchingFacts = facts.filter((fact) => valueMatchesFact(value, fact));
  if (matchingFacts.some((fact) => scoreFactForField(field, fact) >= 3)) return true;

  if (sourceQuote) {
    const fieldTokens = matchTokens(field.name);
    const quoteTokens = matchTokens(sourceQuote);
    if (countStrongOverlap(fieldTokens, quoteTokens) >= 1) return true;
  }

  return false;
}

function isExplicitControlSupported(
  field: ModelFieldValue,
  descriptor: PdfFieldDescriptor,
  facts: ModelEvidenceFact[]
): boolean {
  const selectionEvidence = field.sourceQuote || "";
  if (!/\b(yes|checked|check|selected|select|choose|chosen|mark|marked)\b/i.test(selectionEvidence)) {
    return false;
  }

  if (isAmbiguousRepeatedField(descriptor, field.sourceQuote)) return false;

  if (field.sourceQuote && countStrongOverlap(matchTokens(descriptor.name), matchTokens(field.sourceQuote)) >= 1) {
    return true;
  }

  return facts.some((fact) => scoreFactForField(descriptor, fact) >= 3);
}

function isSupportedRequestedFill(
  field: ModelFieldValue,
  descriptor: PdfFieldDescriptor | undefined,
  evidenceText: string,
  evidenceFacts: ModelEvidenceFact[]
): boolean {
  if (!descriptor || isForbiddenField(descriptor)) return false;

  if (descriptor.type === "checkbox" || descriptor.type === "radio") {
    if (isFalseValue(field.value)) return false;
    return isExplicitControlSupported(field, descriptor, evidenceFacts);
  }

  return (
    isTextValueSupportedByEvidence(field.value, evidenceText) &&
    isFieldValueAlignedWithEvidence(descriptor, field.value, evidenceFacts, field.sourceQuote)
  );
}

function normalizeValueKind(value: unknown): FieldValueKind {
  const kind = String(value || "unknown").trim();
  return (valueKindValues as readonly string[]).includes(kind) ? (kind as FieldValueKind) : "unknown";
}

function normalizedFieldText(field: PdfFieldDescriptor): string {
  return [field.name, field.position, ...(field.nameHints || []), ...(field.nearbyText || [])].filter(Boolean).join(" ");
}

function inferExpectedValueKindFromText(
  primaryTextRaw: string,
  secondaryTextRaw = "",
  fallback: FieldValueKind = "unknown"
): FieldValueKind {
  const primaryText = primaryTextRaw.toLowerCase();
  const secondaryText = secondaryTextRaw.toLowerCase();
  const scores = new Map<FieldValueKind, number>();
  const addScore = (kind: FieldValueKind, pattern: RegExp, primaryWeight: number, secondaryWeight: number) => {
    const score = (pattern.test(primaryText) ? primaryWeight : 0) + (pattern.test(secondaryText) ? secondaryWeight : 0);
    if (score > 0) scores.set(kind, (scores.get(kind) || 0) + score);
  };

  addScore("email", /\b(e-?mail)\b/, 8, 3);
  addScore("phone", /\b(phone|telephone|mobile|cell|fax)\b/, 8, 3);
  addScore("date", /\b(date|start|begin|commence|effective|end|terminate|expire|expiration|deadline|due)\b/, 7, 2);
  addScore("money", /\b(amount|total|price|cost|budget|fee|pay|payment|paid|deposit|premium|deductible|limit|salary|compensation|\$|dollar)\b/, 7, 2);
  addScore("person", /\b(name|person|persons|contact|client|customer|applicant|patient|employee|owner|agent|representative|recipient|payer|payee|occupant|individual|insured|claimant)\b/, 6, 1);
  addScore("organization", /\b(company|organization|firm|business|agency|provider|carrier|employer|department|institution|entity)\b/, 6, 1);
  addScore("address", /\b(address|street|city|state|zip|postal|location|property|premises?|site|county)\b/, 5, 1);

  const best = [...scores.entries()].sort((left, right) => right[1] - left[1])[0];
  return best && best[1] >= 2 ? best[0] : fallback;
}

function inferExpectedValueKind(field: PdfFieldDescriptor): FieldValueKind {
  if (["checkbox", "dropdown", "option_list", "radio"].includes(field.type)) return "option";

  const primaryText = [field.name, ...(field.nameHints || []), (field.nearbyText || [])[0]].filter(Boolean).join(" ");
  const secondaryText = (field.nearbyText || []).slice(1, 4).join(" ");
  return inferExpectedValueKindFromText(primaryText, secondaryText, field.type === "text" ? "free_text" : "unknown");
}

function nearbyVisualText(field: PdfFieldDescriptor, maxLines = 4): string {
  return (field.nearbyText || [])
    .slice(0, maxLines)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(" | ");
}

function visualLabelForField(field: PdfFieldDescriptor): string {
  return nearbyVisualText(field, 1) || field.name;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function visualBlankPhrase(field: PdfFieldDescriptor): string {
  const firstLine = (field.nearbyText || [])[0]?.replace(/\s+/g, " ").trim();
  if (!firstLine) return `[blank] ${field.name}`;

  const exactName = field.name.replace(/\s+/g, " ").trim();
  if (exactName && new RegExp(`\\(["']?${escapeRegExp(exactName)}["']?\\)`, "i").test(firstLine)) {
    return `[blank] ${firstLine}`;
  }
  if (exactName && firstLine.toLowerCase().includes(exactName.toLowerCase())) {
    return firstLine.replace(new RegExp(escapeRegExp(exactName), "i"), `${exactName} [blank]`);
  }

  return `[blank] ${firstLine}`;
}

function blankRoleLabel(field: PdfFieldDescriptor): string | undefined {
  const match = visualBlankPhrase(field).match(/\[blank\]\s*\(["']?([^"')]+)["']?\)/i);
  return match?.[1]?.trim();
}

function optionLabelForField(field: PdfFieldDescriptor): string | undefined {
  if (!isSelectionControl(field.type)) return undefined;
  if (field.options?.length === 1) return field.options[0];

  const genericTokens = new Set(["checkbox", "radio", "select", "selected", "option", "choice", "method", "preferred", "preference", "contact"]);
  const tokens = (field.nameHints?.length ? field.nameHints : field.name.split(/[^a-z0-9]+/gi))
    .map((token) => token.toLowerCase())
    .filter((token) => token.length > 1 && !genericTokens.has(token) && !/^c?\d+$/.test(token));

  if (tokens.length > 0) return tokens.slice(-3).join(" ");
  return field.name;
}

function visualPromptForField(field: PdfFieldDescriptor): string {
  return [field.name, visualBlankPhrase(field), nearbyVisualText(field, 4)].filter(Boolean).join(" | ");
}

function doNotFillReasonForField(field: PdfFieldDescriptor): string | undefined {
  if (field.readOnly) return "read-only field";

  const text = normalizedFieldText(field);
  const normalizedName = field.name.trim().toLowerCase();
  const contactTokenCount = (text.match(/\b(date|address|city|state|zip|postal|telephone|phone|fax|email)\b/gi) || []).length;
  const nameTokens = matchTokens(field.name);
  const hasSpecificNameToken = [...nameTokens].some((token) => !LOW_SIGNAL_MATCH_TOKENS.has(token));

  if (/\b(signature|sign here|initials?|attestation|certification|perjury|notary|witness|reviewed by)\b/i.test(text)) {
    return "signature, initials, or attestation field";
  }
  if (/\b(tax id|ssn|social security|account|routing|passport|license|driver'?s? license|policy number|claim number|legal id|identifier)\b/i.test(text)) {
    return "sensitive identifier field";
  }
  if (/^(undefined(?:_\d+)?|or(?:_\d+)?|and(?:_\d+)?|at(?:_\d+)?|am|pm|\d+(?:_\d+)?)$/.test(normalizedName)) {
    return "ambiguous generated field name";
  }
  if (hasTrailingOrdinal(field.name) && nameTokens.size <= 2) {
    return "ambiguous repeated field";
  }
  if (contactTokenCount >= 4 && !hasSpecificNameToken && field.type === "text") {
    return "ambiguous repeated contact block";
  }

  return undefined;
}

function buildFieldIntents(descriptor: Awaited<ReturnType<typeof inspectPdfForm>>): FieldIntent[] {
  return descriptor.fields.slice(0, MAX_FIELDS_FOR_MODEL).map((field, index) => {
    const visualLabel = visualLabelForField(field);
    const visualPrompt = visualPromptForField(field);
    const expectedValueKind = inferExpectedValueKind(field);

    return {
      id: `field_${index}`,
      fieldName: field.name,
      type: field.type,
      pageIndex: field.pageIndex,
      rect: field.rect,
      visualLabel,
      visualPrompt,
      expectedValueKind,
      controlGroup: ["checkbox", "dropdown", "option_list", "radio"].includes(field.type)
        ? `${field.pageIndex ?? "unknown"}:${matchTokens(visualPrompt).values().next().value || field.name}`
        : undefined,
      doNotFillReason: doNotFillReasonForField(field),
      descriptor: field,
    };
  });
}

function isKindCompatible(factKind: FieldValueKind, expectedKind: FieldValueKind): boolean {
  if (factKind === expectedKind) return true;
  if (expectedKind === "free_text" || expectedKind === "unknown") return factKind !== "option";
  if (factKind === "free_text" || factKind === "unknown") return true;
  if (expectedKind === "organization" && factKind === "person") return true;
  return false;
}

function isSelectionControl(type: PdfFieldDescriptor["type"]): boolean {
  return type === "checkbox" || type === "radio" || type === "dropdown" || type === "option_list";
}

function hasExplicitSelectionEvidence(text: string): boolean {
  return /\b(yes|no|checked|unchecked|check|select|selected|choose|chosen|mark|marked|option|preference|preferred|method is|use this|use the)\b/i.test(text);
}

function selectionOptionMatchesFact(fact: ModelEvidenceFact, intent: FieldIntent): boolean {
  const optionLabel = optionLabelForField(intent.descriptor);
  if (!optionLabel) return true;

  const optionCompact = compactEvidence(optionLabel);
  const factValueCompact = compactEvidence(fact.value);
  const quoteCompact = compactEvidence(fact.sourceQuote);
  if (!optionCompact || !factValueCompact) return false;

  return factValueCompact.includes(optionCompact) || optionCompact.includes(factValueCompact) || quoteCompact.includes(optionCompact);
}

function factTextForMatching(fact: ModelEvidenceFact): string {
  return [fact.label, fact.value, fact.sourceQuote].join(" ");
}

function primaryIntentText(field: PdfFieldDescriptor): string {
  return [field.name, visualBlankPhrase(field), (field.nearbyText || [])[0]].filter(Boolean).join(" ");
}

function secondaryIntentText(field: PdfFieldDescriptor): string {
  return (field.nearbyText || []).slice(1, 4).join(" ");
}

function hasQuotedRoleBlank(field: PdfFieldDescriptor): boolean {
  return /\[blank\]\s*\(["'][^)]+["']\)/i.test(visualBlankPhrase(field));
}

function scoreCandidateForFact(fact: ModelEvidenceFact, intent: FieldIntent): number {
  if (intent.doNotFillReason) return 0;
  if (intent.descriptor.readOnly) return 0;

  const factKind = normalizeValueKind(fact.valueKind);
  const factTokens = matchTokens(factTextForMatching(fact));
  const factLabelTokens = matchTokens(fact.label);
  const factQuoteTokens = matchTokens(fact.sourceQuote);
  const primaryTokens = matchTokens(primaryIntentText(intent.descriptor));
  const secondaryTokens = matchTokens(secondaryIntentText(intent.descriptor));
  const fieldNameTokens = matchTokens(intent.fieldName);
  const roleLabelTokens = matchTokens(blankRoleLabel(intent.descriptor) || "");
  const optionLabelTokens = matchTokens(optionLabelForField(intent.descriptor) || "");

  if (isSelectionControl(intent.type)) {
    if (factKind !== "option" && !hasExplicitSelectionEvidence(fact.sourceQuote)) return 0;
  } else if (factKind === "option") {
    return 0;
  }

  const kindScore = isKindCompatible(factKind, intent.expectedValueKind) ? 5 : 0;
  const labelScore = countStrongOverlap(factLabelTokens, primaryTokens) * 6 + countStrongOverlap(factLabelTokens, secondaryTokens);
  const quoteScore = Math.min(countStrongOverlap(factQuoteTokens, primaryTokens), 4) * 2.5 + Math.min(countStrongOverlap(factQuoteTokens, secondaryTokens), 2) * 0.5;
  const valueScore = Math.min(countStrongOverlap(matchTokens(fact.value), primaryTokens), 3) * 2;
  const nameScore = countStrongOverlap(factTokens, fieldNameTokens) * 2;
  const roleLabelScore = countStrongOverlap(factLabelTokens, roleLabelTokens) * 8;
  const optionLabelScore = isSelectionControl(intent.type)
    ? countStrongOverlap(matchTokens(fact.value), optionLabelTokens) * 12 + countStrongOverlap(factQuoteTokens, optionLabelTokens) * 4
    : 0;
  const roleBlankScore = hasQuotedRoleBlank(intent.descriptor) && (factKind === "person" || factKind === "organization") ? 6 : 0;
  const lowSignalScore = Math.min(countOverlap(factTokens, primaryTokens), 4) * 0.5;
  const geometryScore = typeof intent.pageIndex === "number" ? 0.25 : 0;

  const score =
    kindScore + labelScore + quoteScore + valueScore + nameScore + roleLabelScore + optionLabelScore + roleBlankScore + lowSignalScore + geometryScore;
  return score >= 4 ? score : 0;
}

function candidatesForFact(fact: ModelEvidenceFact, intents: FieldIntent[]): FieldCandidate[] {
  return intents
    .map((intent) => ({
      fieldId: intent.id,
      fieldName: intent.fieldName,
      type: intent.type,
      visualLabel: intent.visualLabel,
      visualPrompt: intent.visualPrompt,
      expectedValueKind: intent.expectedValueKind,
      pageIndex: intent.pageIndex,
      controlGroup: intent.controlGroup,
      blankRoleLabel: blankRoleLabel(intent.descriptor),
      optionLabel: optionLabelForField(intent.descriptor),
      score: scoreCandidateForFact(fact, intent),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, MAX_CANDIDATES_PER_FACT);
}

function fieldValueFromDecision(
  decision: ModelCandidateDecision,
  fact: ModelEvidenceFact,
  intent: FieldIntent
): string | boolean {
  if (intent.type === "checkbox") return true;
  if (intent.type === "radio" || intent.type === "dropdown" || intent.type === "option_list") {
    return cleanModelScalarValue(decision.value || fact.value) as string;
  }
  return cleanModelScalarValue(decision.value || fact.value) as string;
}

function decisionSourceQuote(decision: ModelCandidateDecision, fact: ModelEvidenceFact): string {
  return decision.sourceQuote?.trim() || fact.sourceQuote;
}

function shouldReplaceAcceptedFill(
  previous: { fill: FieldFillInput; confidence: number } | undefined,
  nextFill: FieldFillInput,
  nextConfidence: number
): boolean {
  if (!previous) return true;
  if (nextConfidence > previous.confidence) return true;

  const previousValue = compactEvidence(String(previous.fill.value || ""));
  const nextValue = compactEvidence(String(nextFill.value || ""));
  const nextIsMoreComplete = nextValue.length > previousValue.length && nextValue.includes(previousValue);
  return nextIsMoreComplete && nextConfidence >= previous.confidence - 0.08;
}

function fillInputsFromCandidateDecisions({
  parsed,
  facts,
  intents,
  candidatesByFact,
  evidenceText,
}: {
  parsed: ModelCandidateResponse;
  facts: ModelEvidenceFact[];
  intents: FieldIntent[];
  candidatesByFact: Map<number, Set<string>>;
  evidenceText: string;
}): { requestedFills: FieldFillInput[]; decisionTrace: Array<Record<string, unknown>>; warnings: string[] } {
  const intentById = new Map(intents.map((intent) => [intent.id, intent]));
  const bestByFieldName = new Map<string, { fill: FieldFillInput; confidence: number }>();
  const decisionTrace: Array<Record<string, unknown>> = [];
  const warnings: string[] = [];

  for (const decision of parsed.decisions || []) {
    const factIndex = Math.floor(Number(decision.factIndex));
    const fact = facts[factIndex];
    if (!fact) continue;

    const allowedCandidates = candidatesByFact.get(factIndex) || new Set<string>();
    const confidence = typeof decision.confidence === "number" ? decision.confidence : 0;
    const sourceQuote = decisionSourceQuote(decision, fact);

    for (const fieldId of decision.fieldIds || []) {
      const intent = intentById.get(fieldId);
      const trace = {
        factIndex,
        factLabel: fact.label,
        factValue: fact.value,
        factKind: normalizeValueKind(fact.valueKind),
        fieldId,
        fieldName: intent?.fieldName,
        expectedKind: intent?.expectedValueKind,
        visualPrompt: intent?.visualPrompt,
        decision: decision.reasoning,
        confidence,
        accepted: false,
        rejectedReason: "",
      };

      if (!intent || !allowedCandidates.has(fieldId)) {
        trace.rejectedReason = "field was not in the candidate set";
        decisionTrace.push(trace);
        continue;
      }
      if (intent.doNotFillReason) {
        trace.rejectedReason = intent.doNotFillReason;
        decisionTrace.push(trace);
        continue;
      }
      if (confidence < 0.45) {
        trace.rejectedReason = "confidence below fill threshold";
        decisionTrace.push(trace);
        continue;
      }
      if (!isKindCompatible(normalizeValueKind(fact.valueKind), intent.expectedValueKind)) {
        trace.rejectedReason = "value kind conflicted with field intent";
        decisionTrace.push(trace);
        continue;
      }
      if (isSelectionControl(intent.type) && !hasExplicitSelectionEvidence(sourceQuote)) {
        trace.rejectedReason = "selection control lacked explicit selection evidence";
        decisionTrace.push(trace);
        continue;
      }
      if (isSelectionControl(intent.type) && !selectionOptionMatchesFact(fact, intent)) {
        trace.rejectedReason = "selection value did not match the option label";
        decisionTrace.push(trace);
        continue;
      }

      const value = fieldValueFromDecision(decision, fact, intent);
      if (isSelectionControl(intent.type)) {
        if (isFalseValue(value)) {
          trace.rejectedReason = "false selection controls are not applied";
          decisionTrace.push(trace);
          continue;
        }
      } else if (!isTextValueSupportedByEvidence(value, evidenceText)) {
        trace.rejectedReason = "value was not directly supported by evidence text";
        decisionTrace.push(trace);
        continue;
      }

      const fill: FieldFillInput = {
        fieldName: intent.fieldName,
        value,
        confidence,
        visualLabel: intent.visualLabel,
        sourceQuote,
        valueKind: normalizeValueKind(fact.valueKind),
      };
      const previous = bestByFieldName.get(intent.fieldName);
      if (shouldReplaceAcceptedFill(previous, fill, confidence)) {
        bestByFieldName.set(intent.fieldName, { fill, confidence });
      }
      if (confidence < 0.75) {
        warnings.push(`Medium-confidence fill for ${intent.visualLabel || intent.fieldName}: ${sourceQuote}`);
      }
      trace.accepted = true;
      decisionTrace.push(trace);
    }
  }

  return {
    requestedFills: [...bestByFieldName.values()].map((entry) => entry.fill),
    decisionTrace,
    warnings: Array.from(new Set(warnings)),
  };
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
- Preserve names, organizations, addresses, dates, money amounts, time periods, contact info, selected options, and yes/no facts.
- Split combined descriptions into separate facts. Each person, organization, address, date, amount, option, and term should be separate when possible.
- Also include a grouped fact when several people or several organizations belong to the same visible role and the form may have one shared blank.
- Classify every fact using exactly one valueKind: ${valueKindValues.join(", ")}.
- Only create option facts when the source explicitly selects, chooses, marks, checks, or names a preferred option. Topical overlap is not an option selection.
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

function addressGroupKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/\b(full|street|mailing|physical|property|premises|site|location|address|addr|city|state|province|zip|postal|postcode|code|county)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function addressPartRank(fact: ModelEvidenceFact): number {
  const label = fact.label.toLowerCase();
  if (/\b(street|address|premises|property|site|location)\b/.test(label)) return 0;
  if (/\bcity\b/.test(label)) return 1;
  if (/\b(state|province)\b/.test(label)) return 2;
  if (/\b(zip|postal|postcode)\b/.test(label)) return 3;
  if (/\bcounty\b/.test(label)) return 4;
  return 5;
}

function expandEvidenceFacts(facts: ModelEvidenceFact[]): ModelEvidenceFact[] {
  const expanded = [...facts];
  const seen = new Set(facts.map((fact) => `${fact.label.toLowerCase()}::${compactEvidence(fact.value)}`));
  const groups = new Map<string, ModelEvidenceFact[]>();

  for (const fact of facts) {
    if (normalizeValueKind(fact.valueKind) !== "address") continue;
    const key = addressGroupKey(fact.label) || compactEvidence(fact.sourceQuote).slice(0, 48);
    groups.set(key, [...(groups.get(key) || []), fact]);
  }

  for (const [key, group] of groups) {
    const uniqueParts = Array.from(new Map(group.map((fact) => [compactEvidence(fact.value), fact])).values());
    if (uniqueParts.length < 2) continue;
    const sortedParts = uniqueParts.sort((left, right) => addressPartRank(left) - addressPartRank(right));
    const value = sortedParts.map((fact) => fact.value.trim()).filter(Boolean).join(", ");
    const compactValue = compactEvidence(value);
    if (!compactValue) continue;
    const duplicate = expanded.some(
      (fact) => normalizeValueKind(fact.valueKind) === "address" && compactEvidence(fact.value) === compactValue
    );
    if (duplicate) continue;

    const sourceQuote =
      sortedParts
        .map((fact) => fact.sourceQuote)
        .filter(Boolean)
        .sort((left, right) => right.length - left.length)[0] || sortedParts[0].sourceQuote;
    const labelBase = key ? `${key} full address` : "Full address";
    const label = labelBase.replace(/\b\w/g, (char) => char.toUpperCase());
    const factKey = `${label.toLowerCase()}::${compactValue}`;
    if (seen.has(factKey)) continue;
    seen.add(factKey);
    expanded.push({
      label,
      value,
      valueKind: "address",
      sourceQuote,
    });
  }

  return expanded;
}

async function mapFactCandidatesWithModel({
  openai,
  descriptor,
  facts,
  intents,
  contextBlocks,
}: {
  openai: OpenAI;
  descriptor: Awaited<ReturnType<typeof inspectPdfForm>>;
  facts: ModelEvidenceFact[];
  intents: FieldIntent[];
  contextBlocks: string[];
}): Promise<{
  parsed: ModelCandidateResponse;
  candidatesByFact: Map<number, Set<string>>;
  candidatePayload: Array<{ factIndex: number; fact: ModelEvidenceFact; candidates: FieldCandidate[] }>;
}> {
  const mappingFacts = facts.slice(0, MAX_FACTS_FOR_FIELD_MATCHING);
  const candidatePayload = mappingFacts
    .map((fact, factIndex) => ({
      factIndex,
      fact,
      candidates: candidatesForFact(fact, intents),
    }))
    .filter((entry) => entry.candidates.length > 0);
  const candidatesByFact = new Map(candidatePayload.map((entry) => [entry.factIndex, new Set(entry.candidates.map((candidate) => candidate.fieldId))]));
  const pagesWithCandidates = Array.from(
    new Set(
      candidatePayload
        .flatMap((entry) => entry.candidates.map((candidate) => candidate.pageIndex))
        .filter((pageIndex): pageIndex is number => pageIndex !== undefined)
    )
  )
    .sort((left, right) => left - right)
    .slice(0, 8)
    .map((pageIndex) => descriptor.pages[pageIndex])
    .filter(Boolean);

  if (candidatePayload.length === 0) {
    return {
      parsed: {
        decisions: [],
        unfilledFields: [],
        summary: {
          extractedFacts: mappingFacts.map((fact) => `${fact.label}: ${fact.value}`),
          assumptions: [],
          warnings: ["No candidate PDF fields matched the extracted facts."],
        },
      },
      candidatesByFact,
      candidatePayload,
    };
  }

  const response = await openai.chat.completions.create({
    model: process.env.PDF_AUTOFILL_MODEL || DEFAULT_OPENAI_CHAT_MODEL,
    temperature: 0,
    response_format: candidateDecisionResponseFormat,
    messages: [
      {
        role: "system",
        content: `You are a careful document field matching agent.

The application already extracted facts from user evidence and generated top PDF field candidates for each fact. Your job is to choose which candidate field IDs should receive each fact.

Rules:
- Return only fieldIds from the supplied candidate lists. Return an empty fieldIds array when no candidate is clearly correct.
- Prefer the candidate whose visualPrompt describes the same intent as the fact. Field names can be cryptic, incomplete, or text adjacent to the blank; visualPrompt marks the inferred blank location with [blank] when possible and is usually more important.
- A candidate with blankRoleLabel means the blank is immediately followed by a quoted role/noun, such as [blank] ("Customer"). When the fact label/value matches that role, treat it as a strong entity-name field, not as unrelated boilerplate.
- For checkbox/radio/dropdown/option candidates, compare the fact value to optionLabel. If the fact says "phone", choose only the candidate whose optionLabel is phone, not neighboring options in the same group.
- It is valid to choose multiple field IDs for one fact only when the same fact should appear in repeated matching blanks.
- Never choose a signature, initials, attestation, legal identifier, or unrelated contact-detail field.
- Never choose a checkbox, radio, dropdown, option list, printed option, or choice field from topical overlap alone. Selection controls require sourceQuote evidence that explicitly selects, checks, chooses, marks, prefers, or names the option as the selected method/choice.
- For text fields, choose high-confidence and medium-confidence matches when the value kind and visualPrompt agree. Leave role-conflicting or low-confidence fields blank.
- Keep values concise and copied from the fact unless a shorter form-ready value is needed.
- Return structured JSON only.`,
      },
      {
        role: "user",
        content: `PDF metadata:
${JSON.stringify({ title: descriptor.title, author: descriptor.author, subject: descriptor.subject, fieldCount: descriptor.fieldCount, fieldNameQuality: descriptor.fieldNameQuality }, null, 2)}

Relevant PDF page text:
${JSON.stringify(pagesWithCandidates, null, 2)}

Facts and candidate fields:
${JSON.stringify(candidatePayload, null, 2)}

Original evidence:
${contextBlocks.join("\n\n")}`,
      },
    ],
  });

  return {
    parsed: parseModelJson<ModelCandidateResponse>(response.choices[0]?.message?.content || "{}"),
    candidatesByFact,
    candidatePayload,
  };
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
- For clauses split across adjacent blanks, fill each blank by local reading order and visible labels around that blank.
- Use ordinary label synonyms across domains: start/begin/effective, end/terminate/expire, organization/company/firm, amount/total/payment, address/location/property, person/name/contact.
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

type PdfTextItem = NonNullable<PdfPageDescriptor["textItems"]>[number];

interface FlatTextLine {
  lineIndex: number;
  y: number;
  x: number;
  width: number;
  height?: number;
  text: string;
  items: PdfTextItem[];
}

function getFlatTextLines(page: PdfPageDescriptor): FlatTextLine[] {
  const byLine = new Map<number, PdfTextItem[]>();
  for (const item of page.textItems || []) {
    const lineIndex = typeof item.lineIndex === "number" ? item.lineIndex : Math.round(item.y * 10);
    byLine.set(lineIndex, [...(byLine.get(lineIndex) || []), item]);
  }

  return [...byLine.entries()]
    .map(([lineIndex, items]) => {
      const sortedItems = items.slice().sort((left, right) => left.x - right.x);
      const left = Math.min(...sortedItems.map((item) => item.x));
      const right = Math.max(...sortedItems.map((item) => item.x + item.width));
      const heights = sortedItems.map((item) => item.height || 0).filter(Boolean);

      return {
        lineIndex,
        y: sortedItems[0]?.y || 0,
        x: left,
        width: right - left,
        height: heights.length ? Math.max(...heights) : undefined,
        text: sortedItems.map((item) => item.text).join(" ").replace(/\s+/g, " ").trim(),
        items: sortedItems,
      };
    })
    .filter((line) => line.text)
    .sort((left, right) => right.y - left.y || left.x - right.x);
}

function cleanVisualPrompt(text: string): string {
  return text.replace(/\s+/g, " ").replace(/\s+([,.;:])/g, "$1").trim();
}

function textAroundGap(items: PdfTextItem[], gapIndex: number, side: "left" | "right"): string {
  const slice = side === "left" ? items.slice(Math.max(0, gapIndex - 3), gapIndex + 1) : items.slice(gapIndex + 1, gapIndex + 5);
  return cleanVisualPrompt(slice.map((item) => item.text).join(" "));
}

function defaultFlatAnswerLeft(page: PdfPageDescriptor): number {
  const xs = (page.textItems || [])
    .map((item) => item.x)
    .filter((x) => Number.isFinite(x) && x > 35 && x < page.width * 0.35)
    .sort((left, right) => left - right);
  if (xs.length === 0) return Math.max(36, page.width * 0.08);

  const buckets = new Map<number, number>();
  for (const x of xs) {
    const bucket = Math.round(x / 4) * 4;
    buckets.set(bucket, (buckets.get(bucket) || 0) + 1);
  }
  const best = [...buckets.entries()].sort((left, right) => right[1] - left[1])[0]?.[0];
  return best ? Math.max(36, best) : Math.max(36, xs[0]);
}

function overlayTopFromBaseline(page: PdfPageDescriptor, baselineY: number, fontSize: number): number {
  return roundUnit((page.height - baselineY - fontSize * 0.75) / page.height);
}

function flatFontSizeForLine(line: FlatTextLine, height?: number): number {
  const lineHeight = height || line.height || 9;
  const fontSize = Math.max(8.2, Math.min(10.2, lineHeight * 1.04));
  return Math.round(fontSize * 10) / 10;
}

function isQuotedRoleLine(text: string): boolean {
  return /^\(?["“][^"”]+["”]\)?/i.test(text.trim());
}

function isMostlyPunctuationLine(text: string): boolean {
  return /^[,.;:)\]]+$/.test(text.trim());
}

function flatDoNotFillReason(text: string): string | undefined {
  if (/\b(signature|sign here|initials?|attestation|certification|perjury|notary|witness|reviewed by)\b/i.test(text)) {
    return "signature, initials, or attestation area";
  }
  if (/\b(tax id|ssn|social security|account|routing|passport|license|driver'?s? license|policy number|claim number|legal id|identifier)\b/i.test(text)) {
    return "sensitive identifier area";
  }
  return undefined;
}

function flatFieldName(pageIndex: number, x: number, y: number, label: string): string {
  const compactLabel = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
  return `flat_p${pageIndex + 1}_${Math.round(x)}_${Math.round(y)}_${compactLabel || "blank"}`;
}

function makeFlatTextIntent({
  id,
  page,
  pageIndex,
  line,
  x,
  y,
  width,
  prompt,
  nearbyText,
}: {
  id: string;
  page: PdfPageDescriptor;
  pageIndex: number;
  line: FlatTextLine;
  x: number;
  y: number;
  width: number;
  prompt: string;
  nearbyText: string[];
}): FlatFieldIntent | null {
  if (width < MIN_FLAT_TEXT_GAP || x < 0 || x >= page.width - 8) return null;

  const fontSize = flatFontSizeForLine(line);
  const visualPrompt = cleanVisualPrompt(prompt);
  if (!visualPrompt || visualPrompt === "[blank]") return null;

  const expectedValueKind = inferExpectedValueKindFromText(visualPrompt, nearbyText.join(" "), "free_text");
  const visualLabel = visualPrompt.replace(/\[blank\]/g, "_____").slice(0, 140);
  return {
    id,
    fieldName: flatFieldName(pageIndex, x, y, visualLabel),
    type: "text",
    pageIndex,
    x: roundUnit(x / page.width),
    y: overlayTopFromBaseline(page, y, fontSize),
    width: roundUnit(Math.min(width, page.width - x - 12) / page.width),
    height: roundUnit((fontSize + 3) / page.height),
    fontSize,
    visualLabel,
    visualPrompt,
    expectedValueKind,
    nearbyText,
    doNotFillReason: flatDoNotFillReason(visualPrompt),
  };
}

function lineContext(lines: FlatTextLine[], index: number): string[] {
  return [lines[index - 1]?.text, lines[index]?.text, lines[index + 1]?.text].filter(Boolean);
}

function addFlatIntent(intents: FlatFieldIntent[], seen: Set<string>, intent: FlatFieldIntent | null): void {
  if (!intent) return;
  const key = `${intent.pageIndex}:${Math.round(intent.x * 1000)}:${Math.round(intent.y * 1000)}:${intent.type}`;
  if (seen.has(key)) return;
  seen.add(key);
  intents.push(intent);
}

function buildFlatTextFieldIntents(descriptor: Awaited<ReturnType<typeof inspectPdfForm>>): FlatFieldIntent[] {
  const intents: FlatFieldIntent[] = [];
  const seen = new Set<string>();

  for (const page of descriptor.pages.slice(0, MAX_FLAT_OVERLAY_PAGES)) {
    const lines = getFlatTextLines(page);
    const answerLeft = defaultFlatAnswerLeft(page);

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = lines[lineIndex];
      const items = line.items;
      const previousLine = lines[lineIndex - 1];
      const nextLine = lines[lineIndex + 1];
      const nearbyText = lineContext(lines, lineIndex);
      if (items.length === 0) continue;

      const first = items[0];
      if (
        first.x - answerLeft >= MIN_FLAT_TEXT_GAP &&
        (isQuotedRoleLine(line.text) || (isMostlyPunctuationLine(line.text) && previousLine))
      ) {
        const promptPrefix = previousLine && !isQuotedRoleLine(line.text) ? `${previousLine.text} ` : "";
        addFlatIntent(
          intents,
          seen,
          makeFlatTextIntent({
            id: `flat_${page.pageIndex}_${line.lineIndex}_before`,
            page,
            pageIndex: page.pageIndex,
            line,
            x: answerLeft,
            y: line.y,
            width: first.x - answerLeft - 3,
            prompt: `${promptPrefix}[blank] ${line.text}`,
            nearbyText,
          })
        );
      }

      for (let itemIndex = 0; itemIndex < items.length - 1; itemIndex += 1) {
        const left = items[itemIndex];
        const right = items[itemIndex + 1];
        const gapStart = left.x + left.width;
        const gapEnd = right.x;
        const gapWidth = gapEnd - gapStart;
        if (gapWidth < MIN_FLAT_TEXT_GAP) continue;
        if (isMostlyPunctuationLine(left.text) && isMostlyPunctuationLine(right.text)) continue;

        const leftText = textAroundGap(items, itemIndex, "left");
        const rightText = textAroundGap(items, itemIndex, "right");
        const prompt = cleanVisualPrompt(`${leftText} [blank] ${rightText}`);
        addFlatIntent(
          intents,
          seen,
          makeFlatTextIntent({
            id: `flat_${page.pageIndex}_${line.lineIndex}_gap_${itemIndex}`,
            page,
            pageIndex: page.pageIndex,
            line,
            x: gapStart + 2,
            y: line.y,
            width: gapWidth - 4,
            prompt,
            nearbyText,
          })
        );
      }

      const last = items[items.length - 1];
      const afterLastWidth = page.width - 36 - (last.x + last.width);
      if (
        afterLastWidth >= MIN_FLAT_TEXT_GAP &&
        /(?:[:$]|\b(date|name|address|phone|email|amount|total|cost|budget|deposit)\b)\s*$/i.test(line.text) &&
        !(nextLine && (isMostlyPunctuationLine(nextLine.text) || isQuotedRoleLine(nextLine.text)))
      ) {
        addFlatIntent(
          intents,
          seen,
          makeFlatTextIntent({
            id: `flat_${page.pageIndex}_${line.lineIndex}_after`,
            page,
            pageIndex: page.pageIndex,
            line,
            x: last.x + last.width + 2,
            y: line.y,
            width: afterLastWidth - 4,
            prompt: `${line.text} [blank]`,
            nearbyText,
          })
        );
      }
    }
  }

  return intents
    .filter((intent) => intent.width >= roundUnit(MIN_FLAT_TEXT_GAP / Math.max(1, descriptor.pages[intent.pageIndex]?.width || 612)))
    .slice(0, MAX_FLAT_FIELD_CANDIDATES);
}

function isFlatSelectionControl(intent: FlatFieldIntent): boolean {
  return intent.type === "checkbox";
}

function flatCandidateRequiresExplicitContext(intent: FlatFieldIntent): boolean {
  if (isFlatSelectionControl(intent)) return true;
  const text = intent.visualPrompt.toLowerCase();
  const hasContactOrRecipientBlank = /\b(payment|paid by|payable|payee|recipient|remit|contact|broker|agent|guarantor)\b/.test(text);
  const asksForContactDetail = /\b(name|phone|telephone|email|address|at|to)\b/.test(text);
  const isAmountBlank = /\$|\b(amount|total|budget|fee|cost|price|deposit|premium|deductible|rent)\b/.test(text);
  return hasContactOrRecipientBlank && asksForContactDetail && !isAmountBlank;
}

function factExplicitlySupportsFlatContext(fact: ModelEvidenceFact, intent: FlatFieldIntent): boolean {
  if (!flatCandidateRequiresExplicitContext(intent)) return true;

  const factText = factTextForMatching(fact).toLowerCase();
  if (isFlatSelectionControl(intent)) return hasExplicitSelectionEvidence(factText);

  return /\b(payment|payee|recipient|paid to|pay to|payable to|remit|send|mail|contact|phone|telephone|email|address|broker|agent|guarantor)\b/i.test(
    factText
  );
}

function optionLabelForFlatIntent(intent: FlatFieldIntent): string | undefined {
  return intent.optionLabel;
}

function isEntityFlatBlank(intent: FlatFieldIntent): boolean {
  const text = intent.visualPrompt.toLowerCase();
  if (/\[blank\]\s*\(["“][^"”]+["”]\)/i.test(intent.visualPrompt)) return true;
  if (/\b(named person|person\(s\)|occupant|individual|client|customer|applicant|patient|employee|insured|claimant)\b/i.test(text)) return true;
  if (/\b(name|organization|company|business|entity|landlord|tenant|owner|recipient|payee)\b/i.test(text)) {
    return !/(?:[$%]|\b(except|exception|exceptions|days?|hours?|amount|pay|paid|charge|charges|utilities|obligations?|forwarding|address|garden|landscaping|month|rent|deposit|fee|cost|price|date|time)\b)/i.test(text);
  }
  return false;
}

function scoreFlatCandidateForFact(fact: ModelEvidenceFact, intent: FlatFieldIntent): number {
  if (intent.doNotFillReason) return 0;
  if (!factExplicitlySupportsFlatContext(fact, intent)) return 0;

  const factKind = normalizeValueKind(fact.valueKind);
  if ((factKind === "person" || factKind === "organization") && !isEntityFlatBlank(intent)) return 0;

  if (isFlatSelectionControl(intent)) {
    if (factKind !== "option" && !hasExplicitSelectionEvidence(fact.sourceQuote)) return 0;
  } else if (factKind === "option") {
    return 0;
  }

  const factTokens = matchTokens(factTextForMatching(fact));
  const factLabelTokens = matchTokens(fact.label);
  const factQuoteTokens = matchTokens(fact.sourceQuote);
  const primaryTokens = matchTokens(intent.visualPrompt);
  const nearbyTokens = matchTokens(intent.nearbyText.join(" "));
  const optionLabelTokens = matchTokens(optionLabelForFlatIntent(intent) || "");

  const kindScore = isKindCompatible(factKind, intent.expectedValueKind) ? 5 : 0;
  const labelScore = countStrongOverlap(factLabelTokens, primaryTokens) * 6 + countStrongOverlap(factLabelTokens, nearbyTokens);
  const quoteScore = Math.min(countStrongOverlap(factQuoteTokens, primaryTokens), 4) * 2.5;
  const valueScore = Math.min(countStrongOverlap(matchTokens(fact.value), primaryTokens), 3) * 2;
  const lowSignalScore = Math.min(countOverlap(factTokens, primaryTokens), 4) * 0.5;
  const optionLabelScore = isFlatSelectionControl(intent)
    ? countStrongOverlap(matchTokens(fact.value), optionLabelTokens) * 12 + countStrongOverlap(factQuoteTokens, optionLabelTokens) * 4
    : 0;
  const genericPersonScore =
    factKind === "person" && /\b(named person|person\(s\)|occupant|individual|client|customer|applicant|patient|employee)\b/i.test(intent.visualPrompt)
      ? 8
      : 0;
  const geometryScore = 0.25;
  const supportScore = labelScore + quoteScore + valueScore + lowSignalScore + optionLabelScore + genericPersonScore;
  if (supportScore < 1.5) return 0;

  const score =
    kindScore + labelScore + quoteScore + valueScore + lowSignalScore + optionLabelScore + genericPersonScore + geometryScore;
  return score >= 4 ? score : 0;
}

function flatCandidatesForFact(fact: ModelEvidenceFact, intents: FlatFieldIntent[]): FlatFieldCandidate[] {
  return intents
    .map((intent) => ({
      fieldId: intent.id,
      fieldName: intent.fieldName,
      type: intent.type,
      visualLabel: intent.visualLabel,
      visualPrompt: intent.visualPrompt,
      expectedValueKind: intent.expectedValueKind,
      pageIndex: intent.pageIndex,
      optionLabel: optionLabelForFlatIntent(intent),
      score: scoreFlatCandidateForFact(fact, intent),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, MAX_CANDIDATES_PER_FACT);
}

async function mapFlatFactCandidatesWithModel({
  openai,
  descriptor,
  facts,
  intents,
  contextBlocks,
}: {
  openai: OpenAI;
  descriptor: Awaited<ReturnType<typeof inspectPdfForm>>;
  facts: ModelEvidenceFact[];
  intents: FlatFieldIntent[];
  contextBlocks: string[];
}): Promise<{
  parsed: ModelCandidateResponse;
  candidatesByFact: Map<number, Set<string>>;
  candidatePayload: Array<{ factIndex: number; fact: ModelEvidenceFact; candidates: FlatFieldCandidate[] }>;
}> {
  const mappingFacts = facts.slice(0, MAX_FACTS_FOR_FIELD_MATCHING);
  const candidatePayload = mappingFacts
    .map((fact, factIndex) => ({
      factIndex,
      fact,
      candidates: flatCandidatesForFact(fact, intents),
    }))
    .filter((entry) => entry.candidates.length > 0);
  const candidatesByFact = new Map(candidatePayload.map((entry) => [entry.factIndex, new Set(entry.candidates.map((candidate) => candidate.fieldId))]));
  const pagesWithCandidates = Array.from(new Set(candidatePayload.flatMap((entry) => entry.candidates.map((candidate) => candidate.pageIndex))))
    .sort((left, right) => left - right)
    .slice(0, MAX_FLAT_OVERLAY_PAGES)
    .map((pageIndex) => descriptor.pages[pageIndex])
    .filter(Boolean)
    .map((page) => ({
      pageIndex: page.pageIndex,
      width: page.width,
      height: page.height,
      textPreview: page.textPreview,
      textLines: (page.textLines || []).slice(0, 160),
    }));

  if (candidatePayload.length === 0) {
    return {
      parsed: {
        decisions: [],
        unfilledFields: [],
        summary: {
          extractedFacts: mappingFacts.map((fact) => `${fact.label}: ${fact.value}`),
          assumptions: [],
          warnings: ["No blank candidates matched the extracted facts."],
        },
      },
      candidatesByFact,
      candidatePayload,
    };
  }

  const response = await openai.chat.completions.create({
    model: process.env.PDF_OVERLAY_MODEL || process.env.PDF_AUTOFILL_MODEL || DEFAULT_OPENAI_CHAT_MODEL,
    temperature: 0,
    response_format: candidateDecisionResponseFormat,
    messages: [
      {
        role: "system",
        content: `You are a careful flat-PDF field matching agent.

The application has already detected blank answer areas from PDF text geometry. Each candidate has exact overlay coordinates. Your job is only to choose candidate field IDs for each extracted fact.

Rules:
- Return only fieldIds from the supplied candidate lists. Return an empty fieldIds array when no candidate is clearly correct.
- Prefer visualPrompt over coordinates. visualPrompt uses [blank] to show the detected blank in nearby document text.
- It is valid to choose multiple field IDs for one fact only when the same value belongs in repeated matching blanks.
- For person/entity facts, choose both a direct role blank and a generic matching entity blank when both are visible and correct, such as blanks labeled named person(s), occupants, applicants, customers, clients, owners, organizations, or companies.
- Do not choose a payment-recipient, contact-detail, broker, agent, guarantor, signature, initials, attestation, legal identifier, or unrelated blank from a party/name/amount fact.
- Never choose a checkbox, printed option, or choice candidate from topical overlap alone. Selection controls require sourceQuote evidence that explicitly selects, checks, chooses, marks, prefers, or names the selected option.
- For text fields, choose high-confidence and medium-confidence matches when value kind and visualPrompt agree. Leave role-conflicting or low-confidence blanks empty.
- Keep values concise and copied from the fact unless a shorter form-ready value is needed.
- Return structured JSON only.`,
      },
      {
        role: "user",
        content: `PDF metadata:
${JSON.stringify({ title: descriptor.title, author: descriptor.author, subject: descriptor.subject, pageCount: descriptor.pages.length }, null, 2)}

Relevant PDF page text:
${JSON.stringify(pagesWithCandidates, null, 2)}

Detected blank candidates:
${JSON.stringify(candidatePayload, null, 2)}

Original evidence:
${contextBlocks.join("\n\n")}`,
      },
    ],
  });

  return {
    parsed: parseModelJson<ModelCandidateResponse>(response.choices[0]?.message?.content || "{}"),
    candidatesByFact,
    candidatePayload,
  };
}

function overlayValueFromDecision(decision: ModelCandidateDecision, fact: ModelEvidenceFact, intent: FlatFieldIntent): string | boolean {
  if (intent.type === "checkbox") return true;
  return cleanModelScalarValue(decision.value || fact.value) as string;
}

function overlayInputsFromFlatCandidateDecisions({
  parsed,
  facts,
  intents,
  candidatesByFact,
  evidenceText,
}: {
  parsed: ModelCandidateResponse;
  facts: ModelEvidenceFact[];
  intents: FlatFieldIntent[];
  candidatesByFact: Map<number, Set<string>>;
  evidenceText: string;
}): { requestedOverlays: PdfOverlayInput[]; decisionTrace: Array<Record<string, unknown>>; warnings: string[] } {
  const intentById = new Map(intents.map((intent) => [intent.id, intent]));
  const bestByFieldName = new Map<string, { overlay: PdfOverlayInput; confidence: number }>();
  const decisionTrace: Array<Record<string, unknown>> = [];
  const warnings: string[] = [];

  for (const decision of parsed.decisions || []) {
    const factIndex = Math.floor(Number(decision.factIndex));
    const fact = facts[factIndex];
    if (!fact) continue;

    const allowedCandidates = candidatesByFact.get(factIndex) || new Set<string>();
    const confidence = typeof decision.confidence === "number" ? decision.confidence : 0;
    const sourceQuote = decisionSourceQuote(decision, fact);

    for (const fieldId of decision.fieldIds || []) {
      const intent = intentById.get(fieldId);
      const trace = {
        factIndex,
        factLabel: fact.label,
        factValue: fact.value,
        factKind: normalizeValueKind(fact.valueKind),
        fieldId,
        fieldName: intent?.fieldName,
        expectedKind: intent?.expectedValueKind,
        visualPrompt: intent?.visualPrompt,
        decision: decision.reasoning,
        confidence,
        accepted: false,
        rejectedReason: "",
      };

      if (!intent || !allowedCandidates.has(fieldId)) {
        trace.rejectedReason = "field was not in the candidate set";
        decisionTrace.push(trace);
        continue;
      }
      if (intent.doNotFillReason) {
        trace.rejectedReason = intent.doNotFillReason;
        decisionTrace.push(trace);
        continue;
      }
      if (confidence < 0.45) {
        trace.rejectedReason = "confidence below fill threshold";
        decisionTrace.push(trace);
        continue;
      }
      if (!isKindCompatible(normalizeValueKind(fact.valueKind), intent.expectedValueKind)) {
        trace.rejectedReason = "value kind conflicted with blank intent";
        decisionTrace.push(trace);
        continue;
      }
      if (!factExplicitlySupportsFlatContext({ ...fact, sourceQuote }, intent)) {
        trace.rejectedReason = "blank required explicit context that was not present in evidence";
        decisionTrace.push(trace);
        continue;
      }
      if (isFlatSelectionControl(intent) && !hasExplicitSelectionEvidence(sourceQuote)) {
        trace.rejectedReason = "selection control lacked explicit selection evidence";
        decisionTrace.push(trace);
        continue;
      }

      const value = overlayValueFromDecision(decision, fact, intent);
      if (isFlatSelectionControl(intent)) {
        if (isFalseValue(value)) {
          trace.rejectedReason = "false selection controls are not applied";
          decisionTrace.push(trace);
          continue;
        }
      } else if (!isTextValueSupportedByEvidence(value, evidenceText)) {
        trace.rejectedReason = "value was not directly supported by evidence text";
        decisionTrace.push(trace);
        continue;
      }

      const overlay: PdfOverlayInput = {
        label: intent.fieldName,
        value,
        pageIndex: intent.pageIndex,
        x: intent.x,
        y: intent.y,
        width: intent.width,
        height: intent.height,
        fontSize: intent.fontSize,
        kind: intent.type,
        confidence,
        visualLabel: intent.visualLabel,
        sourceQuote,
        valueKind: normalizeValueKind(fact.valueKind),
      };
      const previous = bestByFieldName.get(intent.fieldName);
      if (!previous || confidence > previous.confidence) {
        bestByFieldName.set(intent.fieldName, { overlay, confidence });
      }
      if (confidence < 0.75) {
        warnings.push(`Medium-confidence overlay for ${intent.visualLabel}: ${sourceQuote}`);
      }
      trace.accepted = true;
      decisionTrace.push(trace);
    }
  }

  return {
    requestedOverlays: [...bestByFieldName.values()].map((entry) => entry.overlay),
    decisionTrace,
    warnings: Array.from(new Set(warnings)),
  };
}

async function fillFlatPdfOverlay({
  openai,
  templateBytes,
  templateName,
  descriptor,
  contextBlocks,
  warnings,
  includeDecisionTrace,
}: {
  openai: OpenAI;
  templateBytes: Uint8Array;
  templateName: string;
  descriptor: Awaited<ReturnType<typeof inspectPdfForm>>;
  contextBlocks: string[];
  warnings: string[];
  includeDecisionTrace: boolean;
}) {
  const flatIntents = buildFlatTextFieldIntents(descriptor);
  if (flatIntents.length === 0) {
    return NextResponse.json({
      status: "no_fillable_fields",
      message:
        "This PDF has no embedded fields and no readable text geometry for deterministic overlay placement. Scanned PDFs need OCR before filling.",
      document: descriptor,
      summary: {
        warnings: [
          "Flat PDF overlay mode could not find answer blanks from PDF text geometry.",
          ...warnings,
        ],
      },
    });
  }

  const evidence = await extractEvidenceFacts(openai, contextBlocks);
  warnings.push(...(evidence.warnings || []));
  const facts = expandEvidenceFacts(evidence.facts || []);
  const evidenceText = contextBlocks.join("\n\n");
  const { parsed, candidatesByFact, candidatePayload } = await mapFlatFactCandidatesWithModel({
    openai,
    descriptor,
    facts,
    intents: flatIntents,
    contextBlocks,
  });
  const { requestedOverlays, decisionTrace, warnings: decisionWarnings } = overlayInputsFromFlatCandidateDecisions({
    parsed,
    facts,
    intents: flatIntents,
    candidatesByFact,
    evidenceText,
  });
  warnings.push(...decisionWarnings);

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
      extractedFacts: [
        ...facts.map((fact) => `${fact.label}: ${fact.value}`),
        ...(parsed.summary?.extractedFacts || []),
      ],
      assumptions: parsed.summary?.assumptions || [],
      warnings: [
        "Flat PDF overlay mode was used because this PDF has no fillable fields. Review placement before sending.",
        ...(facts.length > MAX_FACTS_FOR_FIELD_MATCHING ? [`${facts.length - MAX_FACTS_FOR_FIELD_MATCHING} extracted facts were omitted from flat-field matching due to fact-count limits.`] : []),
        ...(candidatePayload.length === 0 ? ["No flat blank candidates matched the extracted evidence facts."] : []),
        ...(parsed.summary?.warnings || []),
        ...warnings,
      ],
    },
    ...(includeDecisionTrace
      ? {
          decisionTrace,
          flatFieldCandidateTrace: candidatePayload.map((entry) => ({
            factIndex: entry.factIndex,
            factLabel: entry.fact.label,
            factValue: entry.fact.value,
            factKind: entry.fact.valueKind,
            candidates: entry.candidates.map((candidate) => ({
              fieldId: candidate.fieldId,
              fieldName: candidate.fieldName,
              visualPrompt: candidate.visualPrompt,
              expectedValueKind: candidate.expectedValueKind,
              optionLabel: candidate.optionLabel,
              type: candidate.type,
              pageIndex: candidate.pageIndex,
              score: candidate.score,
            })),
          })),
        }
      : {}),
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
    const includeDecisionTrace = process.env.NODE_ENV !== "production" || String(formData.get("debug") || "") === "1";

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
        includeDecisionTrace,
      });
    }

    const evidence = await extractEvidenceFacts(openai, contextBlocks);
    warnings.push(...(evidence.warnings || []));
    const facts = expandEvidenceFacts(evidence.facts || []);
    const intents = buildFieldIntents(descriptor);
    const omittedFieldCount = Math.max(0, descriptor.fields.length - intents.length);
    const evidenceText = contextBlocks.join("\n\n");
    const { parsed, candidatesByFact, candidatePayload } = await mapFactCandidatesWithModel({
      openai,
      descriptor,
      facts,
      intents,
      contextBlocks,
    });
    const { requestedFills, decisionTrace, warnings: decisionWarnings } = fillInputsFromCandidateDecisions({
      parsed,
      facts,
      intents,
      candidatesByFact,
      evidenceText,
    });
    warnings.push(...decisionWarnings);

    const filled = await fillPdfForm(templateBytes, requestedFills);
    const pdfBase64 = Buffer.from(filled.pdfBytes).toString("base64");

    return NextResponse.json({
      status: "filled",
      mode: "acroform",
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
          ...facts.map((fact) => `${fact.label}: ${fact.value}`),
          ...(parsed.summary?.extractedFacts || []),
        ],
        assumptions: parsed.summary?.assumptions || [],
        warnings: [
          ...(omittedFieldCount > 0 ? [`${omittedFieldCount} fields were omitted from field-intent matching due to field-count limits.`] : []),
          ...(facts.length > MAX_FACTS_FOR_FIELD_MATCHING ? [`${facts.length - MAX_FACTS_FOR_FIELD_MATCHING} extracted facts were omitted from field matching due to fact-count limits.`] : []),
          ...(candidatePayload.length === 0 ? ["No field candidates matched the extracted evidence facts."] : []),
          ...(parsed.summary?.warnings || []),
          ...warnings,
        ],
      },
      ...(includeDecisionTrace
        ? {
            decisionTrace,
            fieldCandidateTrace: candidatePayload.map((entry) => ({
              factIndex: entry.factIndex,
              factLabel: entry.fact.label,
              factValue: entry.fact.value,
              factKind: entry.fact.valueKind,
              candidates: entry.candidates.map((candidate) => ({
                fieldId: candidate.fieldId,
                fieldName: candidate.fieldName,
                visualPrompt: candidate.visualPrompt,
                expectedValueKind: candidate.expectedValueKind,
                blankRoleLabel: candidate.blankRoleLabel,
                optionLabel: candidate.optionLabel,
                type: candidate.type,
                score: candidate.score,
              })),
            })),
          }
        : {}),
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
