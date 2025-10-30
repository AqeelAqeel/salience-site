import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
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

    // Create a conversation history string
    const conversationHistory = messages
      .map((msg: any) => `${msg.role}: ${msg.content}`)
      .join("\n\n");

    const analysisPrompt = `Analyze the following conversation and user context to provide psychological and behavioral insights.

User Context:
${userContext || "No explicit context provided"}

Conversation History:
${conversationHistory}

Please provide a detailed analysis in the following format:

1. TONE & STYLE: Describe the user's communication style, tone, and linguistic patterns. Consider formality, emotionality, and expression patterns.

2. DEMOGRAPHICS: Based on language use, topics, and references, what can you infer about the user's likely age range, educational background, and cultural context?

3. EMOTIONAL STATE: Analyze the user's current emotional state and any patterns of emotional expression throughout the conversation.

4. ATTACHMENT PATTERNS: Based on how they discuss relationships and interact, what attachment style patterns do they exhibit? Consider their approach to connection, trust, and emotional vulnerability.

5. INTERESTS: List 3-5 key interests or topics the user seems passionate about.

6. CONCERNS: List 3-5 concerns, worries, or pain points expressed by the user.

7. CORE VALUES: List 3-5 underlying values that seem important to the user based on their communication.

Provide your analysis in a structured JSON format.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert psychologist and behavioral analyst. Provide insightful, empathetic analysis while being respectful and avoiding harmful stereotypes.",
        },
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const analysisText = completion.choices[0]?.message?.content || "{}";
    const analysis = JSON.parse(analysisText);

    // Structure the response
    const structuredAnalysis = {
      tone: analysis.tone_and_style || "Unable to determine communication style",
      demographics: analysis.demographics || "Insufficient data for demographic analysis",
      emotionalState: analysis.emotional_state || "Emotional state unclear from conversation",
      attachmentPatterns: analysis.attachment_patterns || "Attachment patterns not clearly evident",
      interests: analysis.interests || [],
      concerns: analysis.concerns || [],
      values: analysis.core_values || [],
    };

    return NextResponse.json(structuredAnalysis);
  } catch (error) {
    console.error("Analysis API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze conversation" },
      { status: 500 }
    );
  }
}