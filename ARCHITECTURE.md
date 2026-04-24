# Salience — Architecture

Authoritative map of the salience-site repo. Treat this as source of truth when README/CLAUDE.md disagree.

## What this is

Marketing + live-AI-demo site for **Salience**, an AI automation consultancy (founding partner: Aqeel Ali). It is not just a landing page. It is a Next.js 16 app with:

- A marketing surface (home, per-vertical services, per-vertical products, team, referrals, privacy, terms)
- Four live AI demo products (Charton Financial, Prospects voice intake, Win-Here, Friends AI email cockpit)
- A Supabase backend (one consolidated fresh-init migration; 14 tables across chat/prospects/friends)
- Integrations with Anthropic, OpenAI, LiveKit, Atlas (northmodellabs) avatar, and Gmail via Google OAuth

Insurance is the **flagship vertical** across marketing: featured first in services, custom visual components, exclusive infographics. The Friends cockpit is a per-prospect lead-winning tool, gated by slug and not linked from the public nav.

## Tech stack

- **Next.js 16** App Router (`^16.1.3`)
- **React 19**, **TypeScript 5**
- **Tailwind CSS v4** (`@tailwindcss/postcss`) with CSS custom properties; Manrope on marketing, Instrument Serif + Geist + Geist Mono on `/friends`
- **shadcn/ui** primitives under `components/ui/*`
- **Supabase JS** (`@supabase/supabase-js`) — browser client via publishable key; service-role server client at `lib/supabase-server.ts` for the Friends cockpit
- **Anthropic SDK** (`@anthropic-ai/sdk`) — for Charton Financial chat
- **OpenAI SDK** (`openai`) — for Prospects intake, Win-Here, Friends interpretation, and a cluster of orphan routes
- **LiveKit client** (`livekit-client`) — WebRTC transport for avatar audio
- **Atlas React** (`@northmodellabs/atlas-react`) — avatar session renderer
- **googleapis** — used at runtime by `lib/friends/gmail.ts` (threads list / thread get / drafts create) and at build-time by scripts
- **Vercel Analytics** — mounted in root layout
- **Lucide React** icons; `class-variance-authority`, `clsx`, `tailwind-merge` utilities

## Directory layout

```
app/                         # Next.js App Router
  api/                       # Route handlers
    atlas/session/           # Avatar session proxy
    charton-financial/       # Charton chat + cards + sessions
    friends/[slug]/          # Friends cockpit backend (snapshot/stream/link-tokens/drafts/threads)
    prospects/               # Voice intake endpoints
    win-here/                # Win-Here chat + session
    chat, analyze, analyze-messages, generate-response  # orphan routes
  charton-financial/         # Dual-mode AI demo page (intake + admin chat)
  friends/                   # AI email cockpit
    [slug]/                  # Per-friend page + not-found
    layout.tsx               # Dedicated chrome + fonts; robots: noindex
    friends.css              # 267-line cockpit stylesheet
  i-want-my-time-and-energy-back/  # Full-page Win-Here chat
  privacy/                   # Privacy policy (standalone; Google OAuth compliance)
  terms/                     # Terms of service (standalone)
  products/{insurance,healthcare}/
  referrals/
  services/{,insurance,healthcare,real-estate}/
  skeleton-filled-closet/    # Experimental / abandoned pages (7)
  team/{,[slug]}/
  layout.tsx                 # Root layout + metadata + Vercel Analytics
  page.tsx                   # Home (~36K, client component, embeds MiniChat)
  globals.css                # Tailwind v4 + design tokens
  not-found.tsx              # 404
components/
  ui/                        # shadcn primitives
  charton/                   # Charton-specific UI (session sidebar, context cards, etc.)
  friends/                   # Cockpit UI (cockpit, thread-card, sign-in-hero, connection-strip, context-panel)
  insurance/                 # Flagship-vertical visuals (word-orbit, client-flow, salient-hub, art-placeholder)
  prospects/                 # Voice intake UI (orb, avatar, conversation, summary, controls, overlay, CTA)
  win-here/                  # Win-Here chat UI (chat-view, scratchpad, starter-chips)
  navbar.tsx                 # Standard chrome (marketing + most demos)
  header.tsx                 # Alt chrome (only on 4 skeleton-filled-closet pages)
  footer-spotlight.tsx
  lava-lamp.tsx              # Decorative animation
  mini-chat.tsx              # Win-Here chat embedded on home page
  process-section.tsx
  streaming-text.tsx
  terminal.tsx               # Legacy
hooks/
  use-audio-analyzer.ts      # FFT visualizer for voice UI
  use-charton-session.ts     # Charton sessions + context cards + Anthropic chat
  use-intake-session.ts      # Prospects voice intake orchestrator
  use-local-user-id.ts       # localStorage client id
  use-scroll-reveal.ts       # Intersection Observer fade-in
  use-voice-recorder.ts      # MediaRecorder wrapper
lib/
  friends/
    ai.ts                    # OpenAI gpt-4o-mini thread interpretation (strict JSON schema)
    db.ts                    # getFriendBySlug, getCockpitSnapshot
    gmail.ts                 # Gmail threads fetch + body parsing + draft creation + token refresh
    prompts.ts               # buildInterpretationSystemPrompt, buildThreadUserPrompt
    sync.ts                  # runSync() — fetch → upsert → interpret → draft loop with SSE emit
    types.ts                 # All friend_* types + CockpitSnapshot + StreamEvent
  types/
    charton.ts               # Session/Message/ContextCard + system prompt template
    prospects.ts             # Prospect/Session/Turn + intake + summary prompts
    win-here.ts              # Scratchpad + tool schemas + system prompt
  supabase.ts                # getSupabase() — browser client (publishable key)
  supabase-server.ts         # getServerSupabase() — server client (service role key)
  team.ts                    # Static team roster + TeamMember type
  utils.ts                   # cn()
public/
  assets/                    # Logo, favicon, dashboard mockups, team photos
  industries/                # Vertical images for home carousel
  insurance/                 # ASSETS.md + logos/ + infographics/ (Grok-generated)
scripts/
  firecrawl-client.mjs       # Business search/scrape via Firecrawl
  generate-image-assets.mjs  # xAI Grok image gen for insurance infographics
  google-auth-setup.mjs      # Google OAuth helper
  sheets-client.mjs          # Google Sheets client
  friends/seed-test-slug.mjs # Seed a test friend slug
supabase/
  migrations/
    20260423000000_fresh_init.sql  # Current authoritative schema (wipes + recreates public)
  migrations_archive/
    001_create_tables.sql          # Historical; do not run
    002_prospect_intake.sql        # Historical
    003_friend_drafter.sql         # Historical
.claude/
  skills/
    friend-new-prospect/SKILL.md   # Claude Code skill for provisioning a new /friends/[slug]
```

## Route map

### Marketing (public)

| Route | Purpose | Chrome |
|---|---|---|
| `/` | Home — hero, industry carousel, gauges, WordOrbit blocks, embedded MiniChat (Win-Here) | Navbar |
| `/services` | Vertical picker; Insurance featured full-width, Healthcare + Real Estate below | Navbar |
| `/services/insurance` | Flagship: Quote / Renew / Retain flows, WordOrbit + ClientFlow + SalientHub | Navbar |
| `/services/healthcare` | Healthcare services detail | Navbar |
| `/services/real-estate` | Real estate services detail | Navbar |
| `/products/insurance` | Feature+benefit deep-dive for insurance | Navbar |
| `/products/healthcare` | Feature+benefit deep-dive for healthcare | Navbar |
| `/team` | Roster; alternating L/R card layout | Navbar |
| `/team/[slug]` | Individual profile (bio, socials, Calendly) | Navbar |
| `/referrals` | Partner-facing referral guide; SMS-first CTA | Navbar |

### Legal (standalone, no navbar)

| Route | Purpose |
|---|---|
| `/privacy` | Privacy policy — required for Google OAuth / Gmail access; cites `/friends` flow |
| `/terms` | Terms of service — required alongside privacy for OAuth consent screen |

### Interactive demos

| Route | Purpose | Chrome |
|---|---|---|
| `/i-want-my-time-and-energy-back` | Full-page **Win-Here** chat (GPT-5.4-mini with tools) | Navbar |
| `/charton-financial` | **Dual-mode** demo: "intake" = IntakeConversation (Atlas avatar + voice); "chat" = admin context-card chat with Claude. Toggle top-right. | Navbar |
| `/friends/[slug]` | **AI email cockpit** — per-prospect landing page; Google OAuth sign-in, Gmail sync, AI-drafted replies. `robots: noindex`. Unknown or `friend_enabled=false` slugs 404. | Own (no navbar) |

### Experimental (skeleton-filled-closet)

| Route | Status | Chrome |
|---|---|---|
| `/skeleton-filled-closet/chat-analysis` | Functional; calls `/api/analyze-messages` + `/api/generate-response`; localStorage only | (own) |
| `/skeleton-filled-closet/thesis` | Long static explainer | (own) |
| `/skeleton-filled-closet/cognition-conductor` | Static/decorative | Header |
| `/skeleton-filled-closet/cognition-covenance` | Stubbed skeleton | (own) |
| `/skeleton-filled-closet/cross-the-bridge` | Static placeholder | Header |
| `/skeleton-filled-closet/heavens-gate` | Duplicate of cross-the-bridge | Header |
| `/skeleton-filled-closet/scaling-negligience` | Static/decorative | Header |

## AI demo products

### 1. Charton Financial — `/charton-financial`

**Modes.** Top-right toggle switches between:

- **Intake mode** (default): mounts `components/prospects/intake-conversation.tsx`, which runs the full voice intake flow with the Atlas avatar. Uses `useIntakeSession()`, hits `/api/prospects/*` and `/api/atlas/*`. This is the only route where the Prospects voice intake surface is actually mounted, despite the directory name.
- **Chat mode**: admin-style surface with session sidebar, editable **context cards** (3 slots), system-prompt viewer, preset questions, and chat interface. Uses `useChartonSession()` → `/api/charton-financial/chat` with **Claude Sonnet 4** (`claude-sonnet-4-20250514`, 1024 max tokens). Context cards are debounce-saved via `/api/charton-financial/cards` and injected into the system prompt at request time.

**Types + prompts**: `lib/types/charton.ts` — `Session`, `Message`, `ContextCard`, `SYSTEM_PROMPT_TEMPLATE`, `PRESET_QUESTIONS`, `assembleSystemPrompt()`.

**Tables**: `sessions`, `messages`, `context_cards`.

### 2. Prospects voice intake — (component, embedded in Charton)

**Hook**: `hooks/use-intake-session.ts`.

**Phase FSM**: `idle | listening | thinking | speaking`.

**Data flow**:
1. User taps orb → `useVoiceRecorder` begins capture via MediaRecorder
2. `useAudioAnalyzer` feeds FFT data to `ProspectIntakeOrb` for pulsing visual
3. Audio blob → `POST /api/prospects/transcribe` (OpenAI Whisper / gpt-4o)
4. First turn creates prospect + session (`POST /api/prospects/sessions`)
5. Transcribed turn → `POST /api/prospects/chat` (OpenAI gpt-4o) with `assembleIntakePrompt(prospect)` from `lib/types/prospects.ts`
6. Assistant reply → `POST /api/prospects/synthesize` (OpenAI `/audio/speech`) for TTS
7. Audio is published into the Atlas avatar via `AvatarSessionHandle.publishAudio()` over LiveKit
8. `POST /api/prospects/summary` extracts a structured `ProspectSummary` at wrap-up
9. `POST /api/prospects/documents` renders a shareable HTML/PDF summary

**Atlas session**:
- `POST /api/atlas/session` proxies to `https://api.atlasv1.com/v1/realtime/session` with `Authorization: Bearer NEXT_NORTHMODELLABS_API_KEY`. Returns `session_id`, `livekit_url`, `token` for the React client to join the WebRTC room.
- `DELETE /api/atlas/session/[id]` tears the session down.

**Tables**: `prospects`, `prospect_sessions`, `prospect_turns`, `prospect_documents`. Access via per-session `access_token` hex, not user auth.

### 3. Win-Here — `/i-want-my-time-and-energy-back` + MiniChat on `/`

**Routing surface**:
- `/i-want-my-time-and-energy-back` renders `components/win-here/chat-view.tsx` full-page
- The home page embeds `components/mini-chat.tsx`, which posts to the same `/api/win-here/*` endpoints

**Model**: OpenAI `gpt-5.4-mini-2026-03-17` with function calling. Uses `max_completion_tokens` (not `max_tokens`) and no custom temperature — reasoning-era model constraints.

**Tool loop** (max 4 rounds before forcing final response):
- `set_website(url, display_name)`
- `canvass_website(url)` — **Jina Reader** (`https://r.jina.ai/{url}`), 8KB cap
- `record_domain_assessment(domain_expertise, recent_signals[])`
- `record_pains(items[], acuteness: low|medium|high)`
- `record_preferred_work(items[])`
- `propose_starters(starters[])` — 3–4 domain-specific quick-reply chips
- `assess_readiness(verdict: exploring|warming|ready, rationale)` — `ready` reveals the Aqeel CTA in the UI

**Persistence**: non-blocking. Turns → `prospect_turns` with `session_type='win_here'`, scratchpad fields mirrored to `prospects`. Supabase failures are caught and logged; chat continues without storing.

**Types + prompt**: `lib/types/win-here.ts` — `WIN_HERE_TOOLS`, `WIN_HERE_SYSTEM_PROMPT`, `assembleWinHereSystemPrompt(scratchpad)`. Voice-crafted prompt with Belfort/Hormozi sales-craft section; handle edits with care.

### 4. Friends — `/friends/[slug]` (AI email cockpit)

**Purpose.** A personalized landing page built for one specific person Aqeel wants to win. They open `/friends/<their-name>`, sign in with Google, and the cockpit pulls their recent Gmail threads, analyzes each one with AI, and drafts replies in their voice. Pitch: "a friend built you a thing."

**Route.** `/friends/[slug]/page.tsx` is a server component. It looks up the friend via `getFriendBySlug(slug)` and bails to `not-found` if `friend_enabled=false`. It fetches an initial `CockpitSnapshot` via `getCockpitSnapshot(friend)` and passes it into the `<Cockpit>` client component along with the Supabase browser-side config. The `/friends/layout.tsx` sets dedicated fonts (Instrument Serif + Geist + Geist Mono) and `robots: { index: false, follow: false }`. No navbar.

**Provisioning a friend.** Configuration lives on the `prospects` table. A "friend" is a prospect row with `friend_enabled=true` and the friend-surface fields populated: `friend_slug`, `friend_headline` (accent words wrapped `*in asterisks*` render in the amber accent), `friend_pitch`, `friend_tone_hints` (voice guidance the AI follows), `friend_signoff`. The Claude Code skill `.claude/skills/friend-new-prospect/SKILL.md` walks through creating one — it uses an `insert ... on conflict (friend_slug) do update` SQL pattern.

**Data flow.**

1. **Sign-in.** Friend signs in with Google via Supabase Auth (`gmail.readonly` + `gmail.compose` scopes, `access_type=offline`, `prompt=consent` — configured in the Supabase Dashboard → Authentication → Providers → Google).
2. **Token linking.** Client posts to `POST /api/friends/[slug]/link-tokens`, which takes the Supabase auth session, extracts the Google provider tokens, and upserts them into `friend_gmail_tokens` (keyed on `(prospect_id, supabase_user_id)`). Also stamps `prospects.friend_supabase_user_id` so subsequent snapshots know who signed in.
3. **Sync.** Client opens `GET /api/friends/[slug]/stream` as an SSE connection. Server invokes `lib/friends/sync.ts` → `runSync({ friend, token, emit })`:
   - Refreshes the OAuth token if expired (POSTs to `oauth2.googleapis.com/token` with `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET`; updates `friend_gmail_tokens`)
   - **Learns the user's voice**: fetches up to 20 recent sent emails via `fetchSentBodies()` (Gmail query `in:sent`), passes bodies to `extractStyleSummary()` (OpenAI `gpt-4o-mini`, ≤ 5-sentence paragraph), upserts to `friend_ai_state.communication_style` (unique on `prospect_id`), emits `user_state_updated`. Non-fatal on failure — sync continues with only the seed `friend_tone_hints`.
   - Lists recent inbox threads via `gmail.users.threads.list` (default 40, query `in:inbox -category:promotions -category:social`)
   - For each thread: fetches full messages, upserts into `friend_email_threads` (status `processing`) and `friend_email_messages`, upserts sender addresses into `friend_recipient_profiles`
   - Calls `interpretThread({friend, learnedStyle, ...})` → `lib/friends/ai.ts` → OpenAI `gpt-4o-mini` with a strict `json_schema` response format. Returns `{summary, senderIntent, requiredAction, urgency, shouldReply, suggestedTone, relationshipContext, risks, opportunities, draftReply}`. The `learnedStyle` (from the step above) is injected into the system prompt and the model is instructed to prefer it over the seed `friend_tone_hints`.
   - Inserts into `friend_thread_interpretations`; flips the thread status to `needs_reply` or `analyzed`; sets `priority_score` from urgency (low=20, medium=60, high=100)
   - If `shouldReply`, inserts the draft into `friend_reply_drafts` with `status='generated'`
   - Emits `StreamEvent`s throughout: `sync_started` → `email_loaded` → `analysis_started` → `analysis_completed` → `draft_created` → `sync_completed` (or `error`)
4. **Review / edit / approve.** The `Cockpit` component shows thread cards; the user can edit drafts via `PATCH /api/friends/[slug]/drafts/[draftId]` (status transitions: `generated → edited → approved → sent_to_gmail` or `discarded`) and change thread status via `PATCH /api/friends/[slug]/threads/[threadId]/status`.
5. **Push to Gmail.** `POST /api/friends/[slug]/drafts/[draftId]` calls `createGmailDraft()` — base64-url-encodes an RFC 822 message with `In-Reply-To`/`References` headers and creates a draft via `gmail.users.drafts.create`. (Drafts are staged, not auto-sent — the human review step stays human.)
6. **Refresh.** `GET /api/friends/[slug]/snapshot` returns a fresh `CockpitSnapshot` on demand.

**Types.** `lib/friends/types.ts` defines every row type, the `CockpitSnapshot` shape, and the `StreamEvent` union.

**Server-side Supabase.** `lib/supabase-server.ts` → `getServerSupabase()` returns a cached client created with `NEXT_SECRET_SUPABASE_SERVICE_ROLE_KEY`. This is used everywhere under `/api/friends/*` because the cockpit writes across RLS-enabled tables and needs service-role privileges. Never import this from client code.

**Tables**: `friend_gmail_tokens`, `friend_email_threads`, `friend_email_messages`, `friend_recipient_profiles`, `friend_thread_interpretations`, `friend_reply_drafts`, `friend_ai_state`. Also reads/writes the friend-surface fields on `prospects`.

## API route catalog

| Route | Method(s) | Provider / Model | Purpose | Tables touched | Called by |
|---|---|---|---|---|---|
| `/api/charton-financial/chat` | POST | Anthropic `claude-sonnet-4-20250514` | Chat turn | — | `useChartonSession` |
| `/api/charton-financial/cards` | GET, PUT | — | Read/write context cards | `context_cards` | Charton UI |
| `/api/charton-financial/sessions` | POST, GET | — | Create/list sessions | `sessions`, `messages` | Charton UI |
| `/api/charton-financial/sessions/[id]` | GET, DELETE | — | Session detail | `sessions`, `messages` | Charton UI |
| `/api/prospects` | POST, GET | — | Create/list prospects | `prospects` | IntakeConversation |
| `/api/prospects/[id]` | GET, PATCH | — | Read/update prospect | `prospects` | IntakeConversation |
| `/api/prospects/sessions` | POST, GET | — | Create/list intake sessions | `prospect_sessions` | IntakeConversation |
| `/api/prospects/sessions/[id]` | GET, PATCH | — | Session detail | `prospect_sessions`, `prospect_turns` | IntakeConversation |
| `/api/prospects/chat` | POST | OpenAI `gpt-4o` | Assistant turn during intake | `prospect_turns` | IntakeConversation |
| `/api/prospects/transcribe` | POST | OpenAI Whisper / `gpt-4o` | Audio → text | — | useVoiceRecorder |
| `/api/prospects/synthesize` | POST | OpenAI `/audio/speech` | Text → audio | — | useIntakeSession |
| `/api/prospects/summary` | POST | OpenAI `gpt-4o` | Structured `ProspectSummary` extraction | `prospect_sessions.summary_json` | IntakeSummary |
| `/api/prospects/documents` | POST, GET | OpenAI `gpt-4o` | Render summary doc | `prospect_documents` | IntakeSummary |
| `/api/prospects/documents/[token]` | GET | — | Public shareable summary lookup | `prospect_documents` | Anyone with token |
| `/api/win-here/session` | POST | — | Create prospect + session stub | `prospects`, `prospect_sessions` (type=`win_here`) | MiniChat, WinHereChatView |
| `/api/win-here/chat` | POST | OpenAI `gpt-5.4-mini-2026-03-17` | Tool-loop chat turn | `prospect_turns`, `prospects` | MiniChat, WinHereChatView |
| `/api/atlas/session` | POST | Atlas v1 (proxy) | Create avatar session | — | AvatarSession component |
| `/api/atlas/session/[id]` | DELETE | Atlas v1 (proxy) | Tear down avatar session | — | AvatarSession component |
| `/api/friends/[slug]/snapshot` | GET | — | Refresh `CockpitSnapshot` | reads all `friend_*` + `prospects` | Cockpit |
| `/api/friends/[slug]/stream` | GET (SSE) | OpenAI `gpt-4o-mini` (via `interpretThread`) | Run full Gmail sync + interpretation + draft loop; emit `StreamEvent`s | `friend_email_threads`, `friend_email_messages`, `friend_recipient_profiles`, `friend_thread_interpretations`, `friend_reply_drafts`, `friend_gmail_tokens` | Cockpit |
| `/api/friends/[slug]/link-tokens` | POST | Google OAuth | Link Supabase-auth Google tokens → `friend_gmail_tokens` | `friend_gmail_tokens`, `prospects.friend_supabase_user_id` | SignInHero |
| `/api/friends/[slug]/drafts/[draftId]` | PATCH, POST | Gmail API (POST only) | PATCH: edit/approve/discard draft. POST: push draft to Gmail via `createGmailDraft` | `friend_reply_drafts`, `friend_gmail_tokens` | Cockpit / ThreadCard |
| `/api/friends/[slug]/threads/[threadId]/status` | PATCH | — | Change thread status (e.g. `done`, `ignored`) | `friend_email_threads` | Cockpit / ThreadCard |
| `/api/chat` | POST | OpenAI `gpt-4-turbo-preview` | Generic empathetic chatbot | — | **orphan** |
| `/api/analyze` | POST | OpenAI `gpt-4-turbo-preview` | Psychological conversation analysis | — | **orphan** |
| `/api/analyze-messages` | POST | OpenAI `gpt-4-turbo-preview` | Extract profile from message dump | — | `/skeleton-filled-closet/chat-analysis` |
| `/api/generate-response` | POST | OpenAI `gpt-4-turbo-preview` | Suggest next message in user's voice | — | `/skeleton-filled-closet/chat-analysis` |

**Orphan routes** (no live caller): `/api/chat`, `/api/analyze`. Candidates for removal.

## Supabase schema

**Current authoritative migration**: `supabase/migrations/20260423000000_fresh_init.sql`. This file **drops the `public` schema and recreates it** — meant for a fresh or disposable project. It consolidates the three prior migrations (`001_create_tables`, `002_prospect_intake`, `003_friend_drafter`). The originals are preserved historically in `supabase/migrations_archive/`; do not run them against the current DB.

All tables have RLS enabled with fully open `for all using (true) with check (true)` policies — a design choice that leans on the publishable key for read/write from the browser and the service-role key (via `lib/supabase-server.ts`) for Friends-cockpit writes.

**Section 2 — Chat backbone** (Charton):
- `sessions(id, user_id, title, created_at, updated_at)`
- `messages(id, session_id → sessions, role: user|assistant|system, content, created_at)`
- `context_cards(id, session_id, card_index 0..2, title, body, updated_at)` — one row per (session, card_index)

**Section 3 — Prospect intake + Friend surface**:
- `prospects(id, identity[...], business profile[...], crm_notes, meeting_notes, lead_status, priority, tags[], discovery[...], qualification[...], previous_attempts[...], engagement[...], outcome[...], friend_slug unique, friend_enabled, friend_headline, friend_pitch, friend_tone_hints, friend_signoff, friend_supabase_user_id uuid, created_by, ...)` — wide/generous; friend-surface fields grafted on from archived `003`
- `prospect_sessions(id, prospect_id, session_type: intake|follow_up|demo|check_in|win_here, title, status, access_token, summary_json, summary_text, duration_seconds, turn_count)`
- `prospect_turns(id, session_id, role, content, was_voice, audio_duration_ms, extracted_topics[], sentiment)`
- `prospect_documents(id, prospect_id, session_id, doc_type, title, content_html, content_text, content_json, share_token, is_shared)`

**Section 4 — Friend Drafter**:
- `friend_gmail_tokens(id, prospect_id, supabase_user_id, google_email, access_token, refresh_token, scope, expiry_date, ...)` — unique on `(prospect_id, supabase_user_id)`
- `friend_email_threads(id, prospect_id, gmail_thread_id, subject, participants[], last_message_at, snippet, status: new|processing|analyzed|needs_reply|done|ignored, priority_score)` — unique on `(prospect_id, gmail_thread_id)`
- `friend_email_messages(id, prospect_id, thread_id, gmail_message_id, from_email, from_name, to_emails[], cc_emails[], sent_at, body_text, body_html, snippet)` — unique on `(prospect_id, gmail_message_id)`
- `friend_recipient_profiles(id, prospect_id, email, name, company, role, website, linkedin_url, social_urls[], notes, ai_summary)` — unique on `(prospect_id, email)`
- `friend_thread_interpretations(id, prospect_id, thread_id, summary, sender_intent, required_action, urgency: low|medium|high, relationship_context, risks[], opportunities[], suggested_tone, should_reply, reasoning_summary)`
- `friend_reply_drafts(id, prospect_id, thread_id, body, tone, status: generated|edited|approved|sent_to_gmail|discarded, version)`
- `friend_ai_state(id, prospect_id unique, observed_patterns[], communication_style, common_tasks[], known_priorities[], people_map_summary)` — one row per prospect

## External integrations

| Service | Used by | Auth | Notes |
|---|---|---|---|
| **Anthropic** | Charton chat | `ANTHROPIC_API_KEY` | `claude-sonnet-4-20250514` |
| **OpenAI** | Prospects (`gpt-4o` + Whisper + TTS), Win-Here (`gpt-5.4-mini-2026-03-17`), Friends interpretation (`gpt-4o-mini` with strict JSON schema), orphan routes (`gpt-4-turbo-preview`) | `OPENAI_API_KEY` | Mix of reasoning-era and classic models |
| **Supabase** | All persistence | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (browser); `NEXT_SECRET_SUPABASE_SERVICE_ROLE_KEY` (server, Friends only) | Open RLS; service role required for Friends cockpit |
| **Atlas (northmodellabs)** | Voice avatar | `NEXT_NORTHMODELLABS_API_KEY` | Proxied via `/api/atlas/session`; returns LiveKit creds |
| **LiveKit** | Avatar audio transport | token from Atlas | Client joins room, publishes synthesized TTS audio |
| **Jina Reader** | Win-Here site canvass | unauthenticated | `https://r.jina.ai/{url}` — 8KB cap |
| **Gmail API** (via `googleapis`) | Friends cockpit | Google OAuth access_token (refreshed server-side) | `gmail.readonly` + `gmail.compose` scopes; drafts created, not sent |
| **Google OAuth** | Friends token refresh | `GOOGLE_OAUTH_CLIENT_ID` + `GOOGLE_OAUTH_CLIENT_SECRET` | Same client creds as Supabase Auth Google provider; duplicated here so server can refresh without re-prompting |
| **Firecrawl** | `scripts/firecrawl-client.mjs` | `NEXT_FIRECRAWL_API_KEY` | CLI only |
| **xAI Grok** | `scripts/generate-image-assets.mjs` | `NEXT_XAI_API_KEY` | CLI only (insurance infographics) |
| **Google Sheets** | `scripts/sheets-client.mjs`, `google-auth-setup.mjs` | OAuth | CLI only |
| **Calendly** | CTAs | — | `calendly.com/aqeelali/aa-30`; loaded as popup widget |
| **Vercel Analytics** | Root layout | — | Auto-enabled on deploy |

## Environment variables

**Declared in `.env.example`** (runtime):

- `OPENAI_API_KEY` — Prospects, Win-Here, Friends interpretation, orphan routes
- `ANTHROPIC_API_KEY` — Charton chat
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (browser + server)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — browser Supabase client
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — alternate browser key; used where Supabase auth flows need the anon key explicitly
- `NEXT_SECRET_SUPABASE_SERVICE_ROLE_KEY` — server-only; used by `lib/supabase-server.ts` for Friends cockpit writes. **Never expose to client.**
- `NEXT_SECRET_SUPABASE_SECRET_KEY` — second server-only secret (complements service-role)
- `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` — Gmail token refresh; mirror the Supabase Google provider credentials

**Used but undeclared in `.env.example`** (known gaps):

- `NEXT_NORTHMODELLABS_API_KEY` — Atlas avatar (`/api/atlas/session`)
- `NEXT_FIRECRAWL_API_KEY` — `scripts/firecrawl-client.mjs`
- `NEXT_XAI_API_KEY` — `scripts/generate-image-assets.mjs`

**Historical note**: the Supabase publishable key was renamed from `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in commit `72b18f9` (2026-04-23). Existing `.env.local` files need updating.

## Shared chrome & major components

- **`navbar.tsx`** — standard chrome on every shipped page except Friends cockpit and a few experimental ones. White blur header, gold-accent "Salience" wordmark, Services dropdown, "Book a Free Consult" CTA opens `mailto:aqeel@aqeelali.com`. Contact data hardcoded.
- **`header.tsx`** — alternate chrome used only on four skeleton-filled-closet experimental pages. Legacy.
- **`footer-spotlight.tsx`** — footer with spotlight effect; used on Charton.
- **`mini-chat.tsx`** — Win-Here chat embedded on the home page (posts to `/api/win-here/*`, not Prospects).
- **`components/insurance/*`** — flagship-vertical visuals: `word-orbit.tsx` (home + `/services/insurance`), `client-flow.tsx`, `salient-hub.tsx`, `art-placeholder.tsx`.
- **`components/friends/*`** — cockpit UI: `cockpit.tsx` (main shell, 410 lines), `sign-in-hero.tsx` (Google auth landing), `thread-card.tsx`, `connection-strip.tsx` (Gmail connection indicator), `context-panel.tsx`.
- **`components/prospects/*`** — voice intake UI mounted only on `/charton-financial` in intake mode.

## Design tokens (`app/globals.css` + `app/friends/friends.css`)

Marketing surface:
- Font: Manrope + system fallback
- Palette: white bg, slate text (#1e293b), blue primary (#2563eb), amber/gold accents (#d97706)
- `.gold-accent` — gradient text for brand word and emphasized copy
- `.cta-button` — blue gradient with hover lift + shimmer
- Card variants: `.value-card`, `.industry-card`, `.metric-card`, `.workflow-card`
- Animation keyframes: `orbit-a/b/c/d`, `flow-pulse`, `float`, `pulse-slow`, `countUp`
- Scroll-reveal pattern via Intersection Observer (`hooks/use-scroll-reveal.ts`)

Friends cockpit:
- Fonts: Instrument Serif (italic accents), Geist (body), Geist Mono (chrome/diagnostic)
- Own 267-line stylesheet `app/friends/friends.css` under a `data-friends` wrapper — dark aesthetic distinct from marketing
- Accent color: amber, used to italicize the `*asterisk-wrapped*` words in `friend_headline`

## Scripts

All in `scripts/*.mjs`, invoked via `node scripts/<file>.mjs [args]`.

- **`firecrawl-client.mjs`** — Firecrawl CLI: `search "query"`, `scrape "url"`, `map "url"`. Needs `NEXT_FIRECRAWL_API_KEY`.
- **`generate-image-assets.mjs`** — xAI Grok image gen for insurance infographics. Flags: `--list`, `--only {id}`, `--force`, `--size {px}`, `--dry-run`. Writes `/public/insurance/infographics/`. `npm run generate:images` wires it up.
- **`google-auth-setup.mjs`** — Google OAuth onboarding helper.
- **`sheets-client.mjs`** — Google Sheets client wrapper.
- **`friends/seed-test-slug.mjs`** — Seeds a throwaway friend slug into `prospects` for local cockpit testing.

## Team data

`lib/team.ts` is a static roster — four members (Aqeel, Jackson, Danara, George). Each record carries `slug`, `name`, `role`, `tagline`, `expertise[]`, `bio`, optional `image`, `email`, `phone`, `calendly`, `linkedin`, `github`, `x`, `website`. Adding a member means editing this file + dropping a photo into `/public/assets/team/`. `/team` lists; `/team/[slug]` renders a profile via `getTeamMember()`.

## Claude Code skills

`.claude/skills/friend-new-prospect/SKILL.md` — walkthrough for provisioning a new `/friends/[slug]`. Prompts the user for name/company/slug/angle/relationship/voice-cues/sign-off/CRM-notes, then writes an `insert ... on conflict (friend_slug) do update` into `prospects`. Note: the skill's "remind them: the cockpit requires migration 003_friend_drafter.sql" line is stale — `003` now lives in `migrations_archive/` and its contents are folded into the fresh-init migration.

## Known drift / open items

- **README.md and root CLAUDE.md are stale.** Both describe the app as a simple landing page. Update or ignore.
- **`.env.example` is complete for runtime Supabase/AI, but three script/integration keys remain undocumented**: `NEXT_NORTHMODELLABS_API_KEY` (Atlas, runtime), `NEXT_FIRECRAWL_API_KEY`, `NEXT_XAI_API_KEY`.
- **`.env.local` needs updating after `72b18f9`** — `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` was renamed to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and the Friends cockpit requires the new `NEXT_SECRET_SUPABASE_SERVICE_ROLE_KEY` + Google OAuth credentials.
- **Services vs Products duplication.** `/services/{vertical}` and `/products/{vertical}` pitch the same automations. Collapse or differentiate.
- **Two header components.** `navbar.tsx` and `header.tsx`; header is only on a handful of experimental pages. Unify or delete.
- **Orphan API routes.** `/api/chat` and `/api/analyze` — no shipped caller; candidates for deletion.
- **Skeleton-filled-closet.** Seven pages; only `chat-analysis` and `thesis` look intentional. The rest look like sketches.
- **Hardcoded contact info.** Phone `+14087180712`, email `aqeel@aqeelali.com`, Calendly `calendly.com/aqeelali/aa-30` scattered across pages. A `lib/config.ts` would reduce drift.
- **`IntakeConversation` path is misleading.** Lives under `components/prospects/` but is only mounted on `/charton-financial`.
- **Open RLS on every table.** Acceptable for demo surfaces and for the Friends cockpit when accessed via service role, but it means the browser-side publishable key can read/write every prospect, every thread, every draft. Tighten before any auth-gated use outside the Friends flow.
- **Win-Here persistence silent-fails.** Supabase errors are caught; chat continues without storing turns. If prospect records seem missing, check server logs.
- **Friends skill doc staleness.** `.claude/skills/friend-new-prospect/SKILL.md` references `003_friend_drafter.sql` which has been archived — the content is in the fresh-init migration now.
- **Fresh-init migration is destructive.** `20260423000000_fresh_init.sql` begins with `drop schema if exists public cascade;`. Only run against disposable DBs.
