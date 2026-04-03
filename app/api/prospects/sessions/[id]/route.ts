import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// GET: Fetch session with its turns
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();

    const { data: session, error } = await supabase
      .from("prospect_sessions")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const { data: turns } = await supabase
      .from("prospect_turns")
      .select("*")
      .eq("session_id", id)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      session,
      turns: turns || [],
    });
  } catch (error) {
    console.error("Fetch session error:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

// PUT: Update session (status, summary, etc.)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    delete updates.id;
    delete updates.created_at;
    delete updates.access_token;

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("prospect_sessions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ session: data });
  } catch (error) {
    console.error("Update session error:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}
