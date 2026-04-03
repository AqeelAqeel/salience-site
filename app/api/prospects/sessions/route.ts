import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// POST: Create a new intake session for a prospect
export async function POST(request: Request) {
  try {
    const { prospectId, sessionType, title } = await request.json();

    if (!prospectId) {
      return NextResponse.json(
        { error: "prospectId is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("prospect_sessions")
      .insert({
        prospect_id: prospectId,
        session_type: sessionType || "intake",
        title: title || "Intake Interview",
        status: "active",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ session: data });
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
