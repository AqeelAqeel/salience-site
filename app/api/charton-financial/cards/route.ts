import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function PUT(request: Request) {
  try {
    const { sessionId, cardIndex, title, body } = await request.json();

    if (!sessionId || cardIndex === undefined || cardIndex === null) {
      return NextResponse.json(
        { error: "sessionId and cardIndex are required" },
        { status: 400 }
      );
    }

    if (cardIndex < 0 || cardIndex > 2) {
      return NextResponse.json(
        { error: "cardIndex must be 0, 1, or 2" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data: card, error } = await supabase
      .from("context_cards")
      .upsert(
        {
          session_id: sessionId,
          card_index: cardIndex,
          title: title ?? "",
          body: body ?? "",
        },
        { onConflict: "session_id,card_index" }
      )
      .select()
      .single();

    if (error) {
      console.error("Supabase error updating card:", error);
      return NextResponse.json(
        { error: "Failed to update card" },
        { status: 500 }
      );
    }

    return NextResponse.json({ card });
  } catch (error) {
    console.error("Cards PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update card" },
      { status: 500 }
    );
  }
}
