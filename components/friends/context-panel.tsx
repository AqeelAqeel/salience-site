"use client";

import type { CockpitSnapshot } from "@/lib/friends/types";

export function ContextPanel({ snapshot }: { snapshot: CockpitSnapshot }) {
  const { friend, aiState, threads, recipients } = snapshot;
  const needsReply = threads.filter((t) => t.status === "needs_reply").length;
  const highUrgency = Object.values(snapshot.interpretations).filter(
    (i) => i.urgency === "high"
  ).length;

  const topSenders = Object.values(recipients)
    .sort((a, b) => (b.name.length > 0 ? 1 : 0) - (a.name.length > 0 ? 1 : 0))
    .slice(0, 6);

  return (
    <div className="space-y-8 pt-4 text-[13.5px] text-[var(--fr-text-mid)]">
      <PanelSection label="who this is for">
        <p className="text-[var(--fr-text-hi)] leading-snug">
          {friend.full_name || friend.friend_slug}
        </p>
        {friend.company_name && (
          <p className="mono text-[11px] mt-1">{friend.company_name}</p>
        )}
        {friend.friend_tone_hints && (
          <p className="mt-3 leading-relaxed">{friend.friend_tone_hints}</p>
        )}
      </PanelSection>

      <PanelSection label="signal">
        <div className="space-y-2">
          <MetricRow label="pending replies" value={String(needsReply)} accent={needsReply > 0} />
          <MetricRow label="high urgency" value={String(highUrgency)} accent={highUrgency > 0} />
          <MetricRow label="threads scanned" value={String(threads.length)} />
        </div>
      </PanelSection>

      {aiState?.observed_patterns?.length ? (
        <PanelSection label="patterns your AI is noticing">
          <ul className="space-y-2">
            {aiState.observed_patterns.slice(0, 6).map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[var(--fr-accent)] mt-[2px]">·</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </PanelSection>
      ) : null}

      {aiState?.communication_style ? (
        <PanelSection label="how you write">
          <p className="leading-relaxed">{aiState.communication_style}</p>
        </PanelSection>
      ) : null}

      {topSenders.length > 0 && (
        <PanelSection label="people in your inbox">
          <ul className="space-y-3">
            {topSenders.map((r) => (
              <li key={r.email} className="leading-tight">
                <p className="text-[var(--fr-text-hi)]">{r.name || r.email}</p>
                {r.name && <p className="mono text-[11px] mt-0.5">{r.email}</p>}
                {r.ai_summary && (
                  <p className="text-[12.5px] mt-1 text-[var(--fr-text-mid)]">
                    {r.ai_summary}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </PanelSection>
      )}
    </div>
  );
}

function PanelSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="small-caps mb-3">{label}</p>
      <div>{children}</div>
    </section>
  );
}

function MetricRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--fr-text-mid)]">{label}</span>
      <span
        className={`mono text-[13px] ${accent ? "text-[var(--fr-accent-soft)]" : "text-[var(--fr-text-hi)]"}`}
      >
        {value}
      </span>
    </div>
  );
}
