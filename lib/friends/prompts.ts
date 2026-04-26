import type { FriendSurface } from "./types";

const INTERPRETATION_SCHEMA = `Return JSON matching this exact shape:
{
  "summary": string,
  "senderIntent": string,
  "requiredAction": string,
  "urgency": "low" | "medium" | "high",
  "shouldReply": boolean,
  "suggestedTone": string,
  "relationshipContext": string,
  "risks": string[],
  "opportunities": string[],
  "draftReply": string
}`;

export function buildInterpretationSystemPrompt(
  friend: FriendSurface,
  learnedStyle?: string,
  learnedSignoff?: string,
  learnedPhrases?: string[]
): string {
  const who = friend.full_name || "the user";

  const toneBlock = friend.friend_tone_hints
    ? `\nSeed tone cues for ${who} (generic guidance):\n${friend.friend_tone_hints}`
    : "";

  const learnedBlock = learnedStyle
    ? `\nObserved writing style from their own recent sent emails (PREFER this over the seed tone cues — this is how they actually write):\n${learnedStyle}`
    : "";

  const phrases = (learnedPhrases ?? []).filter(Boolean);
  const phrasesBlock = phrases.length
    ? `\nPhrases ${who} actually reuses across their sent mail — fold these in verbatim where they fit (don't force them, but prefer them over generic equivalents):\n${phrases.map((p) => `- ${p}`).join("\n")}`
    : "";

  // Specific instructions the user wrote themselves — overrides everything
  // else. Could be "always offer a call when they ask for pricing", "never
  // apologize for delay", "match their formality", etc. Treat as an
  // authoritative override, not as samples.
  const personalizationBlock = friend.friend_personalization_context
    ? `\nSpecific instructions from ${who} (HIGHEST priority — these override the seed tone cues, observed style, and reused phrases above whenever they conflict; follow them literally):\n"""\n${friend.friend_personalization_context}\n"""`
    : "";

  // Adaptive sign-off: if we observed one in their sent mail, use that verbatim.
  // Otherwise fall back to the static seed on the prospects row.
  const effectiveSignoff = learnedSignoff || friend.friend_signoff || "";
  const signoffBlock = effectiveSignoff
    ? `\nSign-off to use at the end of drafts (use this exactly, including any line breaks): ${JSON.stringify(effectiveSignoff)}`
    : "";

  return `You are an AI email strategist analyzing a single email thread for ${who}${friend.company_name ? ` at ${friend.company_name}` : ""}.

Your job is to:
1. Explain what the sender actually wants (plainly, no fluff).
2. Decide whether ${who} needs to reply.
3. Identify the outcome that matters.
4. Surface relevant relationship context.
5. Recommend a tone.
6. Draft a reply in ${who}'s voice.

Rules:
- Be concise, practical, action-oriented.
- Do NOT invent facts. If context is missing, say so in the summary.
- draftReply should be ready to copy-paste into Gmail; address them by first name, keep it short unless the thread calls for more.
- urgency: low = FYI/no action, medium = reply within a few days, high = same-day.${toneBlock}${learnedBlock}${phrasesBlock}${personalizationBlock}${signoffBlock}

${INTERPRETATION_SCHEMA}`;
}

export function buildThreadUserPrompt(args: {
  subject: string;
  participants: string[];
  messages: {
    fromEmail: string;
    fromName: string;
    sentAt: Date | null;
    bodyText: string;
  }[];
}): string {
  const header = [
    `Subject: ${args.subject || "(no subject)"}`,
    `Participants: ${args.participants.join(", ")}`,
    "",
    "=== Thread (oldest first) ===",
  ].join("\n");

  const body = args.messages
    .map((m, i) => {
      const who = m.fromName ? `${m.fromName} <${m.fromEmail}>` : m.fromEmail;
      const when = m.sentAt ? m.sentAt.toISOString() : "unknown time";
      const trimmed = m.bodyText.slice(0, 4000);
      return `--- Message ${i + 1} — ${who} — ${when} ---\n${trimmed}`;
    })
    .join("\n\n");

  return `${header}\n\n${body}`;
}

export const STYLE_EXTRACTION_PROMPT = `Analyze the user's recent sent emails and return a concise description of their writing style: typical length, formality, signature quirks, punctuation habits, greeting/sign-off patterns, vocabulary. Return ONE paragraph, max 5 sentences, no markdown.`;
