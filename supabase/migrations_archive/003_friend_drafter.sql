-- ============================================================
-- Friend Drafter — AI email reply cockpit, one per prospect
-- Scoped by prospect_id; prospects.friend_slug is the URL key
-- ============================================================

-- Extend prospects with friend-surface fields
alter table public.prospects
  add column if not exists friend_slug text unique,
  add column if not exists friend_enabled boolean default false,
  add column if not exists friend_headline text default '',
  add column if not exists friend_pitch text default '',
  add column if not exists friend_tone_hints text default '',
  add column if not exists friend_signoff text default '',
  add column if not exists friend_supabase_user_id uuid;

create index if not exists idx_prospects_friend_slug
  on public.prospects(friend_slug) where friend_slug is not null;

-- Gmail tokens per friend. One per (prospect, supabase user).
create table if not exists public.friend_gmail_tokens (
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

create index if not exists idx_friend_tokens_prospect
  on public.friend_gmail_tokens(prospect_id);

-- Threads
create table if not exists public.friend_email_threads (
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

create index if not exists idx_friend_threads_prospect
  on public.friend_email_threads(prospect_id);
create index if not exists idx_friend_threads_status
  on public.friend_email_threads(status);
create index if not exists idx_friend_threads_last_msg
  on public.friend_email_threads(last_message_at desc);

-- Messages
create table if not exists public.friend_email_messages (
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

create index if not exists idx_friend_messages_thread
  on public.friend_email_messages(thread_id);

-- Recipient profiles (people the friend talks to)
create table if not exists public.friend_recipient_profiles (
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

create index if not exists idx_friend_recipients_prospect
  on public.friend_recipient_profiles(prospect_id);

-- AI thread interpretations
create table if not exists public.friend_thread_interpretations (
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

create index if not exists idx_friend_interps_thread
  on public.friend_thread_interpretations(thread_id);

-- Reply drafts
create table if not exists public.friend_reply_drafts (
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

create index if not exists idx_friend_drafts_thread
  on public.friend_reply_drafts(thread_id);

-- Per-friend AI state (observed patterns, style)
create table if not exists public.friend_ai_state (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade unique,
  observed_patterns text[] default '{}',
  communication_style text default '',
  common_tasks text[] default '{}',
  known_priorities text[] default '{}',
  people_map_summary text default '',
  updated_at timestamptz not null default now()
);

-- Update triggers
create trigger friend_gmail_tokens_updated_at
  before update on public.friend_gmail_tokens
  for each row execute function update_updated_at();

create trigger friend_email_threads_updated_at
  before update on public.friend_email_threads
  for each row execute function update_updated_at();

create trigger friend_recipient_profiles_updated_at
  before update on public.friend_recipient_profiles
  for each row execute function update_updated_at();

create trigger friend_reply_drafts_updated_at
  before update on public.friend_reply_drafts
  for each row execute function update_updated_at();

create trigger friend_ai_state_updated_at
  before update on public.friend_ai_state
  for each row execute function update_updated_at();

-- RLS — match existing project pattern (open; server enforces via service role)
alter table public.friend_gmail_tokens enable row level security;
alter table public.friend_email_threads enable row level security;
alter table public.friend_email_messages enable row level security;
alter table public.friend_recipient_profiles enable row level security;
alter table public.friend_thread_interpretations enable row level security;
alter table public.friend_reply_drafts enable row level security;
alter table public.friend_ai_state enable row level security;

create policy "Allow all on friend_gmail_tokens" on public.friend_gmail_tokens for all using (true) with check (true);
create policy "Allow all on friend_email_threads" on public.friend_email_threads for all using (true) with check (true);
create policy "Allow all on friend_email_messages" on public.friend_email_messages for all using (true) with check (true);
create policy "Allow all on friend_recipient_profiles" on public.friend_recipient_profiles for all using (true) with check (true);
create policy "Allow all on friend_thread_interpretations" on public.friend_thread_interpretations for all using (true) with check (true);
create policy "Allow all on friend_reply_drafts" on public.friend_reply_drafts for all using (true) with check (true);
create policy "Allow all on friend_ai_state" on public.friend_ai_state for all using (true) with check (true);
