"use client";

import { useEffect, useRef, useState } from "react";
import type { DragEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  FileAudio,
  FileText,
  Loader2,
  Mic,
  RefreshCcw,
  Sparkles,
  Square,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AutofillResult {
  status: "filled" | "no_fillable_fields" | "missing_api_key";
  mode?: "flat_overlay" | "acroform";
  message?: string;
  fileName?: string;
  pdfBase64?: string;
  mimeType?: string;
  attemptedCount?: number;
  filledCount?: number;
  document?: {
    fieldCount: number;
  };
  appliedFields?: Array<{ fieldName: string; value: string; type: string }>;
  skippedFields?: Array<{ fieldName: string; reason: string }>;
  unfilledFields?: Array<{ fieldName: string; reason: string; followUpQuestion?: string }>;
  summary?: {
    extractedFacts?: string[];
    assumptions?: string[];
    warnings?: string[];
  };
  error?: string;
}

function base64ToBlobUrl(base64: string, mimeType = "application/pdf"): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return URL.createObjectURL(new Blob([bytes], { type: mimeType }));
}

function fileSizeLabel(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

function hasContext(notes: string, supportingFiles: File[], voiceNote: File | null): boolean {
  return Boolean(notes.trim() || supportingFiles.length > 0 || voiceNote);
}

function SourceChip({
  icon: Icon,
  label,
  onRemove,
  tone = "slate",
}: {
  icon: LucideIcon;
  label: string;
  onRemove: () => void;
  tone?: "emerald" | "amber" | "slate";
}) {
  const classes = {
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    <span className={cn("inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", classes[tone])}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="min-w-0 truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 opacity-70 transition hover:bg-white hover:opacity-100"
        aria-label={`Remove ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function ResultNotice({ result }: { result: AutofillResult }) {
  return (
    <div className="m-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{result.message || "This PDF could not be filled yet."}</p>
      </div>
    </div>
  );
}

function DetailSection({
  title,
  icon: Icon,
  items,
  empty,
  tone,
}: {
  title: string;
  icon: LucideIcon;
  items: Array<{ key: string; primary: string; secondary?: string }>;
  empty: string;
  tone: "emerald" | "amber" | "stone";
}) {
  const classes = {
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-100",
    amber: "text-amber-700 bg-amber-50 border-amber-100",
    stone: "text-slate-700 bg-slate-50 border-slate-200",
  };

  return (
    <section className="min-w-0">
      <div className={cn("mb-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold", classes[tone])}>
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      {items.length === 0 ? (
        <p className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs text-slate-500">{empty}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.key} className="rounded-xl border border-slate-100 bg-white px-3 py-2">
              <p className="break-words text-xs font-bold text-slate-900">{item.primary}</p>
              {item.secondary && <p className="mt-1 break-words text-xs leading-relaxed text-slate-500">{item.secondary}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyPdfGhost() {
  return (
    <div className="relative h-40 w-32 rounded-2xl border-2 border-slate-200/70 bg-white/60 shadow-sm">
      <div className="absolute right-0 top-0 h-10 w-10 rounded-bl-2xl border-b-2 border-l-2 border-slate-200/70 bg-slate-50" />
      <FileText className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-slate-200" />
      <div className="absolute bottom-7 left-6 right-6 h-1.5 rounded-full bg-slate-100" />
      <div className="absolute bottom-4 left-6 right-10 h-1.5 rounded-full bg-slate-100" />
    </div>
  );
}

export default function PdfAutofillDemo() {
  const [template, setTemplate] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [supportingFiles, setSupportingFiles] = useState<File[]>([]);
  const [voiceNote, setVoiceNote] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AutofillResult | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const appliedFields = result?.appliedFields || [];
  const unfilledFields = result?.unfilledFields || [];
  const warnings = result?.summary?.warnings || [];
  const filledCount = result?.filledCount || 0;
  const fieldCount = result?.document?.fieldCount || 0;

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [pdfUrl]);

  function clearOutput() {
    setResult(null);
    setDetailsOpen(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  }

  async function runAutofill(
    templateFile = template,
    notesValue = notes,
    supporting = supportingFiles,
    voice = voiceNote
  ) {
    if (!templateFile) {
      setError("Upload a PDF first.");
      return;
    }

    if (!hasContext(notesValue, supporting, voice)) {
      setError("Add notes, a transcript, an attachment, or a voice note.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    clearOutput();

    try {
      const formData = new FormData();
      formData.append("template", templateFile);
      formData.append("notes", notesValue);
      supporting.forEach((file) => formData.append("supportingFiles", file));
      if (voice) formData.append("voiceNote", voice);

      const response = await fetch("/api/insurance/pdf-autofill", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as AutofillResult;

      if (!response.ok) {
        throw new Error(data.error || "PDF autofill failed.");
      }

      setResult(data);
      setDetailsOpen(false);
      if (data.pdfBase64) {
        setPdfUrl(base64ToBlobUrl(data.pdfBase64, data.mimeType));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF autofill failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function ingestFiles(fileList: FileList | File[] | null | undefined) {
    const incoming = Array.from(fileList || []);
    if (incoming.length === 0) return;

    const pdfs = incoming.filter(isPdf);
    const nonPdfs = incoming.filter((file) => !isPdf(file));
    const audioFiles = nonPdfs.filter(isAudio);
    const sourceFiles = nonPdfs.filter((file) => !isAudio(file));
    const nextTemplate = pdfs[0] || template;
    const nextVoiceNote = audioFiles[0] || voiceNote;
    const nextSupportingFiles = [
      ...supportingFiles,
      ...sourceFiles,
      ...(pdfs.length > 1 ? pdfs.slice(1) : []),
    ];

    setTemplate(nextTemplate);
    setVoiceNote(nextVoiceNote);
    setSupportingFiles(nextSupportingFiles);
    setError(null);
    clearOutput();

    if (nextTemplate && hasContext(notes, nextSupportingFiles, nextVoiceNote)) {
      void runAutofill(nextTemplate, notes, nextSupportingFiles, nextVoiceNote);
    }
  }

  function handleFileDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragging(false);
    ingestFiles(event.dataTransfer.files);
  }

  async function startRecording() {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });

      chunksRef.current = [];
      streamRef.current = stream;
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const recordedFile = new File([blob], "voice-note.webm", { type: mimeType });
        setVoiceNote(recordedFile);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        if (template && hasContext(notes, supportingFiles, recordedFile)) {
          void runAutofill(template, notes, supportingFiles, recordedFile);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      setError("Microphone access was blocked or unavailable.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setIsRecording(false);
  }

  async function submit() {
    await runAutofill();
  }

  function reset() {
    setTemplate(null);
    setNotes("");
    setSupportingFiles([]);
    setVoiceNote(null);
    setIsDragging(false);
    setError(null);
    clearOutput();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5">
        <h1 className="text-3xl font-bold !tracking-normal !text-slate-950 sm:text-4xl">
          Fill <span className="gold-accent">Any</span> PDF
        </h1>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(320px,0.82fr)_minmax(0,1.18fr)]">
        <section
          className="value-card relative !rounded-2xl bg-white p-5 shadow-sm"
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setIsDragging(false);
            }
          }}
          onDrop={handleFileDrop}
        >
          <button
            type="button"
            onClick={reset}
            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Reset"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>

          <div className="space-y-4">
            {template ? (
              <div
                className={cn(
                  "flex items-center gap-2 rounded-2xl border px-3 py-2 transition",
                  isDragging ? "border-amber-300 bg-amber-50" : "border-emerald-100 bg-emerald-50"
                )}
              >
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                  <input
                    type="file"
                    multiple
                    className="sr-only"
                    onChange={(event) => ingestFiles(event.target.files)}
                  />
                  <FileText className="h-4 w-4 shrink-0 text-emerald-700" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-emerald-900">{template.name}</span>
                    <span className="block truncate text-xs font-semibold text-emerald-700">
                      {fileSizeLabel(template.size)} · drop more files here
                    </span>
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setTemplate(null);
                    clearOutput();
                  }}
                  className="rounded-full p-1 text-emerald-600 transition hover:bg-white hover:text-emerald-800"
                  aria-label="Remove PDF"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                className={cn(
                  "flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center transition",
                  isDragging
                    ? "border-amber-400 bg-amber-50"
                    : "border-slate-300 bg-[#fbf7ef] hover:border-amber-300 hover:bg-amber-50/70"
                )}
              >
                <input
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(event) => ingestFiles(event.target.files)}
                />
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm ring-1 ring-amber-100">
                  <Upload className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold text-slate-950">Drop PDF, notes, or files</p>
                <p className="mt-1 text-xs text-slate-500">PDF becomes the form; other files become context.</p>
              </label>
            )}

            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              onBlur={() => {
                if (template && hasContext(notes, supportingFiles, voiceNote) && !result && !isSubmitting) {
                  void runAutofill();
                }
              }}
              placeholder="Paste notes, transcripts, emails, or facts that should appear in the form."
              className="min-h-56 resize-y rounded-2xl border-slate-200 bg-[#fbf7ef] text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-amber-500"
            />

            <div className="flex items-center gap-2 border-t border-slate-100 pt-1">
              {isRecording ? (
                <Button type="button" size="icon" onClick={stopRecording} className="rounded-xl bg-red-600 text-white hover:bg-red-700" title="Stop recording">
                  <Square className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" size="icon" variant="outline" onClick={startRecording} className="rounded-xl border-slate-200 bg-white text-slate-700" title="Record voice note">
                  <Mic className="h-4 w-4" />
                </Button>
              )}

              <p className="text-xs font-medium text-slate-500">Drop or click the upload area for source files.</p>
            </div>

            {(voiceNote || supportingFiles.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {voiceNote && (
                  <SourceChip
                    icon={FileAudio}
                    label={`${voiceNote.name} · ${fileSizeLabel(voiceNote.size)}`}
                    tone="amber"
                    onRemove={() => setVoiceNote(null)}
                  />
                )}
                {supportingFiles.map((file) => (
                  <SourceChip
                    key={`${file.name}-${file.lastModified}`}
                    icon={FileText}
                    label={`${file.name} · ${fileSizeLabel(file.size)}`}
                    tone="slate"
                    onRemove={() => setSupportingFiles((files) => files.filter((item) => item !== file))}
                  />
                ))}
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="button"
              onClick={submit}
              disabled={isSubmitting}
              className="w-full rounded-xl bg-slate-950 py-6 text-base font-bold text-white shadow-md transition hover:bg-amber-600"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              Generate
            </Button>
          </div>
        </section>

        <section className="value-card flex min-h-[680px] flex-col overflow-hidden !rounded-2xl bg-white shadow-sm">
          <div className="flex min-h-14 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <h2 className="text-lg font-bold !tracking-normal !text-slate-950">Filled PDF</h2>

            {pdfUrl && result && (
              <div className="flex items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                  <Check className="h-4 w-4" />
                  {result.mode === "flat_overlay" ? `${filledCount} overlays` : `${filledCount} / ${fieldCount || "?"} filled`}
                </span>
                <span className="hidden text-slate-300 sm:inline">·</span>
                <a
                  href={pdfUrl}
                  download={result.fileName || "filled-form.pdf"}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
              </div>
            )}
          </div>

          {!result && (
            <div className="flex flex-1 items-center justify-center bg-[#fbf7ef]/70 p-10">
              {isSubmitting ? (
                <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
              ) : (
                <EmptyPdfGhost />
              )}
            </div>
          )}

          {result && !pdfUrl && <ResultNotice result={result} />}

          {pdfUrl && result && (
            <>
              {result.mode === "flat_overlay" && (
                <div className="flex items-start gap-2 border-b border-amber-100 bg-amber-50/80 px-4 py-2 text-xs font-semibold leading-relaxed text-amber-900">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>Flat PDF overlay mode. Review placement before sending.</span>
                </div>
              )}

              <iframe
                src={pdfUrl}
                title="Filled PDF preview"
                className="min-h-[560px] flex-1 border-0 bg-slate-100"
              />

              <div className="border-t border-slate-100 bg-white">
                <button
                  type="button"
                  onClick={() => setDetailsOpen((open) => !open)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-slate-900">Field details</span>
                    <span className="block truncate text-xs text-slate-500">
                      {appliedFields.length} {result.mode === "flat_overlay" ? "overlays" : "filled"} · {unfilledFields.length} unfilled · {warnings.length} warnings
                    </span>
                  </span>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition", detailsOpen && "rotate-180")} />
                </button>

                {detailsOpen && (
                  <div className="grid max-h-72 grid-cols-1 gap-3 overflow-y-auto border-t border-slate-100 bg-[#fbf7ef] p-4 md:grid-cols-3">
                    <DetailSection
                      title="Filled in"
                      icon={CheckCircle2}
                      tone="emerald"
                      empty="No fields were filled."
                      items={appliedFields.slice(0, 14).map((field) => ({
                        key: `${field.fieldName}-${field.value}`,
                        primary: field.fieldName,
                        secondary: field.value,
                      }))}
                    />
                    <DetailSection
                      title="Needs input"
                      icon={FileText}
                      tone="stone"
                      empty="No missing fields were reported."
                      items={unfilledFields.slice(0, 14).map((field) => ({
                        key: field.fieldName,
                        primary: field.fieldName,
                        secondary: field.followUpQuestion || field.reason,
                      }))}
                    />
                    <DetailSection
                      title="Warnings"
                      icon={AlertTriangle}
                      tone="amber"
                      empty="No warnings."
                      items={warnings.slice(0, 10).map((warning) => ({
                        key: warning,
                        primary: warning,
                      }))}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
