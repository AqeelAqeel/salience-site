"use client";

import { useState } from "react";
import { FileText, Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntakeSession } from "@/hooks/use-intake-session";
import { ProspectIntakeOrb } from "./prospect-intake-orb";
import { IntakeSummary } from "./intake-summary";

export function IntakeConversation() {
  const {
    phase,
    turns,
    currentTranscript,
    currentResponse,
    summary,
    isGeneratingSummary,
    analyzerData,
    recorderError,
    startInterview,
    stopInterview,
    generateSummary,
    prospect,
    sessionId,
  } = useIntakeSession();

  const [showSummary, setShowSummary] = useState(true);

  const canShowSummaryButton =
    phase === "idle" && turns.length >= 2 && !summary && !isGeneratingSummary;

  // Determine display text
  let displayText = "";
  let displaySubtext = "";

  if (phase === "idle" && turns.length === 0) {
    displayText = "Ready when you are.";
    displaySubtext = "Start a conversation to explore how AI can work for your business.";
  } else if (phase === "listening") {
    displayText = currentTranscript || "";
    displaySubtext = currentTranscript ? "" : "Listening...";
  } else if (phase === "thinking") {
    displayText = "";
    displaySubtext = "";
  } else if (phase === "speaking") {
    displayText = currentResponse;
  } else if (phase === "idle" && turns.length > 0) {
    displayText = "Interview complete.";
    displaySubtext = "You can generate a summary of what we discussed.";
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100dvh-5rem)] px-6 overflow-hidden">
      {/* Full-screen orb — centered, large */}
      <div className="relative w-[300px] h-[300px] md:w-[420px] md:h-[420px] lg:w-[500px] lg:h-[500px] shrink-0">
        <ProspectIntakeOrb
          phase={phase}
          analyzerData={analyzerData}
          className="absolute inset-0"
        />

        {/* Thinking indicator — centered in orb */}
        {phase === "thinking" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full bg-purple-400/70 animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-purple-400/70 animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-purple-400/70 animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main text — LARGE, prominent */}
      <div className="w-full max-w-2xl mx-auto text-center mt-8 min-h-[120px] px-4">
        {displayText && (
          <p
            className={cn(
              "text-xl md:text-2xl lg:text-3xl leading-relaxed font-light tracking-wide",
              phase === "speaking"
                ? "text-white/90"
                : phase === "listening"
                  ? "text-white/70"
                  : "text-white/60"
            )}
          >
            {displayText}
            {(phase === "listening" && currentTranscript) || phase === "speaking" ? (
              <span className="inline-block w-0.5 h-6 md:h-7 bg-amber-500/70 ml-1.5 animate-pulse align-text-bottom" />
            ) : null}
          </p>
        )}

        {displaySubtext && (
          <p className="text-base md:text-lg text-white/30 mt-3">
            {displaySubtext}
          </p>
        )}

        {/* Listening indicator — subtle dot */}
        {phase === "listening" && !currentTranscript && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500/40" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500/70" />
            </span>
          </div>
        )}
      </div>

      {/* Error */}
      {recorderError && (
        <div className="mt-6 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm max-w-md text-center">
          {recorderError}
        </div>
      )}

      {/* Controls — minimal, at the bottom */}
      <div className="mt-10 flex flex-col items-center gap-4">
        {phase === "idle" && turns.length === 0 && (
          <button
            onClick={startInterview}
            className={cn(
              "group px-10 py-5 rounded-full",
              "bg-gradient-to-r from-amber-500 to-amber-600",
              "text-black font-semibold text-lg",
              "hover:from-amber-400 hover:to-amber-500",
              "active:scale-[0.97] transition-all duration-200",
              "shadow-lg shadow-amber-500/25",
              "flex items-center gap-3"
            )}
          >
            <Mic className="w-5 h-5" />
            Begin
          </button>
        )}

        {phase !== "idle" && (
          <button
            onClick={stopInterview}
            className={cn(
              "px-6 py-3 rounded-full",
              "bg-white/[0.06] border border-white/[0.1]",
              "text-white/50 text-sm",
              "hover:bg-white/[0.1] hover:text-white/70 hover:border-white/[0.15]",
              "active:scale-[0.97] transition-all duration-200",
              "flex items-center gap-2"
            )}
          >
            <Square className="w-3.5 h-3.5" />
            End
          </button>
        )}

        {canShowSummaryButton && (
          <button
            onClick={generateSummary}
            className={cn(
              "px-8 py-4 rounded-full",
              "bg-gradient-to-r from-amber-500 to-amber-600",
              "text-black font-semibold text-base",
              "hover:from-amber-400 hover:to-amber-500",
              "active:scale-[0.97] transition-all duration-200",
              "shadow-lg shadow-amber-500/25",
              "flex items-center gap-2"
            )}
          >
            <FileText className="w-5 h-5" />
            Generate Summary
          </button>
        )}

        {isGeneratingSummary && (
          <div className="flex items-center gap-3 text-base text-white/40">
            <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            Generating your summary...
          </div>
        )}
      </div>

      {/* Summary */}
      {summary && showSummary && (
        <div className="mt-10 w-full max-w-lg">
          <IntakeSummary
            summary={summary}
            prospectId={prospect?.id}
            sessionId={sessionId}
            onClose={() => setShowSummary(false)}
          />
        </div>
      )}
    </div>
  );
}
