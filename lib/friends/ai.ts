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
  learnedSignoff?: string;
  learnedPhrases?: string[];
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
  const system = buildInterpretationSystemPrompt(
    args.friend,
    args.learnedStyle,
    args.learnedSignoff,
    args.learnedPhrases
  );
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

const STYLE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["communicationStyle", "signoff", "commonPhrases"],
  properties: {
    communicationStyle: { type: "string" },
    signoff: { type: "string" },
    commonPhrases: { type: "array", items: { type: "string" } },
  },
} as const;

export interface ExtractedStyle {
  style: string;
  signoff: string;
  commonPhrases: string[];
}

export async function extractStyleSummary(
  sentBodies: string[]
): Promise<ExtractedStyle> {
  if (!sentBodies.length) return { style: "", signoff: "", commonPhrases: [] };
  const client = openai();
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `Analyze the user's own sent emails (these are messages THEY wrote). Return JSON:

- communicationStyle: ONE paragraph (max 5 sentences) describing how they write — typical length, formality, punctuation habits, vocabulary quirks, opening patterns, how they structure thoughts. Plain prose, no markdown.
- signoff: the EXACT text they most consistently use to sign off at the end of their emails. Capture it verbatim including line breaks (e.g. "— R", "Best,\\nRobert", "Cheers,\\nBob", "Thanks,\\nR"). If no consistent pattern emerges, return an empty string.
- commonPhrases: an array of 6–12 SHORT (≤8 words) phrases / openers / connectors / closers the user actually uses across multiple emails. Capture them verbatim, in their casing — these are reused turns of phrase, not a description of them. Examples of what to capture: "circling back on", "happy to jump on a call", "lmk what works", "thanks!". Skip phrases that appear in only one email. Empty array if nothing repeats meaningfully.

Base this on patterns ACROSS the samples — ignore one-off messages. If the emails are mostly forwards/auto-replies/too short to read a style, return short strings or empty arrays rather than guessing.`,
      },
      {
        role: "user",
        content: sentBodies.slice(0, 30).join("\n\n---\n\n").slice(0, 16000),
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "style_summary",
        strict: true,
        schema: STYLE_SCHEMA,
      },
    },
  });
  const raw = res.choices[0]?.message?.content;
  if (!raw) return { style: "", signoff: "", commonPhrases: [] };
  try {
    const parsed = JSON.parse(raw);
    const phrases = Array.isArray(parsed.commonPhrases)
      ? parsed.commonPhrases.map((p: unknown) => String(p).trim()).filter(Boolean)
      : [];
    return {
      style: String(parsed.communicationStyle ?? "").trim(),
      signoff: String(parsed.signoff ?? "").trim(),
      commonPhrases: phrases,
    };
  } catch {
    return { style: "", signoff: "", commonPhrases: [] };
  }
}
