"use client";

import { useEffect, useState } from "react";
import type {
  FriendEmailThread,
  FriendRecipientProfile,
  FriendReplyDraft,
  FriendThreadInterpretation,
  Urgency,
} from "@/lib/friends/types";

type Props = {
  thread: FriendEmailThread;
  interpretation?: FriendThreadInterpretation;
  drafts: FriendReplyDraft[];
  recipients: Record<string, FriendRecipientProfile>;
  analyzing: boolean;
  expanded: boolean;
  compact?: boolean;
  onOpen: () => void;
  onSaveDraft: (draftId: string, body: string) => Promise<void>;
  onPushToGmail: (draftId: string) => Promise<void>;
  onMarkDone: () => void;
};

export function ThreadCard({
  thread,
  interpretation,
  drafts,
  recipients,
  analyzing,
  expanded,
  compact,
  onOpen,
  onSaveDraft,
  onPushToGmail,
  onMarkDone,
}: Props) {
  const latestDraft = drafts[0];
  const counterparty = findCounterparty(thread.participants, recipients);
  const urgency = interpretation?.urgency ?? "low";
  const isDone = thread.status === "done";

  return (
    <article
      className={`crosshair-card relative rounded-lg border hairline bg-[var(--fr-bg-soft)] transition-colors ${
        expanded ? "bg-[var(--fr-bg-elevated)]" : ""
      } ${isDone ? "opacity-50" : ""}`}
    >
      {analyzing && <span className="scan-overlay" />}

      <button
        type="button"
        onClick={onOpen}
        className="w-full text-left px-5 py-4 md:px-6 md:py-5 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <UrgencyDot urgency={urgency} done={isDone} />
              <p className="small-caps">
                {statusLabel(thread.status)}
                {interpretation?.suggested_tone
                  ? ` · ${interpretation.suggested_tone.toLowerCase()}`
                  : ""}
              </p>
            </div>
            <h3 className="text-[15px] md:text-[16px] font-medium text-[var(--fr-text-hi)] truncate">
              {thread.subject || "(no subject)"}
            </h3>
            <p className="mono text-[11px] text-[var(--fr-text-low)] mt-1 truncate">
              {counterparty
                ? counterparty.name
                  ? `${counterparty.name} · ${counterparty.email}`
                  : counterparty.email
                : thread.participants.slice(0, 2).join(", ")}
            </p>
          </div>
          <span className="mono text-[11px] text-[var(--fr-text-low)] whitespace-nowrap pt-1">
            {formatRelative(thread.last_message_at)}
          </span>
        </div>

        {!compact && interpretation && (
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--fr-text-mid)]">
            {interpretation.summary}
          </p>
        )}
        {compact && interpretation && (
          <p className="mt-2 text-[13.5px] leading-snug text-[var(--fr-text-mid)] line-clamp-2">
            {interpretation.summary}
          </p>
        )}
      </button>

      {expanded && (
        <div className="px-5 md:px-6 pb-6 pt-1 space-y-5 rule-top">
          {interpretation && (
            <div className="pt-5 grid md:grid-cols-2 gap-5">
              <InfoBlock label="what they want">
                {interpretation.sender_intent || "—"}
              </InfoBlock>
              <InfoBlock label="required action">
                {interpretation.required_action || "—"}
              </InfoBlock>
              {interpretation.relationship_context && (
                <InfoBlock label="context" full>
                  {interpretation.relationship_context}
                </InfoBlock>
              )}
              {interpretation.risks.length > 0 && (
                <InfoBlock label="risks">
                  <Bullets items={interpretation.risks} />
                </InfoBlock>
              )}
              {interpretation.opportunities.length > 0 && (
                <InfoBlock label="opportunities">
                  <Bullets items={interpretation.opportunities} />
                </InfoBlock>
              )}
            </div>
          )}

          {latestDraft && (
            <DraftEditor
              draft={latestDraft}
              onSave={(body) => onSaveDraft(latestDraft.id, body)}
              onPush={() => onPushToGmail(latestDraft.id)}
            />
          )}

          <div className="flex flex-wrap gap-2 pt-2 rule-top pt-5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMarkDone();
              }}
              className="fr-btn fr-btn-ghost text-[12px]"
            >
              mark done
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function DraftEditor({
  draft,
  onSave,
  onPush,
}: {
  draft: FriendReplyDraft;
  onSave: (body: string) => Promise<void>;
  onPush: () => Promise<void>;
}) {
  const [value, setValue] = useState(draft.body);
  const [saving, setSaving] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [copied, setCopied] = useState(false);
  const dirty = value !== draft.body;

  useEffect(() => {
    setValue(draft.body);
  }, [draft.body]);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(value);
    } finally {
      setSaving(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handlePush() {
    if (dirty) await onSave(value);
    setPushing(true);
    try {
      await onPush();
    } finally {
      setPushing(false);
    }
  }

  const status = statusLabelDraft(draft.status);

  return (
    <div className="rounded-md border hairline bg-[var(--fr-bg)] p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="small-caps">your draft · v{draft.version}</p>
        <p className="mono text-[11px] text-[var(--fr-text-low)]">{status}</p>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className="fr-draft"
      />
      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          className="fr-btn fr-btn-ghost text-[12px]"
        >
          {copied ? "copied" : "copy"}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSave();
          }}
          disabled={!dirty || saving}
          className="fr-btn fr-btn-ghost text-[12px]"
        >
          {saving ? "saving…" : dirty ? "save edit" : "saved"}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePush();
          }}
          disabled={pushing}
          className="fr-btn fr-btn-amber text-[12px]"
        >
          {pushing ? "pushing…" : "put in gmail drafts"}
        </button>
      </div>
    </div>
  );
}

function UrgencyDot({ urgency, done }: { urgency: Urgency; done?: boolean }) {
  if (done) return <span className="dot dot-done" />;
  return <span className={`dot dot-${urgency}`} />;
}

function InfoBlock({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <p className="small-caps mb-1.5">{label}</p>
      <div className="text-[13.5px] text-[var(--fr-text-mid)] leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((t, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-[var(--fr-accent)] mt-[2px]">·</span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function findCounterparty(
  participants: string[],
  recipients: Record<string, FriendRecipientProfile>
): FriendRecipientProfile | null {
  for (const email of participants) {
    if (recipients[email]) return recipients[email];
  }
  return null;
}

function statusLabel(status: FriendEmailThread["status"]): string {
  switch (status) {
    case "needs_reply": return "needs reply";
    case "processing":  return "processing";
    case "analyzed":    return "read";
    case "done":        return "done";
    case "ignored":     return "ignored";
    case "new":         return "new";
  }
}

function statusLabelDraft(status: FriendReplyDraft["status"]): string {
  switch (status) {
    case "generated":     return "auto · v1";
    case "edited":        return "edited";
    case "approved":      return "approved";
    case "sent_to_gmail": return "in gmail drafts";
    case "discarded":     return "discarded";
  }
}

function formatRelative(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const s = Math.round(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d`;
  const mo = Math.round(d / 30);
  return `${mo}mo`;
}
