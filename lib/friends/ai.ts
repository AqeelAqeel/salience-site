import OpenAI from "openai";
import type {
  AIThreadInterpretation,
  FriendSurface,
  Urgency,
} from "./types";
import {
  buildInterpretationSystemPrompt,
  buildThreadUserPrompt,
} from "./prompts";

let cached: OpenAI | null = null;
function openai(): OpenAI {
  if (cached) return cached;
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not set");
  cached = new OpenAI({ apiKey: key });
  return cached;
}

const INTERPRETATION_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "summary",
    "senderIntent",
    "requiredAction",
    "urgency",
    "shouldReply",
    "suggestedTone",
    "relationshipContext",
    "risks",
    "opportunities",
    "draftReply",
  ],
  properties: {
    summary: { type: "string" },
    senderIntent: { type: "string" },
    requiredAction: { type: "string" },
    urgency: { type: "string", enum: ["low", "medium", "high"] },
    shouldReply: { type: "boolean" },
    suggestedTone: { type: "string" },
    relationshipContext: { type: "string" },
    risks: { type: "array", items: { type: "string" } },
    opportunities: { type: "array", items: { type: "string" } },
    draftReply: { type: "string" },
  },
} as const;

export async function interpretThread(args: {
  friend: FriendSurface;
  learnedStyle?: string;
  subject: string;
  participants: string[];
  messages: {
    fromEmail: string;
    fromName: string;
    sentAt: Date | null;
    bodyText: string;
  }[];
}): Promise<AIThreadInterpretation> {
  const client = openai();
  const system = buildInterpretationSystemPrompt(args.friend, args.learnedStyle);
  const user = buildThreadUserPrompt({
    subject: args.subject,
    participants: args.participants,
    messages: args.messages,
  });

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "thread_interpretation",
        strict: true,
        schema: INTERPRETATION_JSON_SCHEMA,
      },
    },
  });

  const raw = res.choices[0]?.message?.content;
  if (!raw) throw new Error("OpenAI returned empty content");
  const parsed = JSON.parse(raw);
  return {
    summary: String(parsed.summary ?? ""),
    senderIntent: String(parsed.senderIntent ?? ""),
    requiredAction: String(parsed.requiredAction ?? ""),
    urgency: (parsed.urgency as Urgency) ?? "low",
    shouldReply: Boolean(parsed.shouldReply),
    suggestedTone: String(parsed.suggestedTone ?? ""),
    relationshipContext: String(parsed.relationshipContext ?? ""),
    risks: Array.isArray(parsed.risks) ? parsed.risks.map(String) : [],
    opportunities: Array.isArray(parsed.opportunities)
      ? parsed.opportunities.map(String)
      : [],
    draftReply: String(parsed.draftReply ?? ""),
  };
}

export async function extractStyleSummary(sentBodies: string[]): Promise<string> {
  if (!sentBodies.length) return "";
  const client = openai();
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "Analyze the user's sent emails and return ONE paragraph (max 5 sentences) describing their writing style: typical length, formality, quirks, sign-offs, vocabulary. No markdown.",
      },
      {
        role: "user",
        content: sentBodies.slice(0, 20).join("\n\n---\n\n").slice(0, 12000),
      },
    ],
  });
  return res.choices[0]?.message?.content?.trim() ?? "";
}
