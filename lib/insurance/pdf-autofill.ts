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
  visualOrder?: number;
  nameHints?: string[];
  isMessyName?: boolean;
  pageIndex?: number;
  position?: string;
  rect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  widgets?: Array<{
    pageIndex?: number;
    position?: string;
    rect: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  nearbyText?: string[];
}

export interface PdfDocumentDescriptor {
  title: string | null;
  author: string | null;
  subject: string | null;
  fieldCount: number;
  fields: PdfFieldDescriptor[];
  pages: PdfPageDescriptor[];
  fieldNameQuality: "semantic" | "mixed" | "messy";
}

export interface PdfPageDescriptor {
  pageIndex: number;
  width: number;
  height: number;
  textPreview: string;
  textLines?: Array<{
    y: number;
    text: string;
  }>;
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

function normalizeFieldToken(token: string): string {
  return token
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function getNameHints(name: string): string[] {
  const ignored = new Set([
    "topmost",
    "subform",
    "page",
    "read",
    "order",
    "form",
    "field",
    "text",
    "button",
    "checkbox",
    "radio",
  ]);
  const hints = normalizeFieldToken(name)
    .split(/\s+/)
    .filter((token) => token.length > 1)
    .filter((token) => !/^[a-z]?\d+$/.test(token))
    .filter((token) => !/^f\d+$/.test(token))
    .filter((token) => !/^c\d+$/.test(token))
    .filter((token) => !ignored.has(token));

  return Array.from(new Set(hints)).slice(0, 8);
}

function isMessyFieldName(name: string, hints: string[]): boolean {
  return (
    hints.length === 0 ||
    /topmostSubform|Page\d|f\d+_\d+|c\d+_\d+|^\w?\d+$/i.test(name) ||
    name.split(/[.[\]_/ -]+/).filter(Boolean).length > 5
  );
}

function getPositionLabel(
  rect: { x: number; y: number; width: number; height: number },
  page: { width: number; height: number } | undefined
): string | undefined {
  if (!page) return undefined;

  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  const horizontal = centerX < page.width / 3 ? "left" : centerX > (page.width * 2) / 3 ? "right" : "center";
  const vertical = centerY > (page.height * 2) / 3 ? "top" : centerY < page.height / 3 ? "bottom" : "middle";

  return `${vertical} ${horizontal}`;
}

function getFieldWidgets(
  field: unknown,
  pageIndexes: Map<string, number>,
  pages: Array<{ width: number; height: number }>
): PdfFieldDescriptor["widgets"] {
  const acroField = (field as { acroField?: { getWidgets?: () => unknown[] } }).acroField;
  const widgets = acroField?.getWidgets?.() || [];
  const descriptors: NonNullable<PdfFieldDescriptor["widgets"]> = [];

  for (const widget of widgets) {
    const typedWidget = widget as {
      getRectangle?: () => { x: number; y: number; width: number; height: number };
      P?: () => { tag?: string };
    };
    const rect = typedWidget.getRectangle?.();
    if (!rect) continue;

    const pageRef = typedWidget.P?.();
    const pageIndex = pageRef?.tag ? pageIndexes.get(pageRef.tag) : undefined;

    descriptors.push({
      pageIndex,
      position: getPositionLabel(rect, pageIndex === undefined ? undefined : pages[pageIndex]),
      rect,
    });
  }

  return descriptors.slice(0, 12);
}

function compareFieldPosition(a: PdfFieldDescriptor, b: PdfFieldDescriptor): number {
  const aPage = a.pageIndex ?? Number.MAX_SAFE_INTEGER;
  const bPage = b.pageIndex ?? Number.MAX_SAFE_INTEGER;
  if (aPage !== bPage) return aPage - bPage;

  const aRect = a.rect;
  const bRect = b.rect;
  if (aRect && bRect) {
    const yDiff = bRect.y - aRect.y;
    if (Math.abs(yDiff) > 2) return yDiff;
    return aRect.x - bRect.x;
  }

  if (aRect) return -1;
  if (bRect) return 1;
  return a.name.localeCompare(b.name);
}

function summarizeFieldNameQuality(fields: PdfFieldDescriptor[]): PdfDocumentDescriptor["fieldNameQuality"] {
  if (fields.length === 0) return "semantic";
  const messyCount = fields.filter((field) => field.isMessyName).length;
  const ratio = messyCount / fields.length;
  if (ratio >= 0.65) return "messy";
  if (ratio >= 0.25) return "mixed";
  return "semantic";
}

function getLineText(items: Array<{ str: string; x: number; y: number }>): string {
  return items
    .sort((a, b) => a.x - b.x)
    .map((item) => item.str.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function getNearbyText(
  rect: { x: number; y: number; width: number; height: number } | undefined,
  page: PdfPageDescriptor | undefined
): string[] | undefined {
  if (!rect || !page?.textLines?.length) return undefined;

  const centerY = rect.y + rect.height / 2;
  const lines = page.textLines
    .map((line) => ({
      text: line.text,
      distance: Math.abs(line.y - centerY),
    }))
    .filter((line) => line.distance <= 46)
    .sort((a, b) => a.distance - b.distance)
    .map((line) => line.text)
    .filter(Boolean);

  return Array.from(new Set(lines)).slice(0, 5);
}

async function extractPdfPages(pdfBytes: Uint8Array): Promise<PdfPageDescriptor[]> {
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(pdfBytes),
      disableWorker: true,
      useSystemFonts: true,
    } as Parameters<typeof pdfjs.getDocument>[0]);
    const pdf = await loadingTask.promise;
    const pages: PdfPageDescriptor[] = [];

    for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, 8); pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();
      const rawItems = content.items
        .map((item) => {
          if (!("str" in item) || !item.str.trim()) return null;
          const transform = "transform" in item ? item.transform : undefined;
          return {
            str: item.str,
            x: Array.isArray(transform) ? Number(transform[4]) || 0 : 0,
            y: Array.isArray(transform) ? Number(transform[5]) || 0 : 0,
          };
        })
        .filter((item): item is { str: string; x: number; y: number } => Boolean(item));

      const lines: Array<{ y: number; items: Array<{ str: string; x: number; y: number }> }> = [];
      for (const item of rawItems.sort((a, b) => b.y - a.y || a.x - b.x)) {
        const line = lines.find((candidate) => Math.abs(candidate.y - item.y) < 3);
        if (line) {
          line.items.push(item);
        } else {
          lines.push({ y: item.y, items: [item] });
        }
      }

      const textLines = lines
        .map((line) => ({
          y: line.y,
          text: getLineText(line.items),
        }))
        .filter((line) => line.text);

      pages.push({
        pageIndex: pageNumber - 1,
        width: viewport.width,
        height: viewport.height,
        textLines: textLines.slice(0, 180),
        textPreview: textLines
          .map((line) => line.text)
          .slice(0, 90)
          .join("\n")
          .slice(0, 5000),
      });
    }

    return pages;
  } catch {
    return [];
  }
}

export async function extractPdfTextPreview(pdfBytes: Uint8Array): Promise<string> {
  const pages = await extractPdfPages(pdfBytes);
  return pages
    .filter((page) => page.textPreview.trim())
    .map((page) => `<page index="${page.pageIndex + 1}">\n${page.textPreview}\n</page>`)
    .join("\n\n");
}

export async function inspectPdfForm(pdfBytes: Uint8Array): Promise<PdfDocumentDescriptor> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();
  const pdfPages = pdfDoc.getPages();
  const pageIndexes = new Map(pdfPages.map((page, index) => [page.ref.tag, index]));
  const pages = await extractPdfPages(pdfBytes);
  const fallbackPages = pdfPages.map((page, pageIndex) => {
    const size = page.getSize();
    return {
      pageIndex,
      width: size.width,
      height: size.height,
    };
  });

  const fields = form
    .getFields()
    .map((field) => {
      const name = field.getName();
      const nameHints = getNameHints(name);
      const widgets = getFieldWidgets(field, pageIndexes, fallbackPages);
      const firstWidget = widgets?.[0];

      return {
        name,
        type: getFieldType(field),
        options: getFieldOptions(field),
        readOnly: getReadOnly(field),
        nameHints,
        isMessyName: isMessyFieldName(name, nameHints),
        widgets,
        pageIndex: firstWidget?.pageIndex,
        position: firstWidget?.position,
        rect: firstWidget?.rect,
        nearbyText: getNearbyText(
          firstWidget?.rect,
          firstWidget?.pageIndex === undefined
            ? undefined
            : pages.find((page) => page.pageIndex === firstWidget.pageIndex)
        ),
      };
    })
    .sort(compareFieldPosition)
    .map((field, visualOrder) => ({ ...field, visualOrder: visualOrder + 1 }));

  return {
    title: pdfDoc.getTitle() || null,
    author: pdfDoc.getAuthor() || null,
    subject: pdfDoc.getSubject() || null,
    fieldCount: fields.length,
    fields,
    pages: fallbackPages.map((page) => ({
      ...page,
      textPreview: pages.find((textPage) => textPage.pageIndex === page.pageIndex)?.textPreview || "",
    })),
    fieldNameQuality: summarizeFieldNameQuality(fields),
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
