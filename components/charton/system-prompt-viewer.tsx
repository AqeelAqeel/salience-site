"use client";

import { useState } from "react";
import { ChevronDown, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemPromptViewerProps {
  prompt: string;
}

export function SystemPromptViewer({ prompt }: SystemPromptViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="px-4 shrink-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs transition-all",
          "bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06]",
          "text-white/40 hover:text-white/60"
        )}
      >
        <Eye className="w-3.5 h-3.5" />
        <span className="font-medium">System Prompt</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 ml-auto transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "mt-2 p-4 rounded-xl border border-white/[0.06]",
            "bg-black/40 backdrop-blur-sm",
            "max-h-[200px] overflow-y-auto"
          )}
        >
          <pre className="text-xs text-white/50 whitespace-pre-wrap font-mono leading-relaxed">
            {prompt}
          </pre>
        </div>
      )}
    </div>
  );
}
