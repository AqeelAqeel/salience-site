import { NextRequest, NextResponse } from "next/server";
import { getCockpitSnapshot } from "@/lib/friends/db";
import {
  authFailureResponse,
  isAuthFailure,
  requireFriendOwner,
} from "@/lib/friends/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await requireFriendOwner(req, slug);
  if (isAuthFailure(auth)) return authFailureResponse(auth);

  const snapshot = await getCockpitSnapshot(auth.friend);
  return NextResponse.json(snapshot);
}
