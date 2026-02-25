import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabase } from "@/lib/supabase";
import { assembleSystemPrompt } from "@/lib/types/charton";

const getAnthropic = () =>
  new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

export async function POST(request: Request) {
  try {
    const { sessionId, message, contextCards, messageHistory } =
      await request.json();

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: "sessionId and message are required" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Anthropic API key not configured" },
        { status: 500 }
      );
    }

    const supabase = getSupabase();
    const anthropic = getAnthropic();

    // Store user message
    const { error: userMsgError } = await supabase.from("messages").insert({
      session_id: sessionId,
      role: "user",
      content: message,
    });

    if (userMsgError) {
      console.error("Error storing user message:", userMsgError);
    }

    // Build system prompt from context cards
    const cards = (contextCards || []).map(
      (c: { title: string; body: string }) => ({
        title: c.title || "",
        body: c.body || "",
      })
    );
    const systemPrompt = assembleSystemPrompt(cards);

    // Build message history for Anthropic
    const messages = [
      ...(messageHistory || []).map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    // Call Anthropic Claude
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const text =
      response.content[0].type === "text"
        ? response.content[0].text
        : "I'm sorry, I couldn't generate a response.";

    // Store assistant response
    const { data: assistantMsg, error: assistantMsgError } = await supabase
      .from("messages")
      .insert({
        session_id: sessionId,
        role: "assistant",
        content: text,
      })
      .select()
      .single();

    if (assistantMsgError) {
      console.error("Error storing assistant message:", assistantMsgError);
    }

    // Update session title from first message
    if (messageHistory?.length === 0) {
      const title =
        message.length > 50 ? message.substring(0, 50) + "..." : message;
      await supabase
        .from("sessions")
        .update({ title })
        .eq("id", sessionId);
    }

    return NextResponse.json({
      content: text,
      messageId: assistantMsg?.id,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
