import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  SUMMARY_EXTRACTION_PROMPT,
  type IntakeTurn,
  type ProspectSummary,
} from "@/lib/types/prospects";

const getOpenAI = () =>
  new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const { turns } = (await request.json()) as { turns: IntakeTurn[] };

    if (!turns || turns.length === 0) {
      return NextResponse.json(
        { error: "No conversation turns provided" },
        { status: 400 }
      );
    }

    const transcript = turns
      .map(
        (t) =>
          `${t.role === "user" ? "Prospect" : "Interviewer"}: ${t.content}`
      )
      .join("\n\n");

    const openai = getOpenAI();

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SUMMARY_EXTRACTION_PROMPT },
        { role: "user", content: transcript },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const raw = response.choices[0]?.message?.content || "{}";

    let summary: ProspectSummary;
    try {
      summary = JSON.parse(raw);
    } catch {
      summary = {
        wantsAiFor: [],
        manualProcesses: [],
        vaWorthyTasks: [],
        businessContext: raw,
        keyInsights: [],
      };
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summary extraction error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
