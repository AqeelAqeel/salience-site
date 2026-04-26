"use client";

import { useEffect, useRef, useState } from "react";
import type { CockpitSnapshot } from "@/lib/friends/types";

const INSTRUCTIONS_PLACEHOLDER =
  "Specific instructions that should override defaults. e.g. 'always offer a 15min call when asked about pricing', 'never apologize for late replies', 'match the sender's formality', 'cc legal on anything contract-related'.";

export function ContextPanel({
  snapshot,
  onSavePersonalization,
}: {
  snapshot: CockpitSnapshot;
  onSavePersonalization?: (value: string) => Promise<void>;
}) {
  const { friend, aiState, threads, recipients } = snapshot;
  const needsReply = threads.filter((t) => t.status === "needs_reply").length;
  const highUrgency = Object.values(snapshot.interpretations).filter(
    (i) => i.urgency === "high"
  ).length;

  const topSenders = Object.values(recipients)
    .sort((a, b) => (b.name.length > 0 ? 1 : 0) - (a.name.length > 0 ? 1 : 0))
    .slice(0, 6);

  const hasVoice = Boolean(
    aiState?.communication_style || aiState?.common_phrases?.length
  );

  return (
    <div className="space-y-8 pt-4 text-[13.5px] text-[var(--fr-text-mid)]">
      <PanelSection label="who this is for">
        <p className="text-[var(--fr-text-hi)] leading-snug">
          {friend.full_name || friend.friend_slug}
        </p>
        {friend.company_name && (
          <p className="mono text-[11px] mt-1">{friend.company_name}</p>
        )}
      </PanelSection>

      <VoiceSection aiState={aiState} hasVoice={hasVoice} />

      <InstructionsEditor
        initial={friend.friend_personalization_context}
        onSave={onSavePersonalization}
      />

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

function VoiceSection({
  aiState,
  hasVoice,
}: {
  aiState: CockpitSnapshot["aiState"];
  hasVoice: boolean;
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <p className="small-caps">your voice · auto-detected</p>
        <span className="mono text-[10.5px] text-[var(--fr-text-low)]">
          from sent mail
        </span>
      </div>

      {!hasVoice ? (
        <p className="text-[12.5px] text-[var(--fr-text-low)] leading-relaxed italic">
          we&rsquo;ll read ~30 of your recent sent emails on the next sync and
          extract how you write, the phrases you actually reuse, and your
          sign-off — then feed that to the drafter so replies sound like you.
        </p>
      ) : (
        <div className="space-y-4">
          {aiState?.communication_style && (
            <p className="text-[13px] leading-relaxed text-[var(--fr-text-hi)]">
              {aiState.communication_style}
            </p>
          )}
          {aiState?.common_phrases?.length ? (
            <div>
              <p className="mono text-[10.5px] text-[var(--fr-text-low)] mb-2">
                phrases you actually reuse
              </p>
              <div className="flex flex-wrap gap-1.5">
                {aiState.common_phrases.map((p, i) => (
                  <span
                    key={i}
                    className="mono text-[11px] px-2 py-0.5 rounded-full border hairline text-[var(--fr-text-mid)] bg-[color:var(--fr-text-hi)]/[0.02]"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

function InstructionsEditor({
  initial,
  onSave,
}: {
  initial: string;
  onSave?: (value: string) => Promise<void>;
}) {
  const [value, setValue] = useState(initial);
  const [savedValue, setSavedValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setValue(initial);
    setSavedValue(initial);
  }, [initial]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 360)}px`;
  }, [value]);

  const dirty = value !== savedValue;
  const justSaved = savedAt !== null && !dirty;

  async function handleSave() {
    if (!onSave || !dirty || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(value);
      setSavedValue(value);
      setSavedAt(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : "save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <p className="small-caps">specific instructions</p>
        <span
          className={`mono text-[10.5px] ${
            error
              ? "text-[var(--fr-accent-soft)]"
              : dirty
                ? "text-[var(--fr-text-low)]"
                : justSaved
                  ? "text-[var(--fr-text-mid)]"
                  : "text-transparent"
          }`}
        >
          {error ? "error" : dirty ? "unsaved" : justSaved ? "saved" : "·"}
        </span>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            void handleSave();
          }
        }}
        placeholder={INSTRUCTIONS_PLACEHOLDER}
        spellCheck={false}
        rows={5}
        className="w-full resize-none bg-transparent border hairline rounded-md px-3 py-2 text-[13px] leading-relaxed text-[var(--fr-text-hi)] placeholder:text-[var(--fr-text-low)] focus:outline-none focus:border-[var(--fr-accent)] transition-colors"
      />
      <div className="mt-2 flex items-center justify-between">
        <p className="text-[11px] text-[var(--fr-text-low)] leading-snug pr-3">
          overrides the auto-detected voice when they conflict
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving || !onSave}
          className="mono text-[11px] px-2 py-1 rounded border hairline text-[var(--fr-text-mid)] hover:text-[var(--fr-text-hi)] hover:border-[var(--fr-accent)] disabled:opacity-30 disabled:hover:border-[color:inherit] disabled:hover:text-[var(--fr-text-mid)] transition-colors"
        >
          {saving ? "saving…" : dirty ? "save (⌘↵)" : "saved"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-[11px] text-[var(--fr-accent-soft)]">{error}</p>
      )}
    </section>
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
