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
        <h4 className="text-sm font-medium text-white/70">{title}</h4>
      </div>
      <ul className="space-y-1.5 pl-6">
        {items.map((item, i) => (
          <li
            key={i}
            className="text-sm text-white/60 leading-relaxed list-disc"
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
        "bg-[#141414] border border-white/[0.08] rounded-2xl",
        "p-6 space-y-5",
        "animate-in fade-in slide-in-from-bottom-4 duration-500",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white/90">
          Interview Summary
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={copyToClipboard}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              "hover:bg-white/[0.06] text-white/40 hover:text-white/70"
            )}
            title="Copy summary"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
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
                "hover:bg-white/[0.06] text-white/40 hover:text-white/70",
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
                "hover:bg-amber-500/10 text-amber-400"
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
              "hover:bg-white/[0.06] text-white/40 hover:text-white/70"
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {shareUrl && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-xs text-amber-300/80 truncate">
            Shareable doc ready
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + shareUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="ml-auto text-xs text-amber-400 hover:text-amber-300 shrink-0"
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      )}

      {/* Business Context */}
      {summary.businessContext && (
        <div className="text-sm text-white/60 leading-relaxed border-l-2 border-amber-500/30 pl-3">
          {summary.businessContext}
        </div>
      )}

      {/* Sections */}
      <SummarySection
        icon={Sparkles}
        title="What They Want AI For"
        items={summary.wantsAiFor}
        accentColor="text-amber-400"
      />
      <SummarySection
        icon={Cog}
        title="Manual Processes Identified"
        items={summary.manualProcesses}
        accentColor="text-blue-400"
      />
      <SummarySection
        icon={Users}
        title="VA-Worthy Tasks"
        items={summary.vaWorthyTasks}
        accentColor="text-green-400"
      />
      <SummarySection
        icon={Lightbulb}
        title="Key Insights"
        items={summary.keyInsights}
        accentColor="text-purple-400"
      />
    </div>
  );
}
