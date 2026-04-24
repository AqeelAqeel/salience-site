import { NextRequest, NextResponse } from "next/server";
import { getCockpitSnapshot, getFriendBySlug } from "@/lib/friends/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const friend = await getFriendBySlug(slug);
  if (!friend) {
    return NextResponse.json({ error: "friend not found" }, { status: 404 });
  }
  const snapshot = await getCockpitSnapshot(friend);
  return NextResponse.json(snapshot);
}
