-- ============================================================
-- Prospect Intake System
-- Generous schema for open-ended prospecting conversations
-- ============================================================

-- Prospects table: the person / company being prospected
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
  company_size text default '',         -- e.g. "5-10", "50-100", "500+"
  annual_revenue text default '',
  business_model text default '',       -- B2B, B2C, hybrid, etc.
  years_in_business text default '',
  location text default '',

  -- CRM / internal notes (YOUR input before they ever talk to the tool)
  crm_notes text default '',            -- raw notes from CRM
  meeting_notes text default '',        -- notes from calls/meetings you've had
  referral_source text default '',      -- how they found you / who referred
  lead_status text default 'new',       -- new, contacted, qualified, proposal, closed, lost
  priority text default 'medium',       -- low, medium, high, urgent
  tags text[] default '{}',             -- flexible tagging

  -- Discovery / needs (populated during or after intake)
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
  qualification_score int default 0,    -- 0-100
  qualification_notes text default '',
  is_qualified boolean default false,

  -- What they've tried before
  previous_ai_attempts text default '',
  previous_vendors text default '',
  what_worked text default '',
  what_didnt_work text default '',

  -- Engagement
  engagement_level text default '',     -- cold, warm, hot
  objections text[] default '{}',
  interests text[] default '{}',

  -- Outcome
  recommended_services text[] default '{}',
  proposed_solutions text default '',
  estimated_value text default '',
  next_steps text default '',
  follow_up_date timestamptz,

  -- Metadata
  created_by text default '',           -- your user_id / operator
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_prospects_company on public.prospects(company_name);
create index idx_prospects_status on public.prospects(lead_status);
create index idx_prospects_priority on public.prospects(priority);
create index idx_prospects_created on public.prospects(created_at desc);
create index idx_prospects_qualified on public.prospects(is_qualified);

-- Prospect intake sessions: each conversation / interview
create table public.prospect_sessions (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,

  -- Session metadata
  session_type text default 'intake',   -- intake, follow_up, demo, check_in
  title text default 'Intake Interview',
  status text default 'active',         -- active, completed, abandoned

  -- Access (no auth — use a shareable token)
  access_token text unique default encode(gen_random_bytes(16), 'hex'),

  -- Summary (generated after conversation)
  summary_json jsonb default null,      -- ProspectSummary structure
  summary_text text default '',         -- plain-text summary for sharing

  -- Metadata
  duration_seconds int default 0,
  turn_count int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_prospect_sessions_prospect on public.prospect_sessions(prospect_id);
create index idx_prospect_sessions_token on public.prospect_sessions(access_token);
create index idx_prospect_sessions_status on public.prospect_sessions(status);

-- Prospect turns: individual messages in the conversation
create table public.prospect_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.prospect_sessions(id) on delete cascade,

  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,

  -- Audio metadata (if from voice)
  was_voice boolean default false,
  audio_duration_ms int default 0,

  -- Extracted data (per-turn extraction for rich messages)
  extracted_topics text[] default '{}',
  sentiment text default '',            -- positive, neutral, negative, mixed

  created_at timestamptz not null default now()
);

create index idx_prospect_turns_session on public.prospect_turns(session_id);
create index idx_prospect_turns_created on public.prospect_turns(created_at);

-- Prospect documents: generated artifacts (summaries, PDFs, etc.)
create table public.prospect_documents (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  session_id uuid references public.prospect_sessions(id) on delete set null,

  doc_type text not null default 'summary',  -- summary, proposal, report
  title text default '',
  content_html text default '',               -- rendered HTML for sharing
  content_text text default '',               -- plain text version
  content_json jsonb default null,            -- structured data

  -- Sharing
  share_token text unique default encode(gen_random_bytes(16), 'hex'),
  is_shared boolean default false,

  created_at timestamptz not null default now()
);

create index idx_prospect_docs_prospect on public.prospect_documents(prospect_id);
create index idx_prospect_docs_share on public.prospect_documents(share_token);

-- Auto-update triggers
create trigger prospects_updated_at
  before update on public.prospects
  for each row execute function update_updated_at();

create trigger prospect_sessions_updated_at
  before update on public.prospect_sessions
  for each row execute function update_updated_at();

-- RLS (open policies — no auth)
alter table public.prospects enable row level security;
alter table public.prospect_sessions enable row level security;
alter table public.prospect_turns enable row level security;
alter table public.prospect_documents enable row level security;

create policy "Allow all on prospects" on public.prospects for all using (true) with check (true);
create policy "Allow all on prospect_sessions" on public.prospect_sessions for all using (true) with check (true);
create policy "Allow all on prospect_turns" on public.prospect_turns for all using (true) with check (true);
create policy "Allow all on prospect_documents" on public.prospect_documents for all using (true) with check (true);
