# Data Model

All friend-cockpit tables live in the same Supabase `public` schema as the
existing prospects/sessions tables. The schema is consolidated in
`supabase/migrations/20260423000000_fresh_init.sql`.

## Identity

```
prospects
  ├── id                          uuid pk
  ├── full_name, company_name, email, role_title, ...
  ├── friend_slug                 text unique (NULL for non-friend prospects)
  ├── friend_enabled              boolean — gates the slug
  ├── friend_headline             text — hero copy ("Hey Jamie — *thing*")
  ├── friend_pitch                text — subhead
  ├── friend_tone_hints           text — voice guidance for the AI
  ├── friend_signoff              text — sign-off the AI uses in drafts
  ├── friend_personalization_context  text — friend's pasted writing samples;
                                        injected into the drafter prompt as
                                        the strongest voice signal
                                        (editable from the cockpit's left
                                        panel via PATCH /api/friends/{slug}/context)
  └── friend_supabase_user_id     uuid — first signed-in Supabase user
                                        (NOT YET enforced as the unique
                                        owner — see security.md)
```

A prospect becomes a "friend" when `friend_slug` is set + `friend_enabled` is
true. The reverse — disabling a slug — leaves all the cockpit data intact;
re-enabling restores the URL.

## Auth tokens

```
friend_gmail_tokens
  ├── id                  uuid pk
  ├── prospect_id         fk → prospects(id) ON DELETE CASCADE
  ├── supabase_user_id    uuid — auth.users.id of the signed-in browser
  ├── google_email        text — the Google account they signed in with
  ├── access_token        text — short-lived (1hr); refreshed in-place
  ├── refresh_token       text — long-lived; never re-fetched
  ├── scope               text
  ├── expiry_date         timestamptz
  ├── created_at, updated_at
  └── UNIQUE (prospect_id, supabase_user_id)
```

**Invariant we'd *like* to enforce but don't:** exactly one row per
`prospect_id`. Today multiple Supabase users can each sign in at the same
slug and each get their own token row, but the cockpit reads thread data by
`prospect_id` not `(prospect_id, supabase_user_id)`. This is the data tenancy
issue — see [`security.md`](./security.md).

## Email content

```
friend_email_threads
  ├── id                 uuid pk
  ├── prospect_id        fk → prospects(id) cascade
  ├── gmail_thread_id    text
  ├── subject, participants[], snippet
  ├── last_message_at    timestamptz
  ├── status             text check (new|processing|analyzed|needs_reply|done|ignored)
  ├── priority_score     int (0–100, derived from urgency)
  └── UNIQUE (prospect_id, gmail_thread_id)

friend_email_messages
  ├── id                 uuid pk
  ├── prospect_id, thread_id (fks, cascade)
  ├── gmail_message_id   text
  ├── from_email, from_name, to_emails[], cc_emails[]
  ├── sent_at            timestamptz
  ├── body_text, body_html, snippet
  └── UNIQUE (prospect_id, gmail_message_id)
```

## AI artifacts

```
friend_thread_interpretations
  ├── id, prospect_id, thread_id (fks)
  ├── summary                  text — 2–4 sentences
  ├── sender_intent            text
  ├── required_action          text
  ├── urgency                  low | medium | high
  ├── relationship_context     text
  ├── risks                    text[]
  ├── opportunities            text[]
  ├── suggested_tone           text
  ├── should_reply             boolean
  └── reasoning_summary        text — currently empty, reserved

friend_reply_drafts
  ├── id, prospect_id, thread_id (fks)
  ├── body                     text — what the user edits
  ├── tone                     text — copied from interpretation
  ├── status                   generated | edited | approved | sent_to_gmail | discarded
  ├── version                  int — incremented when AI regenerates
  └── timestamps

friend_recipient_profiles
  ├── id, prospect_id (fk)
  ├── email                    text — the unique key
  ├── name, company, role      text
  ├── website, linkedin_url, social_urls[]
  ├── notes                    text — operator can write
  ├── ai_summary               text — Phase 3 fills this
  └── UNIQUE (prospect_id, email)

friend_ai_state
  ├── id, prospect_id (fk, UNIQUE — exactly one row per prospect)
  ├── observed_patterns        text[] — Phase 3
  ├── communication_style      text — Phase 3 (extracted from sent mail)
  ├── common_tasks             text[]
  ├── known_priorities         text[]
  └── people_map_summary       text
```

## Cardinality

```
prospects 1 ─── 0..1 friend_ai_state
          1 ─── 0..N friend_email_threads
                              ├─ 1..N friend_email_messages
                              ├─ 0..1 friend_thread_interpretations
                              └─ 0..N friend_reply_drafts (versioned)
          1 ─── 0..N friend_recipient_profiles
          1 ─── 0..N friend_gmail_tokens (should be 0..1 — see security.md)
```

## Indexes

```
prospects(friend_slug) WHERE friend_slug IS NOT NULL   — slug lookup
friend_email_threads(prospect_id)                       — list by prospect
friend_email_threads(status)                            — filter pending
friend_email_threads(last_message_at desc)              — sort newest
friend_email_messages(thread_id)                        — assemble thread
friend_recipient_profiles(prospect_id)                  — sidebar people list
friend_thread_interpretations(thread_id)                — join on read
friend_reply_drafts(thread_id)                          — list drafts
friend_gmail_tokens(prospect_id)                        — token lookup
```

## RLS

All `friend_*` tables have RLS enabled with **`USING (true) WITH CHECK
(true)`** policies — i.e. wide open. This matches the existing project
pattern. Server-side enforcement uses the `service_role` key, which bypasses
RLS. **The browser never gets the service-role key**; client-side Supabase
calls use the publishable key and would be subject to RLS — but currently
there's no client-side Supabase data access in the cockpit (everything goes
through our `/api/friends/*` server routes).

This is fine *as long as* server routes verify the caller. They don't yet —
that's the tenancy gap.

## What this model assumes (and where it'll bend)

- **One person per slug.** Today, anyone with the link can sign in *as* that
  slug and pollute its data. Phase 2 binds the slug to a single Supabase
  user_id.
- **No multi-mailbox per friend.** If Jamie wants to triage two Gmail
  accounts, today they'd need two slugs. Phase 3 could allow N tokens per
  prospect.
- **No history beyond latest sync.** We re-upsert threads on each sync. If a
  thread is deleted in Gmail, it lingers in our DB forever. A "purge stale
  threads" pass would be a Phase 3 cleanup.
- **No raw-mail backups.** We store `body_text` + `body_html` once per
  message. Long-term storage of mail bodies has compliance implications;
  Phase 4 might shift to "fetch on demand, cache only summaries".
