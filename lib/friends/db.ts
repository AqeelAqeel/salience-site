import { getServerSupabase } from "../supabase-server";
import type {
  CockpitSnapshot,
  FriendAIState,
  FriendEmailThread,
  FriendGmailToken,
  FriendReplyDraft,
  FriendRecipientProfile,
  FriendSurface,
  FriendThreadInterpretation,
} from "./types";

const FRIEND_SURFACE_COLUMNS = `
  id, friend_slug, full_name, company_name, email, role_title,
  friend_enabled, friend_headline, friend_pitch, friend_tone_hints,
  friend_signoff, friend_supabase_user_id
`;

export async function getFriendBySlug(
  slug: string
): Promise<FriendSurface | null> {
  const supa = getServerSupabase();
  const { data, error } = await supa
    .from("prospects")
    .select(FRIEND_SURFACE_COLUMNS)
    .eq("friend_slug", slug)
    .eq("friend_enabled", true)
    .maybeSingle();

  if (error) throw new Error(`getFriendBySlug: ${error.message}`);
  return (data as FriendSurface | null) ?? null;
}

export async function getGmailToken(
  prospectId: string
): Promise<FriendGmailToken | null> {
  const supa = getServerSupabase();
  const { data, error } = await supa
    .from("friend_gmail_tokens")
    .select("*")
    .eq("prospect_id", prospectId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getGmailToken: ${error.message}`);
  return (data as FriendGmailToken | null) ?? null;
}

export async function upsertGmailToken(args: {
  prospectId: string;
  supabaseUserId: string;
  googleEmail: string;
  accessToken: string;
  refreshToken: string;
  scope: string;
  expiryDate: string | null;
}): Promise<FriendGmailToken> {
  const supa = getServerSupabase();
  const { data, error } = await supa
    .from("friend_gmail_tokens")
    .upsert(
      {
        prospect_id: args.prospectId,
        supabase_user_id: args.supabaseUserId,
        google_email: args.googleEmail,
        access_token: args.accessToken,
        refresh_token: args.refreshToken,
        scope: args.scope,
        expiry_date: args.expiryDate,
      },
      { onConflict: "prospect_id,supabase_user_id" }
    )
    .select()
    .single();
  if (error) throw new Error(`upsertGmailToken: ${error.message}`);

  await supa
    .from("prospects")
    .update({ friend_supabase_user_id: args.supabaseUserId })
    .eq("id", args.prospectId);

  return data as FriendGmailToken;
}

export async function getCockpitSnapshot(
  friend: FriendSurface
): Promise<CockpitSnapshot> {
  const supa = getServerSupabase();

  const [threadsRes, interpsRes, draftsRes, recipientsRes, stateRes, tokenRes] =
    await Promise.all([
      supa
        .from("friend_email_threads")
        .select("*")
        .eq("prospect_id", friend.id)
        .order("last_message_at", { ascending: false })
        .limit(100),
      supa
        .from("friend_thread_interpretations")
        .select("*")
        .eq("prospect_id", friend.id),
      supa
        .from("friend_reply_drafts")
        .select("*")
        .eq("prospect_id", friend.id)
        .order("version", { ascending: false }),
      supa
        .from("friend_recipient_profiles")
        .select("*")
        .eq("prospect_id", friend.id),
      supa
        .from("friend_ai_state")
        .select("*")
        .eq("prospect_id", friend.id)
        .maybeSingle(),
      supa
        .from("friend_gmail_tokens")
        .select("google_email, updated_at")
        .eq("prospect_id", friend.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const threads = (threadsRes.data ?? []) as FriendEmailThread[];
  const interpretations: Record<string, FriendThreadInterpretation> = {};
  for (const row of (interpsRes.data ?? []) as FriendThreadInterpretation[]) {
    interpretations[row.thread_id] = row;
  }
  const drafts: Record<string, FriendReplyDraft[]> = {};
  for (const row of (draftsRes.data ?? []) as FriendReplyDraft[]) {
    (drafts[row.thread_id] ??= []).push(row);
  }
  const recipients: Record<string, FriendRecipientProfile> = {};
  for (const row of (recipientsRes.data ?? []) as FriendRecipientProfile[]) {
    recipients[row.email] = row;
  }

  return {
    friend,
    threads,
    interpretations,
    drafts,
    recipients,
    aiState: (stateRes.data as FriendAIState | null) ?? null,
    connectedGoogleEmail:
      (tokenRes.data as { google_email: string } | null)?.google_email ?? null,
    lastSyncedAt:
      (tokenRes.data as { updated_at: string } | null)?.updated_at ?? null,
  };
}
