"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  X,
  Sparkles,
  Cog,
  Users,
  Lightbulb,
  Share2,
  Download,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProspectSummary } from "@/lib/types/prospects";

interface IntakeSummaryProps {
  summary: ProspectSummary;
  prospectId?: string | null;
  sessionId?: string | null;
  onClose: () => void;
  className?: string;
}

function SummarySection({
  icon: Icon,
  title,
  items,
  accentColor,
}: {
  icon: typeof Sparkles;
  title: string;
  items: string[];
  accentColor: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={cn("w-4 h-4", accentColor)} />
        <h4 className="text-sm font-medium text-slate-600">{title}</h4>
      </div>
      <ul className="space-y-1.5 pl-6">
        {items.map((item, i) => (
          <li
            key={i}
            className="text-sm text-slate-500 leading-relaxed list-disc"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function IntakeSummary({
  summary,
  prospectId,
  sessionId,
  onClose,
  className,
}: IntakeSummaryProps) {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const copyToClipboard = () => {
    const text = [
      "== Prospect Intake Summary ==",
      "",
      "Business Context:",
      summary.businessContext,
      "",
      "AI Goals:",
      ...summary.wantsAiFor.map((s) => `- ${s}`),
      "",
      "Manual Processes:",
      ...summary.manualProcesses.map((s) => `- ${s}`),
      "",
      "VA-Worthy Tasks:",
      ...summary.vaWorthyTasks.map((s) => `- ${s}`),
      "",
      "Key Insights:",
      ...summary.keyInsights.map((s) => `- ${s}`),
    ].join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const generateShareableDoc = async () => {
    if (!prospectId || !sessionId) return;
    setGenerating(true);

    try {
      const res = await fetch("/api/prospects/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId, sessionId, docType: "summary" }),
      });
      const data = await res.json();
      if (data.shareUrl) {
        setShareUrl(data.shareUrl);
      }
    } catch (err) {
      console.error("Generate doc error:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div
      className={cn(
        "w-full max-w-lg mx-auto",
        "bg-white border border-slate-200 rounded-2xl shadow-sm",
        "p-6 space-y-5",
        "animate-in fade-in slide-in-from-bottom-4 duration-500",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">
          Interview Summary
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={copyToClipboard}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            )}
            title="Copy summary"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          {prospectId && sessionId && !shareUrl && (
            <button
              onClick={generateShareableDoc}
              disabled={generating}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "hover:bg-slate-100 text-slate-400 hover:text-slate-600",
                "disabled:opacity-40"
              )}
              title="Generate shareable document"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
          )}

          {shareUrl && (
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "hover:bg-blue-50 text-blue-600"
              )}
              title="View shareable document"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {shareUrl && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
          <Download className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="text-xs text-blue-700 truncate">
            Shareable doc ready
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + shareUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="ml-auto text-xs text-blue-600 hover:text-blue-800 shrink-0"
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      )}

      {summary.businessContext && (
        <div className="text-sm text-slate-500 leading-relaxed border-l-2 border-blue-300 pl-3">
          {summary.businessContext}
        </div>
      )}

      <SummarySection icon={Sparkles} title="What They Want AI For" items={summary.wantsAiFor} accentColor="text-amber-500" />
      <SummarySection icon={Cog} title="Manual Processes Identified" items={summary.manualProcesses} accentColor="text-blue-500" />
      <SummarySection icon={Users} title="VA-Worthy Tasks" items={summary.vaWorthyTasks} accentColor="text-green-500" />
      <SummarySection icon={Lightbulb} title="Key Insights" items={summary.keyInsights} accentColor="text-purple-500" />
    </div>
  );
}
