"use client";

import { Mic, MicOff, Square, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IntakePhase } from "@/lib/types/prospects";

interface VoiceControlsProps {
  phase: IntakePhase;
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  error: string | null;
  className?: string;
}

export function VoiceControls({
  phase,
  isRecording,
  onStart,
  onStop,
  error,
  className,
}: VoiceControlsProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {error && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm max-w-sm text-center">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {phase === "idle" ? (
        <button
          onClick={onStart}
          className={cn(
            "group relative px-8 py-4 rounded-2xl",
            "bg-gradient-to-r from-amber-500 to-amber-600",
            "text-black font-semibold text-base",
            "hover:from-amber-400 hover:to-amber-500",
            "active:scale-[0.97] transition-all duration-200",
            "shadow-lg shadow-amber-500/20",
            "flex items-center gap-3"
          )}
        >
          <Mic className="w-5 h-5" />
          Start Interview
        </button>
      ) : (
        <div className="flex items-center gap-4">
          {/* Recording indicator */}
          {isRecording && (
            <div className="flex items-center gap-2 text-sm text-white/50">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500/60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
              {phase === "listening"
                ? "Listening"
                : phase === "thinking"
                  ? "Processing"
                  : "Speaking"}
            </div>
          )}

          {/* Muted indicator when not recording */}
          {!isRecording && (
            <div className="flex items-center gap-2 text-sm text-white/30">
              <MicOff className="w-3.5 h-3.5" />
              Mic paused
            </div>
          )}

          {/* End interview button */}
          <button
            onClick={onStop}
            className={cn(
              "px-5 py-2.5 rounded-xl",
              "bg-white/[0.06] border border-white/[0.1]",
              "text-white/60 text-sm",
              "hover:bg-white/[0.1] hover:text-white/80 hover:border-white/[0.15]",
              "active:scale-[0.97] transition-all duration-200",
              "flex items-center gap-2"
            )}
          >
            <Square className="w-3.5 h-3.5" />
            End Interview
          </button>
        </div>
      )}
    </div>
  );
}
