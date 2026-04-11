"use client";

import { cn } from "@/lib/utils";

interface StarterChipsProps {
  starters: string[];
  onPick: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export function StarterChips({
  starters,
  onPick,
  disabled,
  className,
}: StarterChipsProps) {
  if (!starters.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {starters.map((s, i) => (
        <button
          key={i + s}
          type="button"
          disabled={disabled}
          onClick={() => onPick(s)}
          className={cn(
            "text-left text-sm px-4 py-2.5 rounded-full",
            "bg-white/[0.04] border border-white/[0.08] text-white/70",
            "hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-white",
            "active:scale-[0.97] transition-all duration-150",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "max-w-full"
          )}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
