-- ============================================================
-- Fresh-Init Migration for a BRAND NEW Supabase / Postgres project
-- Consolidates 001_create_tables + 002_prospect_intake + 003_friend_drafter
--
-- HOW TO USE:
--   1. Open the SQL editor of the NEW Supabase project:
--      https://supabase.com/dashboard/project/jrvwmkgembuqvedynrne/editor
--   2. Paste this entire file.
--   3. Run.
--
-- WARNING: The first statement drops the `public` schema and recreates it.
--          This deletes ALL tables / data / functions / views in `public`.
--          Only run against a fresh or disposable project.
-- ============================================================

-- ------------------------------------------------------------
-- 0. Wipe public schema and restore Supabase default grants
-- ------------------------------------------------------------
drop schema if exists public cascade;
create schema public;

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres, service_role;

alter default privileges in schema public
  grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public
  grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to postgres, anon, authenticated, service_role;

-- ------------------------------------------------------------
-- 1. Extensions + shared helpers
-- ------------------------------------------------------------
create extension if not exists "pgcrypto";

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- 2. Chat sessions / messages / context cards   (was 001)
-- ============================================================

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null default 'New Chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_sessions_user_id on public.sessions(user_id);
create index idx_sessions_updated_at on public.sessions(updated_at desc);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index idx_messages_session_id on public.messages(session_id);
create index idx_messages_created_at on public.messages(created_at);

create table public.context_cards (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  card_index int not null check (card_index >= 0 and card_index <= 2),
  title text not null default '',
  body text not null default '',
  updated_at timestamptz not null default now(),
  unique(session_id, card_index)
);

create index idx_context_cards_session_id on public.context_cards(session_id);

create trigger sessions_updated_at
  before update on public.sessions
  for each row execute function public.update_updated_at();

create trigger context_cards_updated_at
  before update on public.context_cards
  for each row execute function public.update_updated_at();

alter table public.sessions enable row level security;
alter table public.messages enable row level security;
alter table public.context_cards enable row level security;

create policy "Allow all on sessions"       on public.sessions       for all using (true) with check (true);
create policy "Allow all on messages"       on public.messages       for all using (true) with check (true);
create policy "Allow all on context_cards"  on public.context_cards  for all using (true) with check (true);

-- ============================================================
-- 3. Prospect intake system                     (was 002)
-- ============================================================

create table public.prospects (
  id uuid primary key default gen_random_uuid(),

  -- Identity
  full_name text not null default '',
  company_name text not null default '',
  email text default '',
  phone text default '',
  role_title text default '',
  linkedin_url text default '',
  website_url text default '',

  -- Business profile
  industry text default '',
  company_size text default '',
  annual_revenue text default '',
  business_model text default '',
  years_in_business text default '',
  location text default '',

  -- CRM / internal notes
  crm_notes text default '',
  meeting_notes text default '',
  referral_source text default '',
  lead_status text default 'new',
  priority text default 'medium',
  tags text[] default '{}',

  -- Discovery / needs
  current_tech_stack text default '',
  current_ai_tools text default '',
  pain_points text[] default '{}',
  manual_processes text[] default '{}',
  ai_aspirations text[] default '{}',
  va_worthy_tasks text[] default '{}',
  budget_range text default '',
  timeline text default '',
  decision_makers text default '',

  -- Qualification
  qualification_score int default 0,
  qualification_notes text default '',
  is_qualified boolean default false,

  -- Previous attempts
  previous_ai_attempts text default '',
  previous_vendors text default '',
  what_worked text default '',
  what_didnt_work text default '',

  -- Engagement
  engagement_level text default '',
  objections text[] default '{}',
  interests text[] default '{}',

  -- Outcome
  recommended_services text[] default '{}',
  proposed_solutions text default '',
  estimated_value text default '',
  next_steps text default '',
  follow_up_date timestamptz,

  -- Friend Drafter surface (folded in from 003)
  friend_slug text unique,
  friend_enabled boolean default false,
  friend_headline text default '',
  friend_pitch text default '',
  friend_tone_hints text default '',
  friend_signoff text default '',
  friend_supabase_user_id uuid,

  -- Metadata
  created_by text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_prospects_company    on public.prospects(company_name);
create index idx_prospects_status     on public.prospects(lead_status);
create index idx_prospects_priority   on public.prospects(priority);
create index idx_prospects_created    on public.prospects(created_at desc);
create index idx_prospects_qualified  on public.prospects(is_qualified);
create index idx_prospects_friend_slug
  on public.prospects(friend_slug) where friend_slug is not null;

create table public.prospect_sessions (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,

  session_type text default 'intake',
  title text default 'Intake Interview',
  status text default 'active',

  access_token text unique default encode(extensions.gen_random_bytes(16), 'hex'),

  summary_json jsonb default null,
  summary_text text default '',

  duration_seconds int default 0,
  turn_count int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_prospect_sessions_prospect on public.prospect_sessions(prospect_id);
create index idx_prospect_sessions_token    on public.prospect_sessions(access_token);
create index idx_prospect_sessions_status   on public.prospect_sessions(status);

create table public.prospect_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.prospect_sessions(id) on delete cascade,

  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,

  was_voice boolean default false,
  audio_duration_ms int default 0,

  extracted_topics text[] default '{}',
  sentiment text default '',

  created_at timestamptz not null default now()
);

create index idx_prospect_turns_session on public.prospect_turns(session_id);
create index idx_prospect_turns_created on public.prospect_turns(created_at);

create table public.prospect_documents (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  session_id uuid references public.prospect_sessions(id) on delete set null,

  doc_type text not null default 'summary',
  title text default '',
  content_html text default '',
  content_text text default '',
  content_json jsonb default null,

  share_token text unique default encode(extensions.gen_random_bytes(16), 'hex'),
  is_shared boolean default false,

  created_at timestamptz not null default now()
);

create index idx_prospect_docs_prospect on public.prospect_documents(prospect_id);
create index idx_prospect_docs_share    on public.prospect_documents(share_token);

create trigger prospects_updated_at
  before update on public.prospects
  for each row execute function public.update_updated_at();

create trigger prospect_sessions_updated_at
  before update on public.prospect_sessions
  for each row execute function public.update_updated_at();

alter table public.prospects           enable row level security;
alter table public.prospect_sessions   enable row level security;
alter table public.prospect_turns      enable row level security;
alter table public.prospect_documents  enable row level security;

create policy "Allow all on prospects"           on public.prospects           for all using (true) with check (true);
create policy "Allow all on prospect_sessions"   on public.prospect_sessions   for all using (true) with check (true);
create policy "Allow all on prospect_turns"      on public.prospect_turns      for all using (true) with check (true);
create policy "Allow all on prospect_documents"  on public.prospect_documents  for all using (true) with check (true);

-- ============================================================
-- 4. Friend Drafter — AI email reply cockpit     (was 003)
-- ============================================================

create table public.friend_gmail_tokens (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  supabase_user_id uuid not null,
  google_email text default '',
  access_token text not null,
  refresh_token text not null,
  scope text default '',
  expiry_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(prospect_id, supabase_user_id)
);

create index idx_friend_tokens_prospect on public.friend_gmail_tokens(prospect_id);

create table public.friend_email_threads (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  gmail_thread_id text not null,
  subject text default '',
  participants text[] default '{}',
  last_message_at timestamptz,
  snippet text default '',
  status text not null default 'new'
    check (status in ('new','processing','analyzed','needs_reply','done','ignored')),
  priority_score int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(prospect_id, gmail_thread_id)
);

create index idx_friend_threads_prospect on public.friend_email_threads(prospect_id);
create index idx_friend_threads_status   on public.friend_email_threads(status);
create index idx_friend_threads_last_msg on public.friend_email_threads(last_message_at desc);

create table public.friend_email_messages (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  thread_id uuid not null references public.friend_email_threads(id) on delete cascade,
  gmail_message_id text not null,
  from_email text default '',
  from_name text default '',
  to_emails text[] default '{}',
  cc_emails text[] default '{}',
  sent_at timestamptz,
  body_text text default '',
  body_html text default '',
  snippet text default '',
  created_at timestamptz not null default now(),
  unique(prospect_id, gmail_message_id)
);

create index idx_friend_messages_thread on public.friend_email_messages(thread_id);

create table public.friend_recipient_profiles (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  email text not null,
  name text default '',
  company text default '',
  role text default '',
  website text default '',
  linkedin_url text default '',
  social_urls text[] default '{}',
  notes text default '',
  ai_summary text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(prospect_id, email)
);

create index idx_friend_recipients_prospect on public.friend_recipient_profiles(prospect_id);

create table public.friend_thread_interpretations (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  thread_id uuid not null references public.friend_email_threads(id) on delete cascade,
  summary text default '',
  sender_intent text default '',
  required_action text default '',
  urgency text default 'low' check (urgency in ('low','medium','high')),
  relationship_context text default '',
  risks text[] default '{}',
  opportunities text[] default '{}',
  suggested_tone text default '',
  should_reply boolean default false,
  reasoning_summary text default '',
  created_at timestamptz not null default now()
);

create index idx_friend_interps_thread on public.friend_thread_interpretations(thread_id);

create table public.friend_reply_drafts (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  thread_id uuid not null references public.friend_email_threads(id) on delete cascade,
  body text not null default '',
  tone text default '',
  status text default 'generated'
    check (status in ('generated','edited','approved','sent_to_gmail','discarded')),
  version int default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_friend_drafts_thread on public.friend_reply_drafts(thread_id);

create table public.friend_ai_state (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade unique,
  observed_patterns text[] default '{}',
  communication_style text default '',
  common_tasks text[] default '{}',
  known_priorities text[] default '{}',
  people_map_summary text default '',
  updated_at timestamptz not null default now()
);

create trigger friend_gmail_tokens_updated_at
  before update on public.friend_gmail_tokens
  for each row execute function public.update_updated_at();

create trigger friend_email_threads_updated_at
  before update on public.friend_email_threads
  for each row execute function public.update_updated_at();

create trigger friend_recipient_profiles_updated_at
  before update on public.friend_recipient_profiles
  for each row execute function public.update_updated_at();

create trigger friend_reply_drafts_updated_at
  before update on public.friend_reply_drafts
  for each row execute function public.update_updated_at();

create trigger friend_ai_state_updated_at
  before update on public.friend_ai_state
  for each row execute function public.update_updated_at();

alter table public.friend_gmail_tokens            enable row level security;
alter table public.friend_email_threads           enable row level security;
alter table public.friend_email_messages          enable row level security;
alter table public.friend_recipient_profiles      enable row level security;
alter table public.friend_thread_interpretations  enable row level security;
alter table public.friend_reply_drafts            enable row level security;
alter table public.friend_ai_state                enable row level security;

create policy "Allow all on friend_gmail_tokens"            on public.friend_gmail_tokens            for all using (true) with check (true);
create policy "Allow all on friend_email_threads"           on public.friend_email_threads           for all using (true) with check (true);
create policy "Allow all on friend_email_messages"          on public.friend_email_messages          for all using (true) with check (true);
create policy "Allow all on friend_recipient_profiles"      on public.friend_recipient_profiles      for all using (true) with check (true);
create policy "Allow all on friend_thread_interpretations"  on public.friend_thread_interpretations  for all using (true) with check (true);
create policy "Allow all on friend_reply_drafts"            on public.friend_reply_drafts            for all using (true) with check (true);
create policy "Allow all on friend_ai_state"                on public.friend_ai_state                for all using (true) with check (true);
