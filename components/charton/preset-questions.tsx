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
        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-xs text-slate-400 font-medium">
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
              "bg-slate-50 border border-slate-200",
              "text-slate-500 hover:text-blue-700",
              "hover:border-blue-300 hover:bg-blue-50",
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
