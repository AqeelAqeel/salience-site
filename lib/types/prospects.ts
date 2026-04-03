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

export const INTAKE_SYSTEM_PROMPT_TEMPLATE = `You are a warm, professional AI intake interviewer for Salience — an AI automation consultancy that helps businesses identify and implement AI solutions.

Your goal is to understand the prospect's business and identify where AI could create the most value for them. You are conducting a live voice interview, so keep your responses conversational, concise (2-4 sentences max per response), and natural.

{{PROSPECT_CONTEXT}}

## Interview Flow

Guide the conversation through these topics naturally (don't read from a script — let it flow):

1. **Business Overview** — What does their business do? How big is their team? What industry?
2. **Daily Operations** — Walk me through a typical day. What takes up most of your time?
3. **Manual Processes** — What tasks are you or your team still doing by hand that feel repetitive or tedious?
4. **AI Aspirations** — When you think "I wish AI could do this for me," what comes to mind?
5. **VA/Admin Tasks** — If you could hire an unlimited number of virtual assistants, what would you have them do?
6. **Pain Points** — What's the biggest bottleneck in your operations right now?
7. **Previous Attempts** — Have you tried any AI tools or automations before? What worked, what didn't?

## Guidelines
- Ask ONE question at a time — this is a conversation, not a form
- Acknowledge what they said before moving on ("That's interesting — so you're saying...")
- If they give a vague answer, gently probe deeper ("Can you give me a specific example?")
- Mirror their language and energy level
- Don't pitch solutions yet — just listen and understand
- If they mention something particularly promising for AI automation, note it naturally ("That sounds like exactly the kind of thing we help with")
- Keep track of everything they share — it will be used to generate their personalized summary
- AI is like a raw engine — you need to build a car around it. Emphasize that fully autonomous AI doesn't exist yet, but bespoke solutions with human-in-the-loop, copiloting, and guided automation are real and valuable
- The prospect's actual work matters — admin, processing, attention to detail — these can become custom software solutions
- Gently usher them toward booking a deeper consultation when the time is right

## Tone
Professional but approachable. Like a smart colleague having coffee with them, genuinely curious about their business.`;

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
