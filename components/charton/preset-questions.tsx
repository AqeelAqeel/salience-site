"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRESET_QUESTIONS } from "@/lib/types/charton";

interface PresetQuestionsProps {
  onSelect: (question: string) => void;
  visible: boolean;
}

export function PresetQuestions({ onSelect, visible }: PresetQuestionsProps) {
  if (!visible) return null;

  return (
    <div className="px-4 pb-2 shrink-0">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-500/60" />
        <span className="text-xs text-white/30 font-medium">
          Suggested questions
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESET_QUESTIONS.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelect(question)}
            className={cn(
              "text-left text-xs px-3 py-2 rounded-xl transition-all duration-200",
              "bg-white/[0.04] border border-white/[0.08]",
              "text-white/50 hover:text-white/80",
              "hover:border-amber-500/30 hover:bg-amber-500/[0.06]",
              "active:scale-[0.98]"
            )}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
