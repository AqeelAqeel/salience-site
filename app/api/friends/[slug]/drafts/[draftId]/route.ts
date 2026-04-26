import { NextRequest, NextResponse } from "next/server";
import { getGmailToken } from "@/lib/friends/db";
import { getServerSupabase } from "@/lib/supabase-server";
import { createGmailDraft } from "@/lib/friends/gmail";
import {
  authFailureResponse,
  isAuthFailure,
  requireFriendOwner,
} from "@/lib/friends/auth";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; draftId: string }> }
) {
  const { slug, draftId } = await params;
  const auth = await requireFriendOwner(req, slug);
  if (isAuthFailure(auth)) return authFailureResponse(auth);

  const body = (await req.json().catch(() => ({}))) as {
    body?: string;
    status?: "generated" | "edited" | "approved" | "sent_to_gmail" | "discarded";
  };

  const patch: Record<string, unknown> = {};
  if (typeof body.body === "string") {
    patch.body = body.body;
    patch.status = body.status ?? "edited";
  } else if (body.status) {
    patch.status = body.status;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }

  const supa = getServerSupabase();
  const { data, error } = await supa
    .from("friend_reply_drafts")
    .update(patch)
    .eq("id", draftId)
    .eq("prospect_id", auth.friend.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ draft: data });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; draftId: string }> }
) {
  const { slug, draftId } = await params;
  const auth = await requireFriendOwner(req, slug);
  if (isAuthFailure(auth)) return authFailureResponse(auth);

  const token = await getGmailToken(auth.friend.id);
  if (!token) {
    return NextResponse.json(
      { error: "gmail not connected" },
      { status: 412 }
    );
  }

  const supa = getServerSupabase();
  const { data: draft, error: draftErr } = await supa
    .from("friend_reply_drafts")
    .select("*, thread:friend_email_threads(*)")
    .eq("id", draftId)
    .eq("prospect_id", auth.friend.id)
    .single();
  if (draftErr || !draft) {
    return NextResponse.json(
      { error: draftErr?.message ?? "draft missing" },
      { status: 404 }
    );
  }

  const thread = (
    draft as {
      thread: {
        gmail_thread_id: string;
        subject: string;
        participants: string[];
      };
    }
  ).thread;

  const { data: lastMsg } = await supa
    .from("friend_email_messages")
    .select("gmail_message_id, from_email")
    .eq("thread_id", (draft as { thread_id: string }).thread_id)
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  try {
    const draftGmailId = await createGmailDraft(token, {
      threadId: thread.gmail_thread_id,
      to: lastMsg?.from_email ? [lastMsg.from_email] : thread.participants,
      subject: thread.subject.startsWith("Re:")
        ? thread.subject
        : `Re: ${thread.subject}`,
      body: (draft as { body: string }).body,
      inReplyToMessageId: lastMsg?.gmail_message_id,
    });

    await supa
      .from("friend_reply_drafts")
      .update({ status: "sent_to_gmail" })
      .eq("id", draftId);

    return NextResponse.json({ ok: true, gmailDraftId: draftGmailId });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "gmail draft creation failed (may need gmail.compose scope)",
      },
      { status: 500 }
    );
  }
}
