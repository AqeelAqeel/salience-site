-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Sessions table
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null default 'New Chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_sessions_user_id on public.sessions(user_id);
create index idx_sessions_updated_at on public.sessions(updated_at desc);

-- Messages table
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index idx_messages_session_id on public.messages(session_id);
create index idx_messages_created_at on public.messages(created_at);

-- Context cards table
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

-- Auto-update updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger sessions_updated_at
  before update on public.sessions
  for each row execute function update_updated_at();

create trigger context_cards_updated_at
  before update on public.context_cards
  for each row execute function update_updated_at();

-- Row Level Security (open policies since no auth)
alter table public.sessions enable row level security;
alter table public.messages enable row level security;
alter table public.context_cards enable row level security;

create policy "Allow all on sessions" on public.sessions for all using (true) with check (true);
create policy "Allow all on messages" on public.messages for all using (true) with check (true);
create policy "Allow all on context_cards" on public.context_cards for all using (true) with check (true);
