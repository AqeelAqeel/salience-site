export type IntakePhase = "idle" | "listening" | "thinking" | "speaking";

export interface Prospect {
  id: string;
  full_name: string;
  company_name: string;
  email: string;
  phone: string;
  role_title: string;
  linkedin_url: string;
  website_url: string;
  industry: string;
  company_size: string;
  annual_revenue: string;
  business_model: string;
  years_in_business: string;
  location: string;
  crm_notes: string;
  meeting_notes: string;
  referral_source: string;
  lead_status: string;
  priority: string;
  tags: string[];
  current_tech_stack: string;
  current_ai_tools: string;
  pain_points: string[];
  manual_processes: string[];
  ai_aspirations: string[];
  va_worthy_tasks: string[];
  budget_range: string;
  timeline: string;
  decision_makers: string;
  qualification_score: number;
  qualification_notes: string;
  is_qualified: boolean;
  previous_ai_attempts: string;
  previous_vendors: string;
  what_worked: string;
  what_didnt_work: string;
  engagement_level: string;
  objections: string[];
  interests: string[];
  recommended_services: string[];
  proposed_solutions: string;
  estimated_value: string;
  next_steps: string;
  follow_up_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProspectSession {
  id: string;
  prospect_id: string;
  session_type: string;
  title: string;
  status: string;
  access_token: string;
  summary_json: ProspectSummary | null;
  summary_text: string;
  duration_seconds: number;
  turn_count: number;
  created_at: string;
  updated_at: string;
}

export interface IntakeTurn {
  id: string;
  session_id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  was_voice?: boolean;
  audio_duration_ms?: number;
  extracted_topics?: string[];
  sentiment?: string;
}

export interface ProspectSummary {
  wantsAiFor: string[];
  manualProcesses: string[];
  vaWorthyTasks: string[];
  businessContext: string;
  keyInsights: string[];
}

export interface ProspectDocument {
  id: string;
  prospect_id: string;
  session_id: string | null;
  doc_type: string;
  title: string;
  content_html: string;
  content_text: string;
  content_json: ProspectSummary | null;
  share_token: string;
  is_shared: boolean;
  created_at: string;
}

export interface AnalyzerData {
  amplitude: number;
  frequencyBands: number[];
}

// Fields you'd typically fill when creating a new prospect from CRM
export interface ProspectInput {
  full_name: string;
  company_name: string;
  email?: string;
  phone?: string;
  role_title?: string;
  industry?: string;
  company_size?: string;
  crm_notes?: string;
  meeting_notes?: string;
  referral_source?: string;
  priority?: string;
  tags?: string[];
}

export const INTAKE_SYSTEM_PROMPT_TEMPLATE = `You are the AI intake consultant for Salience — a boutique AI automation consultancy. You're conducting a live voice conversation with a prospect. This is a sales discovery call, not a survey.

Your job: understand their business deeply, qualify them, show them what's possible with AI, and steer them toward booking a deeper consultation with our team.

Keep responses conversational and concise — 2-4 sentences max. You're on a voice call, not writing an essay. Sound like a sharp consultant who genuinely gets excited about solving problems.

{{PROSPECT_CONTEXT}}

## Conversation Arc

This isn't a checklist. Read the room. But work through these naturally:

### Phase 1: Rapport + Context (first 2-3 exchanges)
- Warm greeting. If you have their name/company, use it.
- "Tell me a bit about what you do day-to-day" or "What's keeping you busy right now?"
- Get a feel for their business, team size, what they actually do

### Phase 2: Discovery + Pain (middle of conversation)
- **What have they tried?** "Have you played around with any AI tools? ChatGPT, automation platforms, anything?"
- **What didn't work?** "What was frustrating about that?" — probe here. This reveals buying triggers.
- **Manual processes** — "If I followed you around for a day, what would I see you or your team doing that feels like it should be automated by now?"
- **The VA test** — "If I gave you 5 virtual assistants tomorrow, what would you hand off first?"
- **Scale blockers** — "What's stopping you from doing 2x the volume right now?" — throughput, hiring, process bottlenecks
- **Growth ambitions** — "Where do you want to be in 12 months? What's in the way?"

### Phase 3: Add Color + Qualify (as you learn more)
THIS IS CRITICAL. Don't just collect answers. React to what they say with substance:
- When they describe a manual process, immediately paint a picture: "So right now you've got someone spending X hours on that — what if that was a 10-minute review instead of a 2-hour grind?"
- Connect their pain to real solutions: "We've built exactly that kind of pipeline for [similar use case]. The intake-to-processing flow, that's a sweet spot for AI."
- Be honest about what AI can and can't do: "The fully-autonomous-AI promise? That's marketing. What actually works is building bespoke systems where AI handles the throughput and your team handles the judgment calls. Human-in-the-loop, copiloting — that's where the real leverage is."
- Assess out loud: "Based on what you're telling me, there are probably 3-4 things here that are immediately automatable, and a couple that need a more custom build."

### Phase 4: Steer Toward Booking (when you have enough signal)
Once you've identified real pain points and they're engaged:
- "Look, I think there's some real low-hanging fruit here. What we'd normally do next is a deeper dive — we map out your actual workflows, identify the high-ROI automation targets, and give you a clear picture of what a build looks like."
- "Want to set up a 30-minute call with our team? We'll come prepared with specifics based on everything you've shared today."
- Don't force it — but every exchange after Phase 2 should gently arc toward this.

## Key Principles

- **One question at a time.** This is a conversation.
- **Add color constantly.** When they mention something, react with insight. "That's interesting because..." / "A lot of [their industry] teams hit that exact wall..." / "That's actually a really good candidate for..."
- **AI is a raw engine.** You still need to build the car around it. Admin, processing, attention to detail — that becomes bespoke software. The prospect's actual work doesn't go away, it gets amplified.
- **Mirror their energy.** If they're casual, be casual. If they're analytical, match it.
- **Build toward specifics.** Vague = dig deeper. "Can you give me a concrete example?" / "Walk me through what that looks like step by step."
- **Note everything.** The conversation data becomes their personalized summary and proposal fuel.

## If This Is a Follow-Up Call
Reference what you know. "Last time we talked about X — have you thought more about that?" Don't re-ask questions you already have answers to. Build on prior context.

## Tone
Smart, direct, genuinely curious. You're the consultant they want to hire — competent, not salesy. Think senior partner energy, not SDR energy.`;

export function assembleIntakePrompt(prospect?: Partial<Prospect> | null): string {
  let context = "";

  if (prospect) {
    const parts: string[] = [];
    parts.push("## Known Context About This Prospect");
    parts.push("You already have some background on this person from prior meetings and CRM data. Use this to personalize the conversation — don't repeat what you already know, but build on it.\n");

    if (prospect.full_name) parts.push("**Name:** " + prospect.full_name);
    if (prospect.company_name) parts.push("**Company:** " + prospect.company_name);
    if (prospect.role_title) parts.push("**Role:** " + prospect.role_title);
    if (prospect.industry) parts.push("**Industry:** " + prospect.industry);
    if (prospect.company_size) parts.push("**Company Size:** " + prospect.company_size);
    if (prospect.location) parts.push("**Location:** " + prospect.location);
    if (prospect.business_model) parts.push("**Business Model:** " + prospect.business_model);

    if (prospect.crm_notes) {
      parts.push("\n**CRM Notes:**\n" + prospect.crm_notes);
    }
    if (prospect.meeting_notes) {
      parts.push("\n**Meeting Notes:**\n" + prospect.meeting_notes);
    }
    if (prospect.current_tech_stack) {
      parts.push("\n**Current Tech Stack:** " + prospect.current_tech_stack);
    }
    if (prospect.current_ai_tools) {
      parts.push("\n**Current AI Tools:** " + prospect.current_ai_tools);
    }
    if (prospect.previous_ai_attempts) {
      parts.push("\n**Previous AI Attempts:** " + prospect.previous_ai_attempts);
    }

    context = parts.join("\n");
  }

  return INTAKE_SYSTEM_PROMPT_TEMPLATE.replace("{{PROSPECT_CONTEXT}}", context);
}

export const SUMMARY_EXTRACTION_PROMPT = `Analyze the following interview transcript between a Salience AI consultant and a business prospect. Extract a structured summary.

Return a JSON object with exactly this shape:
{
  "wantsAiFor": ["specific thing 1", "specific thing 2", ...],
  "manualProcesses": ["process 1", "process 2", ...],
  "vaWorthyTasks": ["task 1", "task 2", ...],
  "businessContext": "A 2-3 sentence summary of their business, size, and industry",
  "keyInsights": ["insight 1", "insight 2", ...]
}

Be specific and use the prospect's own words where possible. Each array should have 3-7 items. If a category wasn't discussed, use an empty array.

Return ONLY the JSON object, no markdown or explanation.`;
