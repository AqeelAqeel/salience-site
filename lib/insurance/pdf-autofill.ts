import {
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFOptionList,
  PDFRadioGroup,
  PDFTextField,
  StandardFonts,
} from "pdf-lib";

export type PdfFieldKind =
  | "text"
  | "checkbox"
  | "dropdown"
  | "option_list"
  | "radio"
  | "unknown";

export interface PdfFieldDescriptor {
  name: string;
  type: PdfFieldKind;
  options?: string[];
  readOnly: boolean;
}

export interface PdfDocumentDescriptor {
  title: string | null;
  author: string | null;
  subject: string | null;
  fieldCount: number;
  fields: PdfFieldDescriptor[];
}

export interface FieldFillInput {
  fieldName: string;
  value: unknown;
  confidence?: number;
}

export interface AppliedFieldFill {
  fieldName: string;
  type: PdfFieldKind;
  value: string;
}

export interface SkippedFieldFill {
  fieldName: string;
  reason: string;
}

function getFieldType(field: unknown): PdfFieldKind {
  if (field instanceof PDFTextField) return "text";
  if (field instanceof PDFCheckBox) return "checkbox";
  if (field instanceof PDFDropdown) return "dropdown";
  if (field instanceof PDFOptionList) return "option_list";
  if (field instanceof PDFRadioGroup) return "radio";
  return "unknown";
}

function getFieldOptions(field: unknown): string[] | undefined {
  try {
    if (field instanceof PDFDropdown || field instanceof PDFOptionList || field instanceof PDFRadioGroup) {
      const options = field.getOptions();
      return options.length > 0 ? options : undefined;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function getReadOnly(field: { isReadOnly?: () => boolean }): boolean {
  try {
    return Boolean(field.isReadOnly?.());
  } catch {
    return false;
  }
}

export async function inspectPdfForm(pdfBytes: Uint8Array): Promise<PdfDocumentDescriptor> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();
  const fields = form.getFields().map((field) => ({
    name: field.getName(),
    type: getFieldType(field),
    options: getFieldOptions(field),
    readOnly: getReadOnly(field),
  }));

  return {
    title: pdfDoc.getTitle() || null,
    author: pdfDoc.getAuthor() || null,
    subject: pdfDoc.getSubject() || null,
    fieldCount: fields.length,
    fields,
  };
}

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(stringifyValue).filter(Boolean).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).trim();
}

function normalizeChoice(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function optionMatch(options: string[] | undefined, raw: string): string | null {
  if (!options || options.length === 0) return raw || null;

  const normalizedRaw = normalizeChoice(raw);
  if (!normalizedRaw) return null;

  return (
    options.find((option) => option === raw) ||
    options.find((option) => option.toLowerCase() === raw.toLowerCase()) ||
    options.find((option) => normalizeChoice(option) === normalizedRaw) ||
    null
  );
}

function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;

  const normalized = stringifyValue(value).toLowerCase();
  return ["true", "yes", "y", "1", "x", "checked", "check", "on", "selected"].includes(normalized);
}

export async function fillPdfForm(
  pdfBytes: Uint8Array,
  requestedFills: FieldFillInput[]
): Promise<{
  pdfBytes: Uint8Array;
  applied: AppliedFieldFill[];
  skipped: SkippedFieldFill[];
}> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const applied: AppliedFieldFill[] = [];
  const skipped: SkippedFieldFill[] = [];

  for (const requestedFill of requestedFills) {
    const rawValue = stringifyValue(requestedFill.value);

    if (!rawValue) {
      skipped.push({ fieldName: requestedFill.fieldName, reason: "No value provided" });
      continue;
    }

    let field: ReturnType<typeof form.getFields>[number] | undefined;
    try {
      field = form.getField(requestedFill.fieldName);
    } catch {
      skipped.push({ fieldName: requestedFill.fieldName, reason: "PDF field not found" });
      continue;
    }

    if (getReadOnly(field)) {
      skipped.push({ fieldName: requestedFill.fieldName, reason: "PDF field is read-only" });
      continue;
    }

    const type = getFieldType(field);

    try {
      if (field instanceof PDFTextField) {
        field.setText(rawValue);
        applied.push({ fieldName: requestedFill.fieldName, type, value: rawValue });
      } else if (field instanceof PDFCheckBox) {
        if (toBoolean(requestedFill.value)) {
          field.check();
        } else {
          field.uncheck();
        }
        applied.push({ fieldName: requestedFill.fieldName, type, value: rawValue });
      } else if (field instanceof PDFDropdown || field instanceof PDFRadioGroup) {
        const match = optionMatch(getFieldOptions(field), rawValue);
        if (!match) {
          skipped.push({ fieldName: requestedFill.fieldName, reason: "No matching option" });
          continue;
        }
        field.select(match);
        applied.push({ fieldName: requestedFill.fieldName, type, value: match });
      } else if (field instanceof PDFOptionList) {
        const values = Array.isArray(requestedFill.value)
          ? requestedFill.value.map(stringifyValue)
          : rawValue.split(",").map((part) => part.trim());
        const matches = values
          .map((value) => optionMatch(getFieldOptions(field), value))
          .filter((value): value is string => Boolean(value));

        if (matches.length === 0) {
          skipped.push({ fieldName: requestedFill.fieldName, reason: "No matching option" });
          continue;
        }

        field.select(matches);
        applied.push({ fieldName: requestedFill.fieldName, type, value: matches.join(", ") });
      } else {
        skipped.push({ fieldName: requestedFill.fieldName, reason: `Unsupported PDF field type: ${type}` });
      }
    } catch (error) {
      skipped.push({
        fieldName: requestedFill.fieldName,
        reason: error instanceof Error ? error.message : "Failed to fill field",
      });
    }
  }

  try {
    form.updateFieldAppearances(font);
  } catch {
    // Some PDFs have malformed appearances. The filled values are still saved.
  }

  const savedBytes = await pdfDoc.save();

  return {
    pdfBytes: savedBytes,
    applied,
    skipped,
  };
}
