export interface Session {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface ContextCard {
  id: string;
  session_id: string;
  card_index: number;
  title: string;
  body: string;
  updated_at: string;
}

export const DEFAULT_CARDS: { title: string; body: string }[] = [
  {
    title: "About Your Business",
    body: "Describe your financial services business, its size, and primary services...",
  },
  {
    title: "Key Challenges & Nuances",
    body: "What specific operational challenges or unique aspects of your business should we know about...",
  },
  {
    title: "Goals & Preferences",
    body: "What are your priorities for AI automation? What does success look like for you...",
  },
];

export const SYSTEM_PROMPT_TEMPLATE = `You are an expert AI automation consultant at Salience, specializing in financial services. You've just had a sales discovery call with a prospect and you have context from their meeting notes and profile.

Your role is to help this prospect understand how AI automations could specifically benefit their financial services business. Be specific, practical, and reference their actual business context.

## Prospect Context

**{{card_0_title}}**
{{card_0_body}}

**{{card_1_title}}**
{{card_1_body}}

**{{card_2_title}}**
{{card_2_body}}

## Guidelines
- Be specific to financial services (insurance, wealth management, banking, lending, etc.)
- Reference the prospect's specific business context from the cards above
- Suggest concrete automation opportunities with estimated impact
- Address compliance and data security concerns proactively
- Be conversational but professional
- When discussing AI solutions, be honest about capabilities and limitations
- Guide them toward understanding the value proposition of working with Salience`;

export const PRESET_QUESTIONS = [
  "What are ways I could get the most value out of AI in my business?",
  "How do I assess and put a price tag on operations or tasks, and create an evaluation rubric for things that add value to my business?",
  "What can I build myself or use out-of-the-box versus what needs custom AI automation?",
  "What should I start looking at around me to identify what's eligible or worth planning for AI automations?",
  "What could I offer a third-party AI automations developer team?",
];

export function assembleSystemPrompt(
  cards: { title: string; body: string }[]
): string {
  let prompt = SYSTEM_PROMPT_TEMPLATE;
  for (let i = 0; i < 3; i++) {
    const card = cards[i] || { title: "", body: "" };
    prompt = prompt.replace(`{{card_${i}_title}}`, card.title);
    prompt = prompt.replace(`{{card_${i}_body}}`, card.body);
  }
  return prompt;
}
