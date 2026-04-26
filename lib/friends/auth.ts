import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getFriendBySlug } from "./db";
import type { FriendSurface } from "./types";

export type AuthedFriend = {
  friend: FriendSurface;
  userId: string;
  accessToken: string;
};

export type AuthFailureReason =
  | "missing_session"
  | "invalid_session"
  | "no_friend"
  | "unclaimed"
  | "wrong_owner"
  | "server_misconfig";

export type AuthFailure = {
  reason: AuthFailureReason;
  status: number;
  message: string;
};

/**
 * Pulls the access token from either the Authorization header or an
 * `?access_token=` query param.
 *
 * The query-param fallback exists for `EventSource`, which can't set custom
 * headers. Tokens are short-lived (1h), traveling over HTTPS in prod, and
 * scoped to a single slug — acceptable for this surface.
 */
export function extractAccessToken(req: NextRequest): string | null {
  const auth =
    req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (auth) {
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (m) return m[1].trim();
  }
  const qp = req.nextUrl?.searchParams.get("access_token");
  return qp && qp.length > 0 ? qp : null;
}

async function verifyAccessToken(accessToken: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  const supa = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supa.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user.id;
}

/**
 * Strict gate for routes that require the calling Supabase user to *own* the
 * friend slug (i.e. their user_id matches `prospects.friend_supabase_user_id`).
 *
 * Returns either:
 *   - { friend, userId, accessToken } on success
 *   - AuthFailure on any rejection (caller decides how to render it)
 *
 * `link-tokens` does NOT use this — it's the only route that's allowed to
 * operate on an unclaimed slug, since claiming ownership is its job.
 */
export async function requireFriendOwner(
  req: NextRequest,
  slug: string
): Promise<AuthedFriend | AuthFailure> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  ) {
    return {
      reason: "server_misconfig",
      status: 500,
      message: "supabase env vars missing",
    };
  }

  const accessToken = extractAccessToken(req);
  if (!accessToken) {
    return {
      reason: "missing_session",
      status: 401,
      message: "sign in required",
    };
  }

  const userId = await verifyAccessToken(accessToken);
  if (!userId) {
    return {
      reason: "invalid_session",
      status: 401,
      message: "session expired or invalid — sign in again",
    };
  }

  const friend = await getFriendBySlug(slug);
  if (!friend) {
    return {
      reason: "no_friend",
      status: 404,
      message: `no active friend at slug "${slug}"`,
    };
  }

  if (!friend.friend_supabase_user_id) {
    return {
      reason: "unclaimed",
      status: 409,
      message: "this cockpit hasn't been claimed yet — sign in to claim it",
    };
  }

  if (friend.friend_supabase_user_id !== userId) {
    return {
      reason: "wrong_owner",
      status: 403,
      message: "this cockpit is bound to a different account",
    };
  }

  return { friend, userId, accessToken };
}

/**
 * For `link-tokens` only: verifies the session and returns the friend, but
 * permits an unclaimed slug. The caller decides whether to claim or reject.
 */
export async function requireSessionForFriend(
  req: NextRequest,
  slug: string
):
  | Promise<{ friend: FriendSurface; userId: string; accessToken: string } | AuthFailure> {
  const accessToken = extractAccessToken(req);
  if (!accessToken) {
    return {
      reason: "missing_session",
      status: 401,
      message: "sign in required",
    };
  }
  const userId = await verifyAccessToken(accessToken);
  if (!userId) {
    return {
      reason: "invalid_session",
      status: 401,
      message: "session expired or invalid",
    };
  }
  const friend = await getFriendBySlug(slug);
  if (!friend) {
    return {
      reason: "no_friend",
      status: 404,
      message: `no active friend at slug "${slug}"`,
    };
  }
  return { friend, userId, accessToken };
}

export function isAuthFailure(x: unknown): x is AuthFailure {
  return (
    typeof x === "object" &&
    x !== null &&
    "reason" in x &&
    "status" in x &&
    "message" in x
  );
}

export function authFailureResponse(failure: AuthFailure): NextResponse {
  return NextResponse.json(
    { error: failure.message, reason: failure.reason },
    { status: failure.status }
  );
}
