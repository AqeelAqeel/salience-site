import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createCanvas, DOMMatrix, ImageData, Path2D } from "@napi-rs/canvas";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import * as worker from "pdfjs-dist/legacy/build/pdf.worker.mjs";

const DEFAULT_URL = "http://localhost:3017/api/insurance/pdf-autofill";

function usage() {
  console.error(`Usage:
  npm run pdf:wet-test -- --pdf /path/form.pdf --notes "facts to fill"

Options:
  --url URL             API endpoint. Default: ${DEFAULT_URL}
  --pdf PATH            PDF template to upload. Required.
  --notes TEXT          Notes/transcript text.
  --notes-file PATH     Read notes from a file.
  --source PATH         Supporting file. Can be repeated.
  --out PREFIX          Output prefix. Default: /tmp/pdf-autofill-wet-test
  --pages 1,2           1-based pages to render. Defaults to pages with applied fields, then page 1.
`);
}

function parseArgs(argv) {
  const args = {
    url: DEFAULT_URL,
    sources: [],
    out: "/tmp/pdf-autofill-wet-test",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];
    if (arg === "--url") {
      args.url = value;
      index += 1;
    } else if (arg === "--pdf") {
      args.pdf = value;
      index += 1;
    } else if (arg === "--notes") {
      args.notes = value;
      index += 1;
    } else if (arg === "--notes-file") {
      args.notesFile = value;
      index += 1;
    } else if (arg === "--source") {
      args.sources.push(value);
      index += 1;
    } else if (arg === "--out") {
      args.out = value;
      index += 1;
    } else if (arg === "--pages") {
      args.pages = value;
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!args.pdf) throw new Error("--pdf is required");
  return args;
}

function mimeForFile(filePath) {
  const name = filePath.toLowerCase();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".json")) return "application/json";
  if (name.endsWith(".csv")) return "text/csv";
  if (name.endsWith(".md")) return "text/markdown";
  return "text/plain";
}

async function appendFile(form, key, filePath) {
  const bytes = await fs.readFile(filePath);
  form.append(key, new Blob([bytes], { type: mimeForFile(filePath) }), path.basename(filePath));
}

function fieldPageMap(document) {
  const pages = new Map();
  for (const field of document?.fields || []) {
    if (field?.fieldName && Number.isInteger(field.pageIndex)) pages.set(field.fieldName, field.pageIndex);
    if (field?.name && Number.isInteger(field.pageIndex)) pages.set(field.name, field.pageIndex);
  }
  return pages;
}

function pagesToRender(result, explicitPages) {
  if (explicitPages) {
    return explicitPages
      .split(",")
      .map((page) => Number(page.trim()) - 1)
      .filter((page) => Number.isInteger(page) && page >= 0);
  }

  const pagesByField = fieldPageMap(result.document);
  const pages = new Set();
  for (const field of result.appliedFields || []) {
    const page = pagesByField.get(field.fieldName);
    if (Number.isInteger(page)) pages.add(page);
  }
  if (pages.size === 0) pages.add(0);
  return [...pages].sort((left, right) => left - right).slice(0, 4);
}

async function renderPages(pdfBytes, pages, outPrefix) {
  globalThis.pdfjsWorker = worker;
  Object.assign(globalThis, { DOMMatrix, ImageData, Path2D });

  const pdf = await pdfjs.getDocument({
    data: new Uint8Array(pdfBytes),
    useSystemFonts: true,
  }).promise;
  const written = [];

  for (const pageIndex of pages) {
    if (pageIndex < 0 || pageIndex >= pdf.numPages) continue;
    const page = await pdf.getPage(pageIndex + 1);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const context = canvas.getContext("2d");
    await page.render({ canvasContext: context, viewport }).promise;
    const outputPath = `${outPrefix}-page-${pageIndex + 1}.png`;
    await fs.writeFile(outputPath, canvas.toBuffer("image/png"));
    written.push(outputPath);
  }

  return written;
}

function printList(title, rows, formatter) {
  console.log(`\n${title}`);
  if (!rows?.length) {
    console.log("  (none)");
    return;
  }
  for (const row of rows) {
    console.log(`  - ${formatter(row)}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const notes = args.notesFile ? await fs.readFile(args.notesFile, "utf8") : args.notes || "";
  const form = new FormData();

  await appendFile(form, "template", args.pdf);
  form.append("notes", notes);
  form.append("debug", "1");
  for (const source of args.sources) {
    await appendFile(form, "supportingFiles", source);
  }

  const response = await fetch(args.url, {
    method: "POST",
    body: form,
  });
  const result = await response.json();

  if (!response.ok || result.error) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  await fs.writeFile(`${args.out}.json`, JSON.stringify(result, null, 2));
  console.log(`Status: ${result.status}${result.mode ? ` (${result.mode})` : ""}`);
  console.log(`Filled: ${result.filledCount ?? 0}/${result.attemptedCount ?? 0}`);
  console.log(`JSON: ${args.out}.json`);

  printList("Applied fields", result.appliedFields, (field) =>
    `${field.fieldName} = ${field.value}${field.confidence !== undefined ? ` (${Math.round(field.confidence * 100)}%)` : ""}${field.sourceQuote ? ` | ${field.sourceQuote}` : ""}`
  );
  printList("Skipped fields", result.skippedFields, (field) => `${field.fieldName}: ${field.reason}`);
  printList("Unfilled fields", result.unfilledFields, (field) => `${field.fieldName}: ${field.reason}`);
  printList("Warnings", result.summary?.warnings, (warning) => warning);

  if (result.pdfBase64) {
    const pdfBytes = Buffer.from(result.pdfBase64, "base64");
    const pdfPath = `${args.out}.pdf`;
    await fs.writeFile(pdfPath, pdfBytes);
    const pageImages = await renderPages(pdfBytes, pagesToRender(result, args.pages), args.out);
    console.log(`\nPDF: ${pdfPath}`);
    for (const imagePath of pageImages) {
      console.log(`PNG: ${imagePath}`);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  usage();
  process.exit(1);
});
