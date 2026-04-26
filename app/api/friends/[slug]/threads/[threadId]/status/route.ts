import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";
import {
  authFailureResponse,
  isAuthFailure,
  requireFriendOwner,
} from "@/lib/friends/auth";
import type { ThreadStatus } from "@/lib/friends/types";

export const runtime = "nodejs";

const ALLOWED: ThreadStatus[] = [
  "new",
  "processing",
  "analyzed",
  "needs_reply",
  "done",
  "ignored",
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; threadId: string }> }
) {
  const { slug, threadId } = await params;

  const auth = await requireFriendOwner(req, slug);
  if (isAuthFailure(auth)) return authFailureResponse(auth);

  const { status } = (await req.json().catch(() => ({}))) as {
    status?: ThreadStatus;
  };
  if (!status || !ALLOWED.includes(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  const supa = getServerSupabase();
  const { error } = await supa
    .from("friend_email_threads")
    .update({ status })
    .eq("id", threadId)
    .eq("prospect_id", auth.friend.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
