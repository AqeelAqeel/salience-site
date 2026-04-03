import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// GET: Fetch a single prospect with sessions
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();

    const { data: prospect, error } = await supabase
      .from("prospects")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !prospect) {
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 }
      );
    }

    // Fetch sessions for this prospect
    const { data: sessions } = await supabase
      .from("prospect_sessions")
      .select("*")
      .eq("prospect_id", id)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      prospect,
      sessions: sessions || [],
    });
  } catch (error) {
    console.error("Fetch prospect error:", error);
    return NextResponse.json(
      { error: "Failed to fetch prospect" },
      { status: 500 }
    );
  }
}

// PUT: Update prospect fields
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    // Remove fields that shouldn't be directly updated
    delete updates.id;
    delete updates.created_at;

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("prospects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ prospect: data });
  } catch (error) {
    console.error("Update prospect error:", error);
    return NextResponse.json(
      { error: "Failed to update prospect" },
      { status: 500 }
    );
  }
}
