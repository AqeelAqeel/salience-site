import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();

    // Fetch session, messages, and cards in parallel
    const [sessionResult, messagesResult, cardsResult] = await Promise.all([
      supabase.from("sessions").select("*").eq("id", id).single(),
      supabase
        .from("messages")
        .select("*")
        .eq("session_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("context_cards")
        .select("*")
        .eq("session_id", id)
        .order("card_index", { ascending: true }),
    ]);

    if (sessionResult.error || !sessionResult.data) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      session: sessionResult.data,
      messages: messagesResult.data || [],
      cards: cardsResult.data || [],
    });
  } catch (error) {
    console.error("Session GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
