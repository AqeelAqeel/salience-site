# Architecture

## One-paragraph summary

A friend visits `/friends/{slug}`. Server component looks up `prospects` by
`friend_slug` and renders a sign-in hero. Client signs them in with Google
through Supabase Auth (with `gmail.readonly` + `access_type=offline`). Client
posts the resulting `provider_token` + `provider_refresh_token` to
`/api/friends/{slug}/link-tokens`, which writes them to
`friend_gmail_tokens` keyed by `(prospect_id, supabase_user_id)`. Client opens
an SSE connection to `/api/friends/{slug}/stream`. The server fetches ~40 Gmail
threads, upserts threads + messages + recipient profiles, calls OpenAI per
thread for a structured interpretation + draft, persists each, and emits a
typed event to the stream. Client mutates a Zustand-shaped state and renders
thread cards live.

## High-level diagram

```
┌──────────────────────────┐                       ┌───────────────────────┐
│ Browser (friend)         │                       │ Google OAuth          │
│                          │ ─ sign in ──────────▶ │ (consent screen)      │
│ /friends/{slug}          │ ◀───────── tokens ─── │                       │
└──────┬───────────────────┘                       └───────────────────────┘
       │
       │ POST /link-tokens (provider_token, provider_refresh_token)
       │
       ▼
┌──────────────────────────┐                       ┌───────────────────────┐
│ Next.js API routes       │                       │ Supabase Postgres     │
│ (Vercel Fluid Compute)   │ ◀────── upsert ────▶ │  prospects             │
│                          │                       │  friend_gmail_tokens   │
│  link-tokens             │                       │  friend_email_threads  │
│  stream  (SSE)           │                       │  friend_email_messages │
│  snapshot                │                       │  friend_recipient_*    │
│  drafts/{id}             │                       │  friend_thread_interp* │
│  threads/{id}/status     │                       │  friend_reply_drafts   │
└──────┬───────────────────┘                       │  friend_ai_state       │
       │                                           └───────────────────────┘
       │ refresh access token via Google's
       │ /token endpoint when expired
       │
       │ users.threads.list + users.threads.get      ┌───────────────────────┐
       ├────────────────────────────────────────────▶│ Gmail API             │
       │                                             └───────────────────────┘
       │
       │ chat.completions.create (json_schema)       ┌───────────────────────┐
       ├────────────────────────────────────────────▶│ OpenAI (gpt-4o-mini)  │
       │                                             └───────────────────────┘
       ▼
   SSE events to browser:
   sync_started → email_loaded* → analysis_started → analysis_completed
   → draft_created → sync_completed
```

## Voice grounding (personalization context)

The friend can paste writing samples and "phrases I use / phrases I don't"
into the cockpit's left panel. Saved via `PATCH
/api/friends/{slug}/context`, persisted to
`prospects.friend_personalization_context`. On every interpretation call,
`buildInterpretationSystemPrompt` injects this verbatim as the **strongest
voice signal** — stronger than `friend_tone_hints` (operator-authored) or
the fallback default. Loop: paste samples → resync → drafts sound more like
the friend.

## Sync pipeline (`lib/friends/sync.ts`)

1. `runSync({ friend, token, emit })` is invoked from the SSE route.
2. Emits `sync_started` with estimated total.
3. `fetchRecentThreads(token, { maxThreads: 40 })`:
   - Refreshes the Google access token if expired (calls Google's `/token`
     endpoint with the stored refresh token + GCP client_id/secret; persists
     new access token + expiry).
   - `gmail.users.threads.list` with `q: "in:inbox -category:promotions
     -category:social"`.
   - For each thread id, `gmail.users.threads.get(format=full)`, decode body
     parts, normalize to `NormalizedThread`.
4. For each normalized thread:
   - Upsert `friend_email_threads` (status `processing`); emit `email_loaded`.
   - Bulk upsert `friend_email_messages`.
   - Upsert minimal `friend_recipient_profiles` (just email + name).
   - Emit `analysis_started`.
   - `interpretThread()` calls OpenAI with `response_format: json_schema`
     using the strict `INTERPRETATION_JSON_SCHEMA`. Returns
     `AIThreadInterpretation`.
   - Insert `friend_thread_interpretations`; update thread status to
     `needs_reply` (if `shouldReply`) or `analyzed`. Set `priority_score` from
     urgency.
   - Emit `analysis_completed`.
   - If `shouldReply` and `draftReply` non-empty: insert
     `friend_reply_drafts` (version 1, status `generated`); emit
     `draft_created`.
5. Emit `sync_completed { threadCount }`.

## SSE transport quirks

- **Heartbeat.** A `: ping\n\n` comment fires every 15s. Vercel's edge proxy
  closes idle streams; OpenAI calls regularly take 5–15s per thread, so
  without a heartbeat the connection drops before the first `analysis_*`
  event lands and the client renders "connection lost".
- **Errors as events, not HTTP codes.** All preflight failures (missing env,
  no friend, no token) return an SSE body with a single
  `{ type: "error", message }` event so the client's `onmessage` shows a
  human message instead of an opaque connection close.
- **Final flush.** A 50ms timeout before `controller.close()` lets the buffer
  drain so the final event reaches the client.

## Auth model (Phase 2A)

- Supabase handles the Google OAuth handshake. The client passes extra options:
  - `scopes: "https://www.googleapis.com/auth/gmail.readonly"`
  - `queryParams: { access_type: "offline", prompt: "consent" }` (forces a
    refresh token on every consent)
  - `redirectTo: "{origin}/friends/{slug}?just_signed_in=1"`
- After redirect, `onAuthStateChange("SIGNED_IN")` fires. The Cockpit posts
  the session's `provider_token` + `provider_refresh_token` to
  `/api/friends/{slug}/link-tokens` with `Authorization: Bearer
  {supabase_access_token}`.
- **link-tokens** verifies the JWT and:
  - If `prospects.friend_supabase_user_id` is null → claim it for the
    signing-in user (this slug is now bound to them).
  - If set + matches → refresh tokens in place.
  - If set + doesn't match → 403, and the Cockpit shows a "this cockpit is
    bound to a different account" screen.
- **Every other API route** uses `requireFriendOwner(req, slug)`
  (`lib/friends/auth.ts`):
  - Extract Bearer token from `Authorization` header, or — for the SSE
    stream, since `EventSource` can't set headers — from
    `?access_token=`.
  - Verify with Supabase `auth.getUser(token)`.
  - Ensure the verified user_id matches `prospects.friend_supabase_user_id`.
  - Otherwise return a typed failure (`401`, `403`, `404`, `409` for
    unclaimed).
- **SSR doesn't preload the snapshot.** `app/friends/[slug]/page.tsx`
  fetches only the friend's *public-facing* metadata (`friend_headline`,
  `friend_pitch`, `friend_tone_hints`, `friend_signoff`,
  `friend_personalization_context` — all operator-authored marketing copy,
  not email content). The Cockpit fetches the real snapshot from
  `/api/friends/{slug}/snapshot` after auth + ownership confirmed.
- **Why the query-param fallback for SSE?** EventSource has no API to set
  request headers. The token is short-lived (1h), travels over HTTPS in
  prod, and is scoped to a single slug. URL logging is the residual risk —
  acceptable for this surface; revisit if we move to a logging-heavy
  environment.

## Server runtime

- All `/api/friends/...` routes run on Node.js (`export const runtime =
  "nodejs"`) — Edge runtime can't use `googleapis` and we want full Node
  compatibility on Fluid Compute.
- `maxDuration = 300` on the stream route — Vercel allows 300s on all plans.
- Service-role Supabase client is server-only (`lib/supabase-server.ts`,
  cached, persistSession off).

## Persistence model

- `prospects` is the people table — one row per real person you're tracking.
  When `friend_slug` is set + `friend_enabled=true`, that row also acts as the
  cockpit identity.
- All friend-cockpit tables (`friend_*`) FK to `prospects.id`. Cascade delete:
  retiring a prospect wipes their cockpit data.
- `friend_gmail_tokens.refresh_token` is the only secret stored. It's
  unencrypted at rest in Phase 1; Postgres column-level encryption with
  pgcrypto is a Phase 2 hardening item.

## Frontend state shape

`CockpitSnapshot` is the wire format. It denormalizes interpretations and
drafts into maps keyed by `thread_id` so the UI can render with one DB
round-trip per page load. SSE events mutate the same shape progressively.

## What is *not* in the architecture (yet)

- Background queue. Sync runs inline in the SSE handler. If a friend's mailbox
  is huge or OpenAI gets slow, we lean on the 15s heartbeat + 300s function
  cap. Phase 3 work would move sync to Vercel Queues or Inngest.
- Recipient enrichment. We capture `email` + `name` only; LinkedIn, company
  inference, etc. is documented in the schema (`friend_recipient_profiles`
  has those columns) but unwired.
- Pattern extraction across sent mail. `friend_ai_state` exists but no job
  populates it yet.
- Gmail send / `gmail.compose` scope. The push-to-drafts endpoint expects it
  but we currently only request `gmail.readonly`.
