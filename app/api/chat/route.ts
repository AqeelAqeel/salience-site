import { NextResponse } from "next/server";
import OpenAI from "openai";

// Lazy initialization to avoid build-time errors when OPENAI_API_KEY is not set
const getOpenAI = () => new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages, userContext } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const openai = getOpenAI();

    // Build system prompt with user context
    let systemPrompt = `You are a helpful, empathetic AI assistant focused on understanding and helping the user. 
You should be conversational, warm, and genuinely interested in learning about the user.

When the user shares information about themselves, acknowledge it warmly and ask thoughtful follow-up questions to understand them better. Help them explore their thoughts and feelings.`;

    if (userContext && userContext.trim()) {
      systemPrompt += `\n\nHere's what I know about the user so far:\n${userContext}\n\nUse this context to provide more personalized and relevant responses. Reference previous information they've shared when relevant.`;
    }

    // Convert messages to OpenAI format
    const openAIMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: openAIMessages,
      temperature: 0.7,
      max_tokens: 800,
    });

    const responseContent = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return NextResponse.json({ content: responseContent });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}