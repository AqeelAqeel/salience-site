"use client";

import { cn } from "@/lib/utils";
import type { IntakePhase } from "@/lib/types/prospects";

interface TranscriptionOverlayProps {
  phase: IntakePhase;
  currentTranscript: string;
  currentResponse: string;
  className?: string;
}

export function TranscriptionOverlay({
  phase,
  currentTranscript,
  currentResponse,
  className,
}: TranscriptionOverlayProps) {
  return (
    <div
      className={cn(
        "w-full max-w-lg mx-auto text-center px-6 min-h-[80px]",
        "transition-opacity duration-500",
        className
      )}
    >
      {phase === "idle" && (
        <div className="space-y-2 animate-in fade-in duration-700">
          <p className="text-white/60 text-base leading-relaxed">
            Start a live interview to discover how AI can transform your
            business operations.
          </p>
          <p className="text-white/30 text-sm">
            We&apos;ll ask about your workflows, pain points, and goals.
          </p>
        </div>
      )}

      {phase === "listening" && (
        <div className="animate-in fade-in duration-300">
          {currentTranscript ? (
            <p className="text-white/80 text-base leading-relaxed">
              {currentTranscript}
              <span className="inline-block w-0.5 h-4 bg-amber-500/80 ml-1 animate-pulse align-text-bottom" />
            </p>
          ) : (
            <p className="text-white/40 text-sm flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500/60 animate-pulse" />
              Listening...
            </p>
          )}
        </div>
      )}

      {phase === "thinking" && (
        <div className="animate-in fade-in duration-300">
          <div className="flex items-center justify-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-purple-400/70 animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-purple-400/70 animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-purple-400/70 animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      )}

      {phase === "speaking" && (
        <div className="animate-in fade-in duration-300">
          <p className="text-white/90 text-base leading-relaxed">
            {currentResponse}
            <span className="inline-block w-0.5 h-4 bg-amber-400/60 ml-1 animate-pulse align-text-bottom" />
          </p>
        </div>
      )}
    </div>
  );
}
