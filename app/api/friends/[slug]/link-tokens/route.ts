import { NextRequest, NextResponse } from "next/server";
import { getFriendBySlug, upsertGmailToken } from "@/lib/friends/db";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const friend = await getFriendBySlug(slug);
  if (!friend) {
    return NextResponse.json({ error: "friend not found" }, { status: 404 });
  }

  const body = (await req.json()) as {
    supabaseUserId?: string;
    googleEmail?: string;
    accessToken?: string;
    refreshToken?: string;
    scope?: string;
    expiresAt?: number | null;
  };

  if (!body.supabaseUserId || !body.accessToken || !body.refreshToken) {
    return NextResponse.json(
      {
        error:
          "missing supabaseUserId, accessToken, or refreshToken (make sure you requested offline access + prompt=consent)",
      },
      { status: 400 }
    );
  }

  const expiryDate = body.expiresAt
    ? new Date(body.expiresAt * 1000).toISOString()
    : null;

  const token = await upsertGmailToken({
    prospectId: friend.id,
    supabaseUserId: body.supabaseUserId,
    googleEmail: body.googleEmail ?? "",
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    scope: body.scope ?? "",
    expiryDate,
  });

  return NextResponse.json({ ok: true, tokenId: token.id });
}
