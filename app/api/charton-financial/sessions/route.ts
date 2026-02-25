import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { DEFAULT_CARDS } from "@/lib/types/charton";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const { data: sessions, error } = await supabase
      .from("sessions")
      .select("id, user_id, title, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching sessions:", error);
      return NextResponse.json(
        { error: "Failed to fetch sessions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessions: sessions || [] });
  } catch (error) {
    console.error("Sessions GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Create session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert({ user_id: userId, title: "New Chat" })
      .select()
      .single();

    if (sessionError || !session) {
      console.error("Supabase error creating session:", sessionError);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    // Create 3 default context cards
    const cardInserts = DEFAULT_CARDS.map((card, index) => ({
      session_id: session.id,
      card_index: index,
      title: card.title,
      body: card.body,
    }));

    const { data: cards, error: cardsError } = await supabase
      .from("context_cards")
      .insert(cardInserts)
      .select();

    if (cardsError) {
      console.error("Supabase error creating cards:", cardsError);
      return NextResponse.json(
        { error: "Failed to create context cards" },
        { status: 500 }
      );
    }

    return NextResponse.json({ session, cards });
  } catch (error) {
    console.error("Sessions POST error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
