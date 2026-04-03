import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getSupabase } from "@/lib/supabase";
import { assembleIntakePrompt } from "@/lib/types/prospects";
import type { IntakeTurn, Prospect } from "@/lib/types/prospects";

const getOpenAI = () =>
  new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        error: "OpenAI API key not configured",
      });
    }

    const { message, history, prospectId, sessionId } = (await request.json()) as {
      message: string;
      history: IntakeTurn[];
      prospectId?: string;
      sessionId?: string;
    };

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    let supabase;
    try { supabase = getSupabase(); } catch { supabase = null; }
    let prospect: Partial<Prospect> | null = null;

    // Load prospect context if available
    if (prospectId && supabase) {
      try {
        const { data } = await supabase
          .from("prospects")
          .select("*")
          .eq("id", prospectId)
          .single();
        prospect = data;
      } catch {
        // Supabase not available, continue without context
      }
    }

    // Build system prompt with prospect context
    const systemPrompt = assembleIntakePrompt(prospect);

    const openai = getOpenAI();

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((turn) => ({
        role: turn.role as "user" | "assistant",
        content: turn.content,
      })),
      { role: "user", content: message },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 300,
      temperature: 0.8,
    });

    const content =
      response.choices[0]?.message?.content ||
      "Could you repeat that?";

    // Persist turns to Supabase if session exists (non-blocking)
    if (sessionId && supabase) {
      try {
        await supabase.from("prospect_turns").insert({
          session_id: sessionId,
          role: "user",
          content: message,
          was_voice: true,
        });
        await supabase.from("prospect_turns").insert({
          session_id: sessionId,
          role: "assistant",
          content,
        });
        const { count } = await supabase
          .from("prospect_turns")
          .select("*", { count: "exact", head: true })
          .eq("session_id", sessionId);
        await supabase
          .from("prospect_sessions")
          .update({ turn_count: count || 0 })
          .eq("id", sessionId);
      } catch (dbErr) {
        console.error("Non-critical: failed to persist turns:", dbErr);
      }
    }

    return NextResponse.json({
      content,
      turnId: response.id,
    });
  } catch (error) {
    console.error("Prospect chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
