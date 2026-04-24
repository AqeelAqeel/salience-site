import { NextRequest, NextResponse } from "next/server";
import { getFriendBySlug } from "@/lib/friends/db";
import { getServerSupabase } from "@/lib/supabase-server";
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
  const friend = await getFriendBySlug(slug);
  if (!friend) {
    return NextResponse.json({ error: "friend not found" }, { status: 404 });
  }

  const { status } = (await req.json()) as { status?: ThreadStatus };
  if (!status || !ALLOWED.includes(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  const supa = getServerSupabase();
  const { error } = await supa
    .from("friend_email_threads")
    .update({ status })
    .eq("id", threadId)
    .eq("prospect_id", friend.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
