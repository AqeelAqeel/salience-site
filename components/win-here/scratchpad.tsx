"use client";

import {
  Globe,
  Compass,
  Flame,
  Sparkles,
  CheckCircle2,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WinHereScratchpad } from "@/lib/types/win-here";

interface ScratchpadProps {
  data: WinHereScratchpad;
  className?: string;
}

function Section({
  icon: Icon,
  label,
  children,
  empty,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40">
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
      <div
        className={cn(
          "text-sm leading-relaxed",
          empty ? "text-white/25 italic" : "text-white/80"
        )}
      >
        {children}
      </div>
    </div>
  );
}

function AcutenessBar({ value }: { value: "low" | "medium" | "high" | "" }) {
  if (!value) {
    return <span className="text-white/25 italic">—</span>;
  }
  const label = value === "high" ? "High" : value === "medium" ? "Medium" : "Low";
  const color =
    value === "high"
      ? "bg-red-500"
      : value === "medium"
        ? "bg-amber-500"
        : "bg-emerald-500";
  const width = value === "high" ? "100%" : value === "medium" ? "60%" : "25%";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-white/80">{label}</span>
        <Flame
          className={cn(
            "w-4 h-4",
            value === "high"
              ? "text-red-400"
              : value === "medium"
                ? "text-amber-400"
                : "text-emerald-400"
          )}
        />
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width }}
        />
      </div>
    </div>
  );
}

function ReadinessBadge({ verdict }: { verdict: WinHereScratchpad["readiness"]["verdict"] }) {
  if (!verdict) return <span className="text-white/25 italic">—</span>;
  const config = {
    exploring: { label: "Exploring", color: "text-white/50 border-white/10 bg-white/[0.03]" },
    warming: { label: "Warming up", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
    ready: { label: "Ready to move", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  }[verdict];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium",
        config.color
      )}
    >
      <CheckCircle2 className="w-3 h-3" />
      {config.label}
    </div>
  );
}

export function Scratchpad({ data, className }: ScratchpadProps) {
  const isEmpty =
    !data.siteName &&
    !data.domainExpertise &&
    !data.pains.length &&
    !data.preferredWork.length;

  return (
    <div
      className={cn(
        "flex flex-col gap-6 p-6 rounded-2xl",
        "bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Brain className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/90">Live read</h3>
            <p className="text-xs text-white/40">what i&apos;m hearing so far</p>
          </div>
        </div>
      </div>

      {isEmpty && (
        <p className="text-sm text-white/30 italic leading-relaxed">
          This board fills in as we talk. Your site, what you do, what&apos;s eating
          your week, what you&apos;d rather be doing — all tracked here so nothing
          gets lost.
        </p>
      )}

      <Section icon={Globe} label="Site" empty={!data.siteName}>
        {data.siteName || "not shared yet"}
      </Section>

      <Section icon={Compass} label="Domain / expertise" empty={!data.domainExpertise}>
        {data.domainExpertise || "reading between the lines..."}
      </Section>

      <Section icon={Flame} label="What's got you bogged down" empty={!data.pains.length}>
        {data.pains.length ? (
          <ul className="space-y-1.5 list-none">
            {data.pains.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-amber-500/70 shrink-0">•</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        ) : (
          "not on the table yet"
        )}
      </Section>

      <Section icon={Sparkles} label="What you'd rather be doing" empty={!data.preferredWork.length}>
        {data.preferredWork.length ? (
          <ul className="space-y-1.5 list-none">
            {data.preferredWork.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-emerald-500/70 shrink-0">•</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        ) : (
          "we'll get there"
        )}
      </Section>

      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-white/40">Acuteness</div>
          <AcutenessBar value={data.acuteness} />
        </div>
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-white/40">Readiness</div>
          <ReadinessBadge verdict={data.readiness.verdict} />
        </div>
      </div>

      {data.readiness.rationale && (
        <div className="text-xs text-white/40 italic leading-relaxed border-l-2 border-white/10 pl-3">
          {data.readiness.rationale}
        </div>
      )}
    </div>
  );
}
