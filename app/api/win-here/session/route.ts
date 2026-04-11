import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// POST — Create a new "how do i win here" session.
// This is a public, unauthenticated endpoint. We create a stub prospect row
// (which will get enriched by tool calls as the conversation unfolds) and a
// paired prospect_session row with session_type='win_here' so these lands
// land cleanly in the existing CRM pipeline alongside intake sessions.
export async function POST() {
  try {
    let supabase;
    try {
      supabase = getSupabase();
    } catch {
      // If Supabase isn't configured, let the client operate ephemerally.
      // The chat route also degrades gracefully.
      return NextResponse.json({
        prospectId: null,
        sessionId: null,
        ephemeral: true,
      });
    }

    // Create the stub prospect — mostly empty, will be populated by tool calls
    const { data: prospect, error: prospectErr } = await supabase
      .from("prospects")
      .insert({
        full_name: "",
        company_name: "",
        lead_status: "new",
        priority: "medium",
        tags: ["win-here"],
        referral_source: "how-do-i-win-here",
      })
      .select()
      .single();

    if (prospectErr || !prospect) {
      console.error("Failed to create win-here prospect:", prospectErr);
      return NextResponse.json({
        prospectId: null,
        sessionId: null,
        ephemeral: true,
      });
    }

    const { data: session, error: sessionErr } = await supabase
      .from("prospect_sessions")
      .insert({
        prospect_id: prospect.id,
        session_type: "win_here",
        title: "How do I get my time and energy back?",
        status: "active",
      })
      .select()
      .single();

    if (sessionErr || !session) {
      console.error("Failed to create win-here session:", sessionErr);
      return NextResponse.json({
        prospectId: prospect.id,
        sessionId: null,
        ephemeral: true,
      });
    }

    return NextResponse.json({
      prospectId: prospect.id,
      sessionId: session.id,
      ephemeral: false,
    });
  } catch (error) {
    console.error("win-here session error:", error);
    return NextResponse.json({
      prospectId: null,
      sessionId: null,
      ephemeral: true,
    });
  }
}
