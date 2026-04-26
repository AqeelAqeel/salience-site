import { getServerSupabase } from "../supabase-server";
import {
  fetchSentBodies,
  fetchThreadById,
  listInboxThreadIds,
} from "./gmail";
import { interpretThread, extractStyleSummary } from "./ai";
import type {
  FriendEmailThread,
  FriendGmailToken,
  FriendSurface,
  StreamEvent,
  Urgency,
} from "./types";

const PRIORITY_BY_URGENCY: Record<Urgency, number> = {
  low: 20,
  medium: 60,
  high: 100,
};

type Emit = (event: StreamEvent) => void;

export async function runSync(args: {
  friend: FriendSurface;
  token: FriendGmailToken;
  maxThreads?: number;
  emit?: Emit;
}) {
  const { friend, token, emit } = args;
  const max = args.maxThreads ?? 40;
  const supa = getServerSupabase();

  // Learn the user's voice + sign-off + common phrases from their own recent
  // sent mail so drafts sound like them — not the seed friend_tone_hints /
  // friend_signoff. Failure is non-fatal; we fall back to the seed cues.
  let learnedStyle = "";
  let learnedSignoff = "";
  let learnedPhrases: string[] = [];
  try {
    const sentBodies = await fetchSentBodies(token, { maxMessages: 30 });
    if (sentBodies.length) {
      const extracted = await extractStyleSummary(sentBodies);
      learnedStyle = extracted.style;
      learnedSignoff = extracted.signoff;
      learnedPhrases = extracted.commonPhrases;
      if (learnedStyle || learnedPhrases.length) {
        const { data: aiStateRow } = await supa
          .from("friend_ai_state")
          .upsert(
            {
              prospect_id: friend.id,
              communication_style: learnedStyle,
              common_phrases: learnedPhrases,
            },
            { onConflict: "prospect_id" }
          )
          .select()
          .single();
        emit?.({
          type: "user_state_updated",
          aiStateId: (aiStateRow as { id: string } | null)?.id ?? "",
        });
      }
    }
  } catch (err) {
    console.warn("[friends] voice extraction failed, continuing without it:", err);
  }

  // Stream threads in one at a time: list cheap IDs first, then fetch +
  // analyze + draft per thread so each card lands in the cockpit as soon as
  // it's ready instead of waiting for a 40-thread upfront batch.
  let threadIds: string[];
  try {
    threadIds = await listInboxThreadIds(token, { maxThreads: max });
  } catch (err) {
    const message = err instanceof Error ? err.message : "gmail fetch failed";
    emit?.({ type: "error", message });
    throw err;
  }

  emit?.({ type: "sync_started", totalEstimate: threadIds.length });

  let processed = 0;

  for (const gmailThreadId of threadIds) {
    const t = await fetchThreadById(token, gmailThreadId);
    if (!t) continue;

    const { data: threadRow, error: threadErr } = await supa
      .from("friend_email_threads")
      .upsert(
        {
          prospect_id: friend.id,
          gmail_thread_id: t.gmailThreadId,
          subject: t.subject,
          participants: t.participants,
          last_message_at: t.lastMessageAt?.toISOString() ?? null,
          snippet: t.snippet,
          status: "processing",
        },
        { onConflict: "prospect_id,gmail_thread_id" }
      )
      .select()
      .single();

    if (threadErr || !threadRow) {
      emit?.({
        type: "error",
        message: `thread upsert failed: ${threadErr?.message}`,
      });
      continue;
    }
    const row = threadRow as FriendEmailThread;

    emit?.({
      type: "email_loaded",
      threadId: row.id,
      subject: row.subject,
    });

    if (t.messages.length) {
      await supa.from("friend_email_messages").upsert(
        t.messages.map((m) => ({
          prospect_id: friend.id,
          thread_id: row.id,
          gmail_message_id: m.gmailMessageId,
          from_email: m.fromEmail,
          from_name: m.fromName,
          to_emails: m.toEmails,
          cc_emails: m.ccEmails,
          sent_at: m.sentAt?.toISOString() ?? null,
          body_text: m.bodyText,
          body_html: m.bodyHtml,
          snippet: m.snippet,
        })),
        { onConflict: "prospect_id,gmail_message_id" }
      );
    }

    const uniqueRecipients = new Map<string, { name: string }>();
    for (const m of t.messages) {
      if (m.fromEmail && m.fromEmail !== friend.email) {
        uniqueRecipients.set(m.fromEmail, { name: m.fromName });
      }
    }
    if (uniqueRecipients.size) {
      await supa.from("friend_recipient_profiles").upsert(
        [...uniqueRecipients.entries()].map(([email, { name }]) => ({
          prospect_id: friend.id,
          email,
          name,
        })),
        { onConflict: "prospect_id,email" }
      );
    }

    emit?.({ type: "analysis_started", threadId: row.id });

    try {
      const interpretation = await interpretThread({
        friend,
        learnedStyle,
        learnedSignoff,
        learnedPhrases,
        subject: t.subject,
        participants: t.participants,
        messages: t.messages,
      });

      const { data: interpRow } = await supa
        .from("friend_thread_interpretations")
        .insert({
          prospect_id: friend.id,
          thread_id: row.id,
          summary: interpretation.summary,
          sender_intent: interpretation.senderIntent,
          required_action: interpretation.requiredAction,
          urgency: interpretation.urgency,
          relationship_context: interpretation.relationshipContext,
          risks: interpretation.risks,
          opportunities: interpretation.opportunities,
          suggested_tone: interpretation.suggestedTone,
          should_reply: interpretation.shouldReply,
          reasoning_summary: "",
        })
        .select()
        .single();

      await supa
        .from("friend_email_threads")
        .update({
          status: interpretation.shouldReply ? "needs_reply" : "analyzed",
          priority_score: PRIORITY_BY_URGENCY[interpretation.urgency] ?? 20,
        })
        .eq("id", row.id);

      emit?.({
        type: "analysis_completed",
        threadId: row.id,
        interpretationId: (interpRow as { id: string } | null)?.id ?? "",
      });

      if (interpretation.shouldReply && interpretation.draftReply) {
        // Don't duplicate drafts on resync. Inspect the latest draft for this
        // thread: if it's still `generated` (AI-authored, untouched), refresh
        // it in place with a version bump. If the user has `edited`, approved,
        // sent, or discarded it, leave their work alone.
        const { data: existing } = await supa
          .from("friend_reply_drafts")
          .select("id, status, version, body")
          .eq("thread_id", row.id)
          .order("version", { ascending: false })
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        let draftId = "";

        if (!existing) {
          const { data: draftRow } = await supa
            .from("friend_reply_drafts")
            .insert({
              prospect_id: friend.id,
              thread_id: row.id,
              body: interpretation.draftReply,
              tone: interpretation.suggestedTone,
              status: "generated",
              version: 1,
            })
            .select()
            .single();
          draftId = (draftRow as { id: string } | null)?.id ?? "";
        } else if ((existing as { status: string }).status === "generated") {
          const row0 = existing as {
            id: string;
            version: number;
            body: string;
          };
          if (row0.body !== interpretation.draftReply) {
            const { data: draftRow } = await supa
              .from("friend_reply_drafts")
              .update({
                body: interpretation.draftReply,
                tone: interpretation.suggestedTone,
                version: row0.version + 1,
              })
              .eq("id", row0.id)
              .select()
              .single();
            draftId = (draftRow as { id: string } | null)?.id ?? row0.id;
          } else {
            draftId = row0.id;
          }
        } else {
          draftId = (existing as { id: string }).id;
        }

        emit?.({
          type: "draft_created",
          threadId: row.id,
          draftId,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "analysis failed";
      emit?.({ type: "error", message });
      await supa
        .from("friend_email_threads")
        .update({ status: "analyzed" })
        .eq("id", row.id);
    }

    processed += 1;
  }

  emit?.({ type: "sync_completed", threadCount: processed });
}
