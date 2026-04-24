# Claudepad

Session memory for salience-site. New summaries go at the top of **Session Summaries**. When a 21st is added, the oldest moves to `oldpad.md`. **Key Findings** persists permanently.

---

## Session Summaries

### 2026-04-24 07:50 UTC — Wired up Friends voice extraction

- Bug report: Cordwell signed into `/friends/test-slug` with his own Google account (cordwell@gmail.com) and saw the sync complete successfully (40 threads / 7 pending) but all drafts were written in the generic "Test Friend" seed voice, not his.
- Root cause: the voice-learning feature was scaffolded but never wired. `extractStyleSummary()` in `lib/friends/ai.ts` had no callers, `friend_ai_state` was only ever read (never written), and the `user_state_updated` stream event was declared but never emitted. `buildInterpretationSystemPrompt()` only used the static `friend_tone_hints` from the prospect row.
- Fix (four files):
  - `lib/friends/gmail.ts` — added `fetchSentBodies(token, { maxMessages })` that lists `in:sent` and returns decoded bodies (≤4 KB each).
  - `lib/friends/ai.ts` — `interpretThread()` accepts optional `learnedStyle` and threads it into the prompt builder.
  - `lib/friends/prompts.ts` — `buildInterpretationSystemPrompt()` accepts `learnedStyle`, injects it after the seed tone hints with instructions to prefer it.
  - `lib/friends/sync.ts` — at the top of `runSync()`, before the thread loop: fetches up to 20 sent emails, extracts style, upserts `friend_ai_state` (onConflict `prospect_id`), emits `user_state_updated`, then passes `learnedStyle` into every `interpretThread()` call. Failure is non-fatal — sync continues with seed cues.
- Verified: `npm install` + `npm run build` clean (one pre-existing Next.js workspace-root warning unrelated to this change).
- No test added. Repo has no test infrastructure (no jest/vitest in deps, no `test` script in package.json). Aqeel's convention per global CLAUDE.md wants a test per fix — flagged in the commit message for follow-up.
- Data note: the `test-slug` prospect row has `friend_signoff = "— A"` (Aqeel's placeholder). Cordwell should update that row if he wants drafts signed in his own initials.

### 2026-04-24 07:47 UTC — Pulled `6ebb572`, refreshed docs for Friends cockpit

- `git pull --ff-only` from `origin/main`: brought in two commits from Aqeel dated 2026-04-23 adding the `/friends/[slug]` AI email cockpit (`72b18f9`) plus `/privacy` + `/terms` pages and OAuth hardening (`6ebb572`). +3947 lines / 32 files.
- Schema consolidated: `001_create_tables.sql`, `002_prospect_intake.sql`, and a new `003_friend_drafter.sql` were moved to `supabase/migrations_archive/`; replaced by a single fresh-init migration `20260423000000_fresh_init.sql` which **drops and recreates the `public` schema**. Adds friend-surface fields to `prospects` and seven new `friend_*` tables.
- `.env.example` rewritten: renamed `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; added `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_SECRET_SUPABASE_SERVICE_ROLE_KEY`, `NEXT_SECRET_SUPABASE_SECRET_KEY`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`. Three keys still not documented: `NEXT_NORTHMODELLABS_API_KEY`, `NEXT_FIRECRAWL_API_KEY`, `NEXT_XAI_API_KEY`.
- Friends flow verified by reading `lib/friends/{types,ai,gmail,sync}.ts`, `app/friends/[slug]/page.tsx`, `lib/supabase-server.ts`, and the 5 new API routes. AI provider is OpenAI `gpt-4o-mini` with strict `json_schema` response. Gmail token refresh is done directly against `oauth2.googleapis.com`, not delegated to Supabase Auth.
- New Claude Code skill at `.claude/skills/friend-new-prospect/SKILL.md` — walks the user through provisioning a new friend row; its mention of `003_friend_drafter.sql` is slightly stale.
- `ARCHITECTURE.md` and `claudepad.md` both fully rewritten to reflect current state.

### 2026-04-24 06:34 UTC — Onboarding audit + docs seeded

- Cordwell is joining his friend Aqeel Ali on this project and asked for a full codebase walkthrough.
- Mapped the repo: three AI demo products at the time (Charton Financial on Anthropic; Prospects voice intake on OpenAI + LiveKit + Atlas; Win-Here on OpenAI gpt-5.4-mini with function calling), ~22 API routes, Supabase schema across two migrations, Next.js 16/React 19/Tailwind v4.
- Verified model IDs by reading the actual route handlers (charton: `claude-sonnet-4-20250514`; prospects chat/summary: `gpt-4o`; win-here: `gpt-5.4-mini-2026-03-17`; orphan routes: `gpt-4-turbo-preview`).
- Wrote `ARCHITECTURE.md` (route map, API catalog, schema, integrations, env vars, drift list).
- Seeded this `claudepad.md`.
- Saved project memory flagging that README.md + CLAUDE.md are stale and should not be trusted for scope.
- No code changes — exploration and docs only.

---

## Key Findings

*Permanent discoveries. These stay.*

### Scope & authoritative docs
- The repo's README.md and root CLAUDE.md both describe "a modern landing page." Both are badly stale. Trust `ARCHITECTURE.md` instead, or read the route tree directly.
- Project owner is **Aqeel Ali** (founding partner). Team is static in `lib/team.ts`: Aqeel, Jackson Harris, Danara Buvaeva, George Mazur.

### Four AI products, not one
- **Charton Financial** (`/charton-financial`) — dual-mode page. "intake" mounts Prospects voice flow (Atlas avatar). "chat" is Claude Sonnet 4 with three editable context cards. Toggle top-right.
- **Prospects voice intake** — component family in `components/prospects/`, but `IntakeConversation` is **only mounted under `/charton-financial`**. No `/prospects` route exists despite the directory name.
- **Win-Here** — embedded twice: `MiniChat` on the home page and `WinHereChatView` at `/i-want-my-time-and-energy-back`. Both post to `/api/win-here/*`. Model is `gpt-5.4-mini-2026-03-17`.
- **Friends AI email cockpit** (`/friends/[slug]`) — per-prospect hidden URL. Google sign-in → Gmail sync → `gpt-4o-mini` interprets each thread → drafts a reply in the prospect's voice → drafts pushed to Gmail (not auto-sent). Writes drafts are held behind human review. `robots: noindex`. Not linked from navbar.

### Model and provider split
- **Anthropic** (Claude Sonnet 4) powers Charton admin chat only.
- **OpenAI** powers everything else: `gpt-4o` for Prospects, `gpt-5.4-mini-2026-03-17` for Win-Here (reasoning-era: `max_completion_tokens`, no custom temperature), Whisper + TTS for voice, `gpt-4o-mini` with strict JSON schema for Friends thread interpretation AND for user-voice extraction, `gpt-4-turbo-preview` for four orphan routes.
- Win-Here uses **Jina Reader** (`https://r.jina.ai/{url}`, unauthenticated, 8 KB cap) for server-side site canvassing.
- **Gmail API** via `googleapis` is runtime, not just scripts — Friends cockpit calls it for both inbox and sent-mail reads.

### Env vars — things to know when onboarding a dev
- `.env.example` documents the OpenAI, Anthropic, Supabase (4 keys!), and Google OAuth vars.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` was previously named `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` — local env files predating 2026-04-23 need the rename.
- Three integration keys remain undocumented: `NEXT_NORTHMODELLABS_API_KEY` (Atlas avatar, runtime), `NEXT_FIRECRAWL_API_KEY` (scripts), `NEXT_XAI_API_KEY` (scripts).
- Friends cockpit requires both: `NEXT_SECRET_SUPABASE_SERVICE_ROLE_KEY` (server-only, never ship to client) and `GOOGLE_OAUTH_CLIENT_ID`/`SECRET` that mirror the Supabase Google provider credentials (so the server can refresh expired Gmail tokens without re-prompting).

### Supabase
- Single authoritative migration: `supabase/migrations/20260423000000_fresh_init.sql`. **It drops and recreates the `public` schema** — destructive; only run against fresh/disposable DBs. Consolidates three prior migrations (now in `supabase/migrations_archive/`).
- Browser uses publishable key via `lib/supabase.ts`. Server — **specifically `/api/friends/*` only** — uses service role via `lib/supabase-server.ts` (cached client).
- RLS is enabled but fully open (`for all using (true) with check (true)`) on every table. Security lives in the keys, not the policies.
- 14 tables total: `sessions`, `messages`, `context_cards`, `prospects` (wide + friend-surface fields), `prospect_sessions`, `prospect_turns`, `prospect_documents`, `friend_gmail_tokens`, `friend_email_threads`, `friend_email_messages`, `friend_recipient_profiles`, `friend_thread_interpretations`, `friend_reply_drafts`, `friend_ai_state`.
- Win-Here persistence is intentionally silent-fail: Supabase errors are caught; chat continues without storing turns.

### Friends cockpit specifics
- A "friend" is just a `prospects` row with `friend_enabled=true` and the `friend_*` fields populated. Claude Code skill `.claude/skills/friend-new-prospect/SKILL.md` provisions one via `insert ... on conflict (friend_slug) do update`.
- `friend_headline` uses `*asterisk*` wrapping for italic-amber accent words. `friend_tone_hints` is second-person voice guidance for the AI ("write like Jamie: short, direct, no fluff"). Treated as generic seed — overridden by learned style once the user signs in and syncs (see next point).
- **Voice extraction is wired**: `runSync()` pulls the user's 20 most recent `in:sent` emails, runs `extractStyleSummary()` (gpt-4o-mini), upserts `friend_ai_state.communication_style`, and passes the result into every `interpretThread()` call so drafts mirror the user's actual writing, not the seed. Non-fatal on failure.
- Sync flow is SSE-streamed: `/api/friends/[slug]/stream` emits `sync_started → user_state_updated → email_loaded → analysis_started → analysis_completed → draft_created → sync_completed` (or `error`). Default 40 threads, query `in:inbox -category:promotions -category:social`.
- Thread statuses: `new | processing | analyzed | needs_reply | done | ignored`.
- Draft statuses: `generated | edited | approved | sent_to_gmail | discarded`. Drafts are pushed to Gmail via `gmail.users.drafts.create` — not auto-sent.
- Gmail token refresh is a direct POST to `oauth2.googleapis.com/token` in `lib/friends/gmail.ts:refreshIfNeeded`, using the GOOGLE_OAUTH_* env vars. This is why those are duplicated from the Supabase dashboard config.
- Friends layout uses fonts Instrument Serif + Geist + Geist Mono, dedicated CSS at `app/friends/friends.css`, and `robots: noindex`. Completely distinct chrome from marketing.
- **Draft duplication on resync is a known open issue**: `runSync` always `insert`s into `friend_reply_drafts` with no dedup; hitting resync N times produces N drafts per thread. Not fixed here — flagged for Aqeel.

### Orphan routes (no shipped caller)
- `/api/chat` and `/api/analyze` — no live page. Candidates for deletion.
- `/api/analyze-messages` and `/api/generate-response` — used only by `/skeleton-filled-closet/chat-analysis`.

### Chrome drift
- `components/navbar.tsx` — used on home, services, products, team, referrals, `/i-want-my-time-and-energy-back`, `/charton-financial`. The default marketing chrome.
- `components/header.tsx` — legacy; only on four skeleton-filled-closet pages (cognition-conductor, cross-the-bridge, heavens-gate, scaling-negligience).
- `/friends/[slug]` and `/privacy`, `/terms` have **no navbar or header** — standalone.

### Business positioning
- **Insurance is the flagship vertical** across the marketing site. `/services` features it full-width; `/services/insurance` has exclusive components (`components/insurance/*`: `word-orbit`, `client-flow`, `salient-hub`) and Grok-generated infographics in `/public/insurance/infographics/`.
- `/services/*` and `/products/*` describe the same automations with slightly different framing. Likely consolidation target.
- Contact info hardcoded: phone `+14087180712`, email `aqeel@aqeelali.com`, Calendly `calendly.com/aqeelali/aa-30`. No central config.

### System prompts worth reading before editing
- `lib/types/win-here.ts` — most carefully voice-crafted prompt in the repo (explicit Belfort/Hormozi sales-craft section, masculine-grounded tone, reaction-before-analysis pattern).
- `lib/types/prospects.ts` — structured four-phase intake arc (rapport → discovery → color/qualify → book).
- `lib/types/charton.ts` — templated with three user-editable context cards.
- `lib/friends/prompts.ts` — `buildInterpretationSystemPrompt(friend, learnedStyle)` + `buildThreadUserPrompt`; shapes the Gmail thread analysis. Learned-style block is instructed to take precedence over the seed tone cues.

### No test infrastructure yet
- Repo has no jest/vitest in dependencies and no `test` script in package.json. Aqeel's global convention per `~/CLAUDE.md` calls for a test per fix, but setting up a framework is out of scope for one-off pushes. Flag new fixes' test gaps in commit messages until the infra lands.
