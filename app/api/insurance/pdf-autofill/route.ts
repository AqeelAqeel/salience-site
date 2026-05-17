import { NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import { fillPdfForm, inspectPdfForm, type FieldFillInput, type PdfFieldDescriptor } from "@/lib/insurance/pdf-autofill";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_TEMPLATE_BYTES = 12 * 1024 * 1024;
const MAX_CONTEXT_BYTES = 3 * 1024 * 1024;
const MAX_CONTEXT_CHARS = 18000;
const MAX_FIELDS_FOR_MODEL = 320;

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

function parseModelJson(raw: string): ModelAutofillResponse {
  try {
    return JSON.parse(cleanJson(raw)) as ModelAutofillResponse;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as ModelAutofillResponse;
    }
    throw new Error("The model did not return valid JSON.");
  }
}

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
    .slice(0, MAX_FIELDS_FOR_MODEL)
    .map((field) => ({
      name: field.name,
      type: field.type,
      options: field.options,
      readOnly: field.readOnly,
    }));
}

function outputFileName(inputName: string): string {
  const withoutPdf = inputName.replace(/\.pdf$/i, "");
  return `${withoutPdf || "filled-form"}-filled.pdf`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const template = formData.get("template");
    const notes = String(formData.get("notes") || "").trim();
    const voiceNote = formData.get("voiceNote");
    const supportingFiles = formData.getAll("supportingFiles").filter(isFile);

    if (!isFile(template) || !isPdf(template)) {
      return NextResponse.json({ error: "Upload a fillable PDF template." }, { status: 400 });
    }

    if (template.size > MAX_TEMPLATE_BYTES) {
      return NextResponse.json({ error: "PDF templates must be 12MB or smaller." }, { status: 400 });
    }

    const templateBytes = Buffer.from(await template.arrayBuffer());
    const descriptor = await inspectPdfForm(templateBytes);

    if (descriptor.fieldCount === 0) {
      return NextResponse.json({
        status: "no_fillable_fields",
        message: "This PDF does not expose fillable AcroForm fields.",
        document: descriptor,
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          status: "missing_api_key",
          message: "OPENAI_API_KEY is required to extract notes into PDF fields.",
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

    const modelFields = fieldListForModel(descriptor.fields);
    const omittedFieldCount = Math.max(0, descriptor.fields.filter((field) => !field.readOnly).length - modelFields.length);

    const response = await openai.chat.completions.create({
      model: process.env.PDF_AUTOFILL_MODEL || "gpt-4o",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a careful insurance-brokerage PDF form filling agent.

Map user-provided evidence into the exact PDF field names supplied by the application.

Rules:
- Use only fieldName values from the supplied PDF field list.
- Do not invent facts, policy numbers, tax IDs, signatures, initials, or legal attestations.
- Fill a field only when the evidence directly supports it.
- Use concise values that belong in a PDF field, not prose.
- For checkbox fields, return true or false only when the evidence clearly answers the checkbox.
- For dropdown, option_list, and radio fields, choose one of the supplied options when options exist.
- Return JSON only, with this shape:
{
  "documentTitle": "human readable form name",
  "fieldValues": [
    { "fieldName": "exact PDF field name", "value": "value to fill", "confidence": 0.0, "sourceQuote": "short evidence quote", "reasoning": "short reason" }
  ],
  "unfilledFields": [
    { "fieldName": "exact PDF field name", "reason": "why missing", "followUpQuestion": "one concise question" }
  ],
  "summary": {
    "extractedFacts": ["important facts used"],
    "assumptions": ["only assumptions made"],
    "warnings": ["risks, low confidence items, legal fields left blank"]
  }
}`,
        },
        {
          role: "user",
          content: `PDF metadata:
${JSON.stringify({ title: descriptor.title, author: descriptor.author, subject: descriptor.subject, fieldCount: descriptor.fieldCount, omittedFieldCount }, null, 2)}

Fillable PDF fields:
${JSON.stringify(modelFields, null, 2)}

Evidence:
${contextBlocks.join("\n\n")}`,
        },
      ],
    });

    const raw = response.choices[0]?.message?.content || "{}";
    const parsed = parseModelJson(raw);
    const fieldNames = new Set(descriptor.fields.map((field) => field.name));
    const requestedFills: FieldFillInput[] = (parsed.fieldValues || [])
      .filter((field) => field.fieldName && fieldNames.has(field.fieldName))
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
        extractedFacts: parsed.summary?.extractedFacts || [],
        assumptions: parsed.summary?.assumptions || [],
        warnings: [...(parsed.summary?.warnings || []), ...warnings],
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
