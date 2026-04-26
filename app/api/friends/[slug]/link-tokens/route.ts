import { NextRequest, NextResponse } from "next/server";
import { upsertGmailToken } from "@/lib/friends/db";
import {
  authFailureResponse,
  isAuthFailure,
  requireSessionForFriend,
} from "@/lib/friends/auth";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const session = await requireSessionForFriend(req, slug);
  if (isAuthFailure(session)) return authFailureResponse(session);

  const { friend, userId } = session;

  // The slug is bound to one Supabase user. First-link claims it; subsequent
  // links by the same user refresh tokens. A different user = hard reject.
  if (
    friend.friend_supabase_user_id &&
    friend.friend_supabase_user_id !== userId
  ) {
    return NextResponse.json(
      {
        error: "this cockpit is bound to a different account",
        reason: "wrong_owner",
      },
      { status: 403 }
    );
  }

  const body = (await req.json().catch(() => null)) as {
    googleEmail?: string;
    accessToken?: string;
    refreshToken?: string;
    scope?: string;
    expiresAt?: number | null;
  } | null;

  if (!body || !body.accessToken || !body.refreshToken) {
    return NextResponse.json(
      {
        error:
          "missing accessToken or refreshToken (make sure you requested offline access + prompt=consent)",
      },
      { status: 400 }
    );
  }

  // The body's supabaseUserId is now ignored — we trust the verified JWT only.
  const expiryDate = body.expiresAt
    ? new Date(body.expiresAt * 1000).toISOString()
    : null;

  const token = await upsertGmailToken({
    prospectId: friend.id,
    supabaseUserId: userId,
    googleEmail: body.googleEmail ?? "",
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    scope: body.scope ?? "",
    expiryDate,
  });

  return NextResponse.json({
    ok: true,
    tokenId: token.id,
    claimed: !friend.friend_supabase_user_id,
  });
}
