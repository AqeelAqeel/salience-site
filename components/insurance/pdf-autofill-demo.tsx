"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ClipboardList,
  Download,
  FileAudio,
  FileCheck2,
  FileText,
  Layers,
  Loader2,
  Lock,
  Mic,
  Paperclip,
  RefreshCcw,
  Shield,
  Sparkles,
  Square,
  Upload,
  WandSparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AutofillResult {
  status: "filled" | "no_fillable_fields" | "missing_api_key";
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

type StepState = "done" | "active" | "waiting";

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

function sourceMaterialCount(notes: string, supportingFiles: File[], voiceNote: File | null): number {
  return (notes.trim() ? 1 : 0) + supportingFiles.length + (voiceNote ? 1 : 0);
}

function BrokerPill({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

function PacketIcon({
  icon: Icon,
  tone,
}: {
  icon: LucideIcon;
  tone: "amber" | "emerald" | "sky" | "violet" | "stone";
}) {
  const classes = {
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    sky: "bg-sky-50 text-sky-700 ring-sky-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
    stone: "bg-stone-100 text-stone-700 ring-stone-200",
  };

  return (
    <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1", classes[tone])}>
      <Icon className="h-6 w-6" />
    </span>
  );
}

function WorkflowStep({
  icon: Icon,
  title,
  detail,
  state,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
  state: StepState;
}) {
  return (
    <div className="relative flex gap-3 px-4 py-3">
      <div className="relative z-10">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold ring-4 ring-white",
            state === "done" && "border-emerald-500 bg-emerald-500 text-white",
            state === "active" && "border-stone-900 bg-stone-900 text-white",
            state === "waiting" && "border-stone-200 bg-white text-stone-400"
          )}
        >
          {state === "done" ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
        </div>
      </div>
      <div className="min-w-0 pt-0.5">
        <p
          className={cn(
            "text-sm font-bold",
            state === "waiting" ? "text-stone-500" : "text-stone-950"
          )}
        >
          {title}
        </p>
        <p className="mt-0.5 text-xs leading-snug text-stone-500">{detail}</p>
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "emerald" | "amber" | "sky" | "stone";
}) {
  const classes = {
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    sky: "border-sky-100 bg-sky-50 text-sky-700",
    stone: "border-stone-200 bg-stone-50 text-stone-700",
  };

  return (
    <div className={cn("rounded-xl border px-3 py-2.5", classes[tone])}>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-normal opacity-80">{label}</p>
    </div>
  );
}

function FileSummary({
  file,
  fallback,
  onRemove,
}: {
  file: File | null;
  fallback: string;
  onRemove?: () => void;
}) {
  return (
    <div className="mt-2 flex items-center justify-between gap-2 text-sm text-stone-500">
      <span className="min-w-0 truncate">
        {file ? `${file.name} · ${fileSizeLabel(file.size)}` : fallback}
      </span>
      {file && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md p-1 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600"
          aria-label="Remove file"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function ResultNotice({ result }: { result: AutofillResult }) {
  const warning = result.status === "missing_api_key" || result.status === "no_fillable_fields";

  return (
    <div
      className={cn(
        "m-4 rounded-2xl border p-4 text-sm",
        warning ? "border-amber-200 bg-amber-50 text-amber-900" : "border-stone-200 bg-stone-50 text-stone-700"
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{result.message || "The form could not be filled yet."}</p>
      </div>
    </div>
  );
}

function FieldAuditList({
  title,
  icon: Icon,
  items,
  tone,
  empty,
}: {
  title: string;
  icon: LucideIcon;
  items: Array<{ key: string; primary: string; secondary?: string }>;
  tone: "emerald" | "amber" | "stone";
  empty: string;
}) {
  const classes = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    stone: "bg-stone-50 text-stone-700 border-stone-200",
  };

  return (
    <section className="rounded-2xl border border-stone-200 bg-white">
      <div className={cn("flex items-center gap-2 rounded-t-2xl border-b px-3 py-2.5", classes[tone])}>
        <Icon className="h-4 w-4" />
        <h3 className="text-sm font-bold !tracking-normal !text-current">{title}</h3>
      </div>
      <div className="max-h-56 overflow-y-auto p-2">
        {items.length === 0 ? (
          <p className="px-2 py-3 text-xs text-stone-500">{empty}</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.key} className="rounded-xl border border-stone-100 bg-stone-50 px-3 py-2">
                <p className="break-words text-xs font-bold text-stone-900">{item.primary}</p>
                {item.secondary && <p className="mt-1 break-words text-xs text-stone-500">{item.secondary}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function PdfAutofillDemo() {
  const [template, setTemplate] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [supportingFiles, setSupportingFiles] = useState<File[]>([]);
  const [voiceNote, setVoiceNote] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AutofillResult | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const sourceCount = sourceMaterialCount(notes, supportingFiles, voiceNote);
  const hasSourceMaterial = sourceCount > 0;
  const filledCount = result?.filledCount || 0;
  const attemptedCount = result?.attemptedCount || 0;
  const fieldCount = result?.document?.fieldCount || 0;
  const fillRate = fieldCount > 0 ? Math.round((filledCount / fieldCount) * 100) : 0;

  const workflow: Array<{ icon: LucideIcon; title: string; detail: string; state: StepState }> = [
    {
      icon: FileText,
      title: "Register PDF fields",
      detail: template ? `${template.name} is ready for inspection.` : "Upload the blank fillable form.",
      state: template ? "done" : "active",
    },
    {
      icon: ClipboardList,
      title: "Load case context",
      detail: hasSourceMaterial ? `${sourceCount} source item${sourceCount === 1 ? "" : "s"} attached.` : "Paste notes or add source files.",
      state: hasSourceMaterial ? "done" : template ? "active" : "waiting",
    },
    {
      icon: WandSparkles,
      title: "Map evidence to fields",
      detail: isSubmitting ? "Matching facts against exact PDF field names." : result ? "AI field matching has completed." : "Only supported, evidenced fields are filled.",
      state: result ? "done" : isSubmitting ? "active" : template && hasSourceMaterial ? "active" : "waiting",
    },
    {
      icon: FileCheck2,
      title: "Broker review",
      detail: result ? `${filledCount} fields filled, ${result.unfilledFields?.length || 0} gaps flagged.` : "Download the editable PDF and inspect gaps.",
      state: result ? "active" : "waiting",
    },
  ];

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [pdfUrl]);

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
        setVoiceNote(new File([blob], "voice-note.webm", { type: mimeType }));
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
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
    if (!template) {
      setError("Upload a PDF first.");
      return;
    }

    if (!notes.trim() && supportingFiles.length === 0 && !voiceNote) {
      setError("Add notes, a transcript, a text attachment, or a voice note.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setResult(null);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }

    try {
      const formData = new FormData();
      formData.append("template", template);
      formData.append("notes", notes);
      supportingFiles.forEach((file) => formData.append("supportingFiles", file));
      if (voiceNote) formData.append("voiceNote", voiceNote);

      const response = await fetch("/api/insurance/pdf-autofill", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as AutofillResult;

      if (!response.ok) {
        throw new Error(data.error || "PDF autofill failed.");
      }

      setResult(data);
      if (data.pdfBase64) {
        setPdfUrl(base64ToBlobUrl(data.pdfBase64, data.mimeType));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF autofill failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function reset() {
    setTemplate(null);
    setNotes("");
    setSupportingFiles([]);
    setVoiceNote(null);
    setResult(null);
    setError(null);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <section className="mb-5 overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white/90 shadow-xl shadow-stone-200/70">
        <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-950 text-white shadow-md">
              <Shield className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-500">StarOne Valley Insurance</p>
              <h1 className="mt-1 text-3xl font-bold leading-tight !tracking-normal !text-stone-950 sm:text-4xl">
                Broker PDF Autofill
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
                Upload a blank carrier, agency, or compliance form. Drop in the messy source material and get back an editable PDF plus the gaps a broker still needs to resolve.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <BrokerPill icon={Lock}>Encrypted session</BrokerPill>
            <BrokerPill icon={BadgeCheck}>Editable PDF</BrokerPill>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
        <section className="space-y-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold !tracking-normal !text-stone-950">Case packet</h2>
                <p className="mt-0.5 text-sm text-stone-500">Everything the agent needs for this one form.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={reset}
                className="rounded-xl border-stone-200 bg-white text-stone-700 hover:bg-stone-100"
              >
                <RefreshCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          <label
            className={cn(
              "block cursor-pointer rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md",
              template ? "border-emerald-200 ring-2 ring-emerald-50" : "border-stone-200 hover:border-amber-300"
            )}
          >
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={(event) => setTemplate(event.target.files?.[0] || null)}
            />
            <span className="flex items-start gap-4">
              <PacketIcon icon={Upload} tone={template ? "emerald" : "amber"} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-3">
                  <span className="text-base font-bold text-stone-950">Empty PDF</span>
                  {template ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <ArrowRight className="h-5 w-5 text-stone-300" />
                  )}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-stone-500">
                  {template ? `${template.name} · ${fileSizeLabel(template.size)}` : "Choose the fillable PDF someone else already uses for work."}
                </span>
              </span>
            </span>
          </label>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-start gap-4">
              <PacketIcon icon={FileText} tone={notes.trim() ? "emerald" : "sky"} />
              <div className="min-w-0">
                <label htmlFor="broker-notes" className="text-base font-bold text-stone-950">
                  Notes or transcript
                </label>
                <p className="mt-1 text-sm leading-relaxed text-stone-500">
                  Paste call notes, email text, client facts, or a raw transcript.
                </p>
              </div>
            </div>
            <Textarea
              id="broker-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Example: Acme Cleaning LLC is a janitorial business at 123 Market Street in San Francisco. Contact is Dana Ruiz..."
              className="min-h-44 resize-y rounded-xl border-stone-200 bg-stone-50 text-stone-900 placeholder:text-stone-400 focus-visible:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="cursor-pointer rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-all hover:border-violet-300 hover:shadow-md">
              <input
                type="file"
                multiple
                accept=".txt,.md,.csv,.json,.eml,.rtf,text/*,application/json"
                className="sr-only"
                onChange={(event) => setSupportingFiles(Array.from(event.target.files || []))}
              />
              <span className="flex items-start gap-3">
                <PacketIcon icon={Paperclip} tone={supportingFiles.length > 0 ? "emerald" : "violet"} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-stone-950">Text files</span>
                  <span className="mt-1 block truncate text-sm text-stone-500">
                    {supportingFiles.length > 0 ? `${supportingFiles.length} selected` : "Optional attachments"}
                  </span>
                </span>
              </span>
            </label>

            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <PacketIcon icon={FileAudio} tone={voiceNote ? "emerald" : "sky"} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-stone-950">Voice note</span>
                    {isRecording ? (
                      <Button type="button" size="sm" onClick={stopRecording} className="rounded-xl bg-red-600 hover:bg-red-700">
                        <Square className="h-4 w-4" />
                        Stop
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <label className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white px-2.5 text-xs font-bold text-stone-700 shadow-xs transition-colors hover:bg-stone-100">
                          <input
                            type="file"
                            accept="audio/*,.webm,.m4a,.mp3,.mp4,.mpeg,.mpga,.wav,.ogg"
                            className="sr-only"
                            onChange={(event) => setVoiceNote(event.target.files?.[0] || null)}
                          />
                          <Upload className="h-3.5 w-3.5" />
                          Audio
                        </label>
                        <Button type="button" size="sm" variant="outline" onClick={startRecording} className="rounded-xl border-stone-200">
                          <Mic className="h-4 w-4" />
                          Record
                        </Button>
                      </div>
                    )}
                  </div>
                  <FileSummary file={voiceNote} fallback="Optional" onRemove={() => setVoiceNote(null)} />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
            <Button
              type="button"
              onClick={submit}
              disabled={isSubmitting}
              className="w-full rounded-xl bg-stone-950 py-6 text-base font-bold text-white shadow-md transition-all hover:bg-amber-600"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              Generate filled PDF
            </Button>
          </div>
        </section>

        <section className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-xl shadow-stone-200/70 xl:sticky xl:top-28 xl:self-start">
          <div className="border-b border-stone-200 bg-stone-950 px-5 py-4 text-white">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-stone-300">Review workspace</p>
                <h2 className="mt-1 text-xl font-bold !tracking-normal !text-white">Filled form and gaps</h2>
              </div>
              {pdfUrl && (
                <Button asChild type="button" variant="secondary" className="rounded-xl bg-white text-stone-950 hover:bg-stone-100">
                  <a href={pdfUrl} download={result?.fileName || "filled-form.pdf"}>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-b border-stone-200 bg-white p-4 sm:grid-cols-4">
            <MetricTile label="Fields" value={fieldCount || "—"} tone="stone" />
            <MetricTile label="Filled" value={filledCount || "—"} tone="emerald" />
            <MetricTile label="Matched" value={attemptedCount || "—"} tone="sky" />
            <MetricTile label="Rate" value={fieldCount ? `${fillRate}%` : "—"} tone="amber" />
          </div>

          {!result && (
            <div className="grid gap-4 p-4 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-stone-600" />
                  <h3 className="text-sm font-bold !tracking-normal !text-stone-900">Workflow</h3>
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white">
                  <div className="absolute left-[2.125rem] top-6 bottom-6 w-px bg-stone-200" aria-hidden="true" />
                  {workflow.map((step) => (
                    <WorkflowStep key={step.title} {...step} />
                  ))}
                </div>
              </div>

              <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
                <div>
                  {isSubmitting ? (
                    <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-amber-600" />
                  ) : (
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-stone-300 shadow-sm">
                      <FileText className="h-8 w-8" />
                    </div>
                  )}
                  <p className="text-sm font-bold text-stone-800">
                    {isSubmitting ? "Building the filled PDF..." : "Waiting for a case packet"}
                  </p>
                  <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-stone-500">
                    {isSubmitting
                      ? "The agent is inspecting fields, extracting evidence, and leaving risky fields blank."
                      : "Upload a fillable PDF, add source material, then generate the editable output."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {result && !pdfUrl && <ResultNotice result={result} />}

          {pdfUrl && result && (
            <div>
              <iframe
                src={pdfUrl}
                title="Filled PDF preview"
                className="h-[52vh] min-h-[420px] w-full border-b border-stone-200 bg-stone-100"
              />

              <div className="grid grid-cols-1 gap-3 bg-stone-50 p-4 lg:grid-cols-2">
                {result.summary?.warnings && result.summary.warnings.length > 0 && (
                  <FieldAuditList
                    title="Warnings"
                    icon={AlertTriangle}
                    tone="amber"
                    empty="No warnings."
                    items={result.summary.warnings.slice(0, 6).map((warning) => ({
                      key: warning,
                      primary: warning,
                    }))}
                  />
                )}

                <FieldAuditList
                  title="Applied fields"
                  icon={CheckCircle2}
                  tone="emerald"
                  empty="No fields were applied."
                  items={(result.appliedFields || []).slice(0, 12).map((field) => ({
                    key: `${field.fieldName}-${field.value}`,
                    primary: field.fieldName,
                    secondary: field.value,
                  }))}
                />

                <FieldAuditList
                  title="Remaining gaps"
                  icon={AlertTriangle}
                  tone="stone"
                  empty="No remaining gaps were reported."
                  items={(result.unfilledFields || []).slice(0, 12).map((field) => ({
                    key: field.fieldName,
                    primary: field.fieldName,
                    secondary: field.followUpQuestion || field.reason,
                  }))}
                />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
