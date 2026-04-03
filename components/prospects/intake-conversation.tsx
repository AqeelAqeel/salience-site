"use client";

import { useState } from "react";
import { FileText, ChevronLeft, ChevronRight, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntakeSession } from "@/hooks/use-intake-session";
import { ProspectIntakeOrb } from "./prospect-intake-orb";
import { TranscriptionOverlay } from "./transcription-overlay";
import { VoiceControls } from "./voice-controls";
import { IntakeSummary } from "./intake-summary";
import { ProspectContextPanel } from "./prospect-context-panel";
import type { Prospect } from "@/lib/types/prospects";

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
    isRecording,
    prospect,
    sessionId,
    setProspectContext,
    startInterview,
    stopInterview,
    generateSummary,
  } = useIntakeSession();

  const [showSummary, setShowSummary] = useState(true);
  const [showContextPanel, setShowContextPanel] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const canShowSummaryButton =
    phase === "idle" && turns.length >= 2 && !summary && !isGeneratingSummary;

  return (
    <div className="flex h-[calc(100dvh-5rem)]">
      {/* Left: Context Panel */}
      <div
        className={cn(
          "transition-all duration-300 shrink-0 overflow-hidden border-r border-white/[0.06]",
          showContextPanel ? "w-80" : "w-0"
        )}
      >
        {showContextPanel && (
          <div className="w-80 h-full overflow-y-auto p-4">
            <ProspectContextPanel
              prospect={prospect}
              onProspectCreated={(p: Prospect) => setProspectContext(p)}
              onProspectUpdated={(p: Prospect) => setProspectContext(p)}
            />
          </div>
        )}
      </div>

      {/* Toggle context panel */}
      <button
        onClick={() => setShowContextPanel(!showContextPanel)}
        className={cn(
          "shrink-0 w-6 flex items-center justify-center",
          "bg-[#0f0f0f] border-r border-white/[0.06]",
          "text-white/30 hover:text-white/60 transition-colors"
        )}
      >
        {showContextPanel ? (
          <ChevronLeft className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
      </button>

      {/* Center: Orb + Controls */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 min-w-0">
        {/* Orb */}
        <div className="relative w-[280px] h-[280px] md:w-[360px] md:h-[360px] mb-6 shrink-0">
          <ProspectIntakeOrb
            phase={phase}
            analyzerData={analyzerData}
            className="absolute inset-0"
          />
        </div>

        {/* Transcription overlay */}
        <TranscriptionOverlay
          phase={phase}
          currentTranscript={currentTranscript}
          currentResponse={currentResponse}
          className="mb-6"
        />

        {/* Voice controls */}
        <VoiceControls
          phase={phase}
          isRecording={isRecording}
          onStart={startInterview}
          onStop={stopInterview}
          error={recorderError}
          className="mb-4"
        />

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          {canShowSummaryButton && (
            <button
              onClick={generateSummary}
              className={cn(
                "px-4 py-2 rounded-xl",
                "bg-white/[0.06] border border-white/[0.1]",
                "text-white/60 text-sm",
                "hover:bg-white/[0.1] hover:text-white/80 hover:border-amber-500/30",
                "active:scale-[0.97] transition-all duration-200",
                "flex items-center gap-2"
              )}
            >
              <FileText className="w-4 h-4" />
              Generate Summary
            </button>
          )}

          {isGeneratingSummary && (
            <div className="flex items-center gap-2 text-sm text-white/40">
              <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              Generating summary...
            </div>
          )}

          {turns.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm transition-all duration-200 flex items-center gap-2",
                showHistory
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                  : "bg-white/[0.06] border border-white/[0.1] text-white/60 hover:text-white/80"
              )}
            >
              <Bot className="w-4 h-4" />
              History ({turns.length})
            </button>
          )}
        </div>

        {/* Summary */}
        {summary && showSummary && (
          <IntakeSummary
            summary={summary}
            prospectId={prospect?.id}
            sessionId={sessionId}
            onClose={() => setShowSummary(false)}
            className="mt-6 max-w-lg"
          />
        )}
      </div>

      {/* Right: Chat History Panel */}
      <div
        className={cn(
          "transition-all duration-300 shrink-0 overflow-hidden border-l border-white/[0.06]",
          showHistory ? "w-96" : "w-0"
        )}
      >
        {showHistory && (
          <div className="w-96 h-full flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between shrink-0">
              <h3 className="text-sm font-semibold text-white/80">
                Conversation
              </h3>
              <span className="text-xs text-white/30">
                {turns.length} messages
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {turns.map((turn) => (
                <div
                  key={turn.id}
                  className={cn(
                    "flex gap-3",
                    turn.role === "user"
                      ? "flex-row-reverse"
                      : ""
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                      turn.role === "user"
                        ? "bg-white/[0.08] text-white/50"
                        : "bg-amber-500/10 border border-amber-500/20 text-amber-500"
                    )}
                  >
                    {turn.role === "user"
                      ? (prospect?.full_name?.[0]?.toUpperCase() || "P")
                      : "S"}
                  </div>

                  {/* Bubble */}
                  <div
                    className={cn(
                      "max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed",
                      turn.role === "user"
                        ? "bg-amber-500/10 text-white/70 rounded-br-md"
                        : "bg-white/[0.04] text-white/60 rounded-bl-md"
                    )}
                  >
                    {/* Name label */}
                    <div
                      className={cn(
                        "text-[10px] font-medium mb-1 uppercase tracking-wider",
                        turn.role === "user"
                          ? "text-amber-500/50"
                          : "text-white/30"
                      )}
                    >
                      {turn.role === "user"
                        ? (prospect?.full_name || "Prospect")
                        : "Salience"}
                    </div>
                    <div className="whitespace-pre-wrap">{turn.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
