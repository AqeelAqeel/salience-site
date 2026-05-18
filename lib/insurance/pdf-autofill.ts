import {
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFOptionList,
  PDFRadioGroup,
  PDFTextField,
  StandardFonts,
  rgb,
} from "pdf-lib";

type PdfTransform = [number, number, number, number, number, number];

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
    x?: number;
    y: number;
    width?: number;
    height?: number;
    text: string;
  }>;
  textItems?: Array<{
    text: string;
    x: number;
    y: number;
    width: number;
    height?: number;
    lineIndex?: number;
  }>;
}

export interface FieldFillInput {
  fieldName: string;
  value: unknown;
  confidence?: number;
  visualLabel?: string;
  sourceQuote?: string;
  valueKind?: string;
}

export interface AppliedFieldFill {
  fieldName: string;
  type: PdfFieldKind | "overlay_text" | "overlay_checkbox";
  value: string;
  visualLabel?: string;
  confidence?: number;
  sourceQuote?: string;
  valueKind?: string;
}

export interface SkippedFieldFill {
  fieldName: string;
  reason: string;
}

export interface PdfPageImageDescriptor {
  pageIndex: number;
  width: number;
  height: number;
  scale: number;
  transform: PdfTransform;
  mimeType: "image/png";
  dataUrl: string;
}

export interface PdfOverlayInput {
  label: string;
  value: string | number | boolean | null;
  pageIndex: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  kind?: "text" | "checkbox";
  confidence?: number;
  visualLabel?: string;
  sourceQuote?: string;
  valueKind?: string;
  coordinateSpace?: {
    width: number;
    height: number;
    scale: number;
    transform: PdfTransform;
  };
}

async function loadPdfJs() {
  const [pdfjs, worker] = await Promise.all([
    import("pdfjs-dist/legacy/build/pdf.mjs"),
    import("pdfjs-dist/legacy/build/pdf.worker.mjs"),
  ]);

  (globalThis as typeof globalThis & { pdfjsWorker?: typeof worker }).pdfjsWorker = worker;
  return pdfjs;
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

function getLineText(items: Array<{ str: string; x: number; y: number; width?: number }>): string {
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
    const pdfjs = await loadPdfJs();
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(pdfBytes),
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
            width: "width" in item ? Number(item.width) || 0 : 0,
            height: "height" in item ? Number(item.height) || 0 : 0,
          };
        })
        .filter((item): item is { str: string; x: number; y: number; width: number; height: number } =>
          Boolean(item)
        );

      const lines: Array<{
        y: number;
        items: Array<{ str: string; x: number; y: number; width: number; height: number }>;
      }> = [];
      for (const item of rawItems.sort((a, b) => b.y - a.y || a.x - b.x)) {
        const line = lines.find((candidate) => Math.abs(candidate.y - item.y) < 3);
        if (line) {
          line.items.push(item);
        } else {
          lines.push({ y: item.y, items: [item] });
        }
      }

      const sortedLines = lines.sort((a, b) => b.y - a.y || Math.min(...a.items.map((item) => item.x)) - Math.min(...b.items.map((item) => item.x)));
      const textLines = sortedLines
        .map((line) => {
          const left = Math.min(...line.items.map((item) => item.x));
          const right = Math.max(...line.items.map((item) => item.x + item.width));
          const itemHeights = line.items.map((item) => item.height).filter(Boolean);

          return {
            x: left,
            y: line.y,
            width: right - left,
            height: itemHeights.length ? Math.max(...itemHeights) : undefined,
            text: getLineText(line.items),
          };
        })
        .filter((line) => line.text);
      const textItems = sortedLines.flatMap((line, lineIndex) =>
        line.items
          .sort((a, b) => a.x - b.x)
          .map((item) => ({
            text: item.str.replace(/\s+/g, " ").trim(),
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height || undefined,
            lineIndex,
          }))
          .filter((item) => item.text)
      );

      pages.push({
        pageIndex: pageNumber - 1,
        width: viewport.width,
        height: viewport.height,
        textLines: textLines.slice(0, 180),
        textItems: textItems.slice(0, 1200),
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

export async function renderPdfPageImages(
  pdfBytes: Uint8Array,
  options: { maxPages?: number; scale?: number; includeCoordinateGrid?: boolean } = {}
): Promise<PdfPageImageDescriptor[]> {
  const maxPages = options.maxPages ?? 4;
  const scale = options.scale ?? 1.25;

  const [{ createCanvas, DOMMatrix, ImageData, Path2D }, pdfjs] = await Promise.all([
    import("@napi-rs/canvas"),
    loadPdfJs(),
  ]);
  Object.assign(globalThis, {
    DOMMatrix,
    ImageData,
    Path2D,
  });
  const pdf = await pdfjs.getDocument({
    data: new Uint8Array(pdfBytes),
    useSystemFonts: true,
  } as Parameters<typeof pdfjs.getDocument>[0]).promise;
  const images: PdfPageImageDescriptor[] = [];

  for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, maxPages); pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const context = canvas.getContext("2d");
    await page.render({
      canvasContext: context,
      viewport,
    } as unknown as Parameters<typeof page.render>[0]).promise;

    if (options.includeCoordinateGrid) {
      drawCoordinateGrid(context, canvas.width, canvas.height);
    }

    images.push({
      pageIndex: pageNumber - 1,
      width: viewport.width,
      height: viewport.height,
      scale,
      transform: viewport.transform as PdfTransform,
      mimeType: "image/png",
      dataUrl: `data:image/png;base64,${canvas.toBuffer("image/png").toString("base64")}`,
    });
  }

  return images;
}

function drawCoordinateGrid(
  context: ReturnType<ReturnType<typeof import("@napi-rs/canvas")["createCanvas"]>["getContext"]>,
  width: number,
  height: number
): void {
  context.save();
  context.strokeStyle = "rgba(14, 116, 144, 0.28)";
  context.fillStyle = "rgba(14, 116, 144, 0.78)";
  context.lineWidth = 1;
  context.font = "11px sans-serif";

  for (let step = 0; step <= 20; step += 1) {
    const x = Math.round((step / 20) * width);
    const y = Math.round((step / 20) * height);
    const label = (step / 20).toFixed(2);

    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
    context.fillText(label, Math.min(width - 26, x + 2), 12);

    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
    context.fillText(label, 2, Math.max(12, y - 2));
  }

  context.restore();
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
      textLines: pages.find((textPage) => textPage.pageIndex === page.pageIndex)?.textLines,
      textItems: pages.find((textPage) => textPage.pageIndex === page.pageIndex)?.textItems,
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

function getFieldRectangles(field: unknown): Array<{ width: number; height: number }> {
  const acroField = (field as { acroField?: { getWidgets?: () => unknown[] } }).acroField;
  const widgets = acroField?.getWidgets?.() || [];

  return widgets
    .map((widget) => (widget as { getRectangle?: () => { width: number; height: number } }).getRectangle?.())
    .filter((rect): rect is { width: number; height: number } => Boolean(rect));
}

function getReadableFontSize(field: unknown, rawValue: string): number {
  const rects = getFieldRectangles(field);
  const shortestHeight = Math.min(...rects.map((rect) => Math.abs(rect.height)).filter(Boolean));
  const narrowestWidth = Math.min(...rects.map((rect) => Math.abs(rect.width)).filter(Boolean));

  if (!Number.isFinite(shortestHeight)) return 9;

  let fontSize = Math.min(10.5, Math.max(7.2, shortestHeight * 0.82));

  if (Number.isFinite(narrowestWidth) && rawValue.length > 0) {
    const density = rawValue.length / Math.max(1, narrowestWidth);
    if (density > 0.32) fontSize -= 0.8;
    if (density > 0.45) fontSize -= 0.8;
  }

  return Math.round(Math.max(6.8, fontSize) * 10) / 10;
}

function setReadableFontSize(field: unknown, rawValue: string): void {
  const fontSize = getReadableFontSize(field, rawValue);
  const maybeTextField = field as { setFontSize?: (fontSize: number) => void };

  try {
    maybeTextField.setFontSize?.(fontSize);
  } catch {
    // Some third-party PDFs have malformed /DA entries. Keep the value fill.
  }
}

function fillMetadata(requestedFill: FieldFillInput): Omit<AppliedFieldFill, "fieldName" | "type" | "value"> {
  return {
    confidence: requestedFill.confidence,
    visualLabel: requestedFill.visualLabel,
    sourceQuote: requestedFill.sourceQuote,
    valueKind: requestedFill.valueKind,
  };
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
        setReadableFontSize(field, rawValue);
        field.setText(rawValue);
        applied.push({ fieldName: requestedFill.fieldName, type, value: rawValue, ...fillMetadata(requestedFill) });
      } else if (field instanceof PDFCheckBox) {
        if (toBoolean(requestedFill.value)) {
          field.check();
        } else {
          field.uncheck();
        }
        applied.push({ fieldName: requestedFill.fieldName, type, value: rawValue, ...fillMetadata(requestedFill) });
      } else if (field instanceof PDFDropdown || field instanceof PDFRadioGroup) {
        const match = optionMatch(getFieldOptions(field), rawValue);
        if (!match) {
          skipped.push({ fieldName: requestedFill.fieldName, reason: "No matching option" });
          continue;
        }
        if (field instanceof PDFDropdown) setReadableFontSize(field, match);
        field.select(match);
        applied.push({ fieldName: requestedFill.fieldName, type, value: match, ...fillMetadata(requestedFill) });
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

        setReadableFontSize(field, matches.join(", "));
        field.select(matches);
        applied.push({ fieldName: requestedFill.fieldName, type, value: matches.join(", "), ...fillMetadata(requestedFill) });
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

function normalizeCoordinate(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function invertTransform(transform: PdfTransform): PdfTransform | null {
  const [a, b, c, d, e, f] = transform;
  const determinant = a * d - b * c;
  if (!Number.isFinite(determinant) || Math.abs(determinant) < 0.000001) return null;

  return [
    d / determinant,
    -b / determinant,
    -c / determinant,
    a / determinant,
    (c * f - d * e) / determinant,
    (b * e - a * f) / determinant,
  ];
}

function applyTransform(transform: PdfTransform, x: number, y: number): { x: number; y: number } {
  const [a, b, c, d, e, f] = transform;
  return {
    x: a * x + c * y + e,
    y: b * x + d * y + f,
  };
}

function getOverlayPoint(
  overlay: PdfOverlayInput,
  pageWidth: number,
  pageHeight: number,
  yOffset = 0,
  xOffset = 0
): { x: number; y: number } {
  const coordinateSpace = overlay.coordinateSpace;
  if (coordinateSpace) {
    const inverse = invertTransform(coordinateSpace.transform);
    if (inverse) {
      const scale = Number.isFinite(coordinateSpace.scale) && coordinateSpace.scale > 0 ? coordinateSpace.scale : 1;
      return applyTransform(
        inverse,
        normalizeCoordinate(overlay.x) * coordinateSpace.width + xOffset * scale,
        normalizeCoordinate(overlay.y) * coordinateSpace.height + yOffset * scale
      );
    }
  }

  const x = normalizeCoordinate(overlay.x) * pageWidth + xOffset;
  const yFromTop = normalizeCoordinate(overlay.y) * pageHeight + yOffset;
  return {
    x,
    y: pageHeight - yFromTop,
  };
}

function wrapText(
  text: string,
  maxWidth: number,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  fontSize: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, fontSize) <= maxWidth || !current) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 4);
}

export async function fillPdfOverlay(
  pdfBytes: Uint8Array,
  requestedOverlays: PdfOverlayInput[]
): Promise<{
  pdfBytes: Uint8Array;
  applied: AppliedFieldFill[];
  skipped: SkippedFieldFill[];
}> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const applied: AppliedFieldFill[] = [];
  const skipped: SkippedFieldFill[] = [];

  for (const overlay of requestedOverlays) {
    const page = pages[overlay.pageIndex];
    const fieldName = overlay.label || `Overlay ${applied.length + skipped.length + 1}`;
    const rawValue = stringifyValue(overlay.value);

    if (!page) {
      skipped.push({ fieldName, reason: "Page not found" });
      continue;
    }

    if (!rawValue) {
      skipped.push({ fieldName, reason: "No value provided" });
      continue;
    }

    const { width: pageWidth, height: pageHeight } = page.getSize();
    const fontSize = Math.min(14, Math.max(7, overlay.fontSize || 10));
    const maxWidth = Math.max(
      24,
      normalizeCoordinate(overlay.width ?? 0.28) *
        ((overlay.coordinateSpace?.width ?? pageWidth) / (overlay.coordinateSpace?.scale || 1))
    );
    const color = rgb(0.05, 0.08, 0.14);

    try {
      if (overlay.kind === "checkbox") {
        const mark = toBoolean(overlay.value) ? "X" : "";
        if (!mark) {
          skipped.push({ fieldName, reason: "Checkbox value was not affirmative" });
          continue;
        }
        const markSize = fontSize + 1;
        const markWidth = font.widthOfTextAtSize(mark, markSize);
        const point = getOverlayPoint(overlay, pageWidth, pageHeight, markSize * 0.35, -markWidth / 2);
        page.drawText(mark, {
          x: point.x,
          y: point.y,
          size: markSize,
          font,
          color,
        });
        applied.push({
          fieldName,
          type: "overlay_checkbox",
          value: rawValue,
          confidence: overlay.confidence,
          visualLabel: overlay.visualLabel || overlay.label,
          sourceQuote: overlay.sourceQuote,
          valueKind: overlay.valueKind,
        });
        continue;
      }

      const lines = wrapText(rawValue, maxWidth, font, fontSize);
      lines.forEach((line, index) => {
        const point = getOverlayPoint(
          overlay,
          pageWidth,
          pageHeight,
          fontSize * 0.75 + index * (fontSize + 2)
        );
        page.drawRectangle({
          x: point.x - 1,
          y: point.y - 1,
          width: Math.min(maxWidth, font.widthOfTextAtSize(line, fontSize) + 3),
          height: fontSize + 3,
          color: rgb(1, 1, 1),
        });
        page.drawText(line, {
          x: point.x,
          y: point.y,
          size: fontSize,
          font,
          color,
          maxWidth,
        });
      });
      applied.push({
        fieldName,
        type: "overlay_text",
        value: rawValue,
        confidence: overlay.confidence,
        visualLabel: overlay.visualLabel || overlay.label,
        sourceQuote: overlay.sourceQuote,
        valueKind: overlay.valueKind,
      });
    } catch (error) {
      skipped.push({
        fieldName,
        reason: error instanceof Error ? error.message : "Failed to draw overlay",
      });
    }
  }

  return {
    pdfBytes: await pdfDoc.save(),
    applied,
    skipped,
  };
}
