import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";
import {
  authFailureResponse,
  isAuthFailure,
  requireFriendOwner,
} from "@/lib/friends/auth";

export const runtime = "nodejs";

const EDITABLE_FIELDS = [
  "friend_personalization_context",
  "friend_tone_hints",
  "friend_signoff",
] as const;

type EditableField = (typeof EDITABLE_FIELDS)[number];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await requireFriendOwner(req, slug);
  if (isAuthFailure(auth)) return authFailureResponse(auth);

  const body = (await req.json().catch(() => null)) as Partial<
    Record<EditableField, unknown>
  > | null;
  if (!body) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const patch: Partial<Record<EditableField, string>> = {};
  for (const key of EDITABLE_FIELDS) {
    const v = body[key];
    if (typeof v === "string") patch[key] = v;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "no editable fields supplied" },
      { status: 400 }
    );
  }

  const supa = getServerSupabase();
  const { data, error } = await supa
    .from("prospects")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", auth.friend.id)
    .select(
      "friend_personalization_context, friend_tone_hints, friend_signoff"
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ friend: data });
}
