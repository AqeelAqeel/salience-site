export type ThreadStatus =
  | "new"
  | "processing"
  | "analyzed"
  | "needs_reply"
  | "done"
  | "ignored";

export type Urgency = "low" | "medium" | "high";

export type DraftStatus =
  | "generated"
  | "edited"
  | "approved"
  | "sent_to_gmail"
  | "discarded";

export interface FriendSurface {
  id: string;
  friend_slug: string;
  full_name: string;
  company_name: string;
  email: string;
  role_title: string;
  friend_enabled: boolean;
  friend_headline: string;
  friend_pitch: string;
  friend_tone_hints: string;
  friend_signoff: string;
  friend_personalization_context: string;
  friend_supabase_user_id: string | null;
}

export interface FriendGmailToken {
  id: string;
  prospect_id: string;
  supabase_user_id: string;
  google_email: string;
  access_token: string;
  refresh_token: string;
  scope: string;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface FriendEmailThread {
  id: string;
  prospect_id: string;
  gmail_thread_id: string;
  subject: string;
  participants: string[];
  last_message_at: string | null;
  snippet: string;
  status: ThreadStatus;
  priority_score: number;
  created_at: string;
  updated_at: string;
}

export interface FriendEmailMessage {
  id: string;
  prospect_id: string;
  thread_id: string;
  gmail_message_id: string;
  from_email: string;
  from_name: string;
  to_emails: string[];
  cc_emails: string[];
  sent_at: string | null;
  body_text: string;
  body_html: string;
  snippet: string;
  created_at: string;
}

export interface FriendRecipientProfile {
  id: string;
  prospect_id: string;
  email: string;
  name: string;
  company: string;
  role: string;
  website: string;
  linkedin_url: string;
  social_urls: string[];
  notes: string;
  ai_summary: string;
  created_at: string;
  updated_at: string;
}

export interface FriendThreadInterpretation {
  id: string;
  prospect_id: string;
  thread_id: string;
  summary: string;
  sender_intent: string;
  required_action: string;
  urgency: Urgency;
  relationship_context: string;
  risks: string[];
  opportunities: string[];
  suggested_tone: string;
  should_reply: boolean;
  reasoning_summary: string;
  created_at: string;
}

export interface FriendReplyDraft {
  id: string;
  prospect_id: string;
  thread_id: string;
  body: string;
  tone: string;
  status: DraftStatus;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface FriendAIState {
  id: string;
  prospect_id: string;
  observed_patterns: string[];
  communication_style: string;
  common_tasks: string[];
  known_priorities: string[];
  people_map_summary: string;
  updated_at: string;
}

export interface CockpitSnapshot {
  friend: FriendSurface;
  threads: FriendEmailThread[];
  interpretations: Record<string, FriendThreadInterpretation>;
  drafts: Record<string, FriendReplyDraft[]>;
  recipients: Record<string, FriendRecipientProfile>;
  aiState: FriendAIState | null;
  connectedGoogleEmail: string | null;
  lastSyncedAt: string | null;
}

export type StreamEvent =
  | { type: "sync_started"; totalEstimate: number }
  | { type: "email_loaded"; threadId: string; subject: string }
  | { type: "analysis_started"; threadId: string }
  | { type: "analysis_completed"; threadId: string; interpretationId: string }
  | { type: "draft_created"; threadId: string; draftId: string }
  | { type: "user_state_updated"; aiStateId: string }
  | { type: "sync_completed"; threadCount: number }
  | { type: "error"; message: string };

export interface AIThreadInterpretation {
  summary: string;
  senderIntent: string;
  requiredAction: string;
  urgency: Urgency;
  shouldReply: boolean;
  suggestedTone: string;
  relationshipContext: string;
  risks: string[];
  opportunities: string[];
  draftReply: string;
}
