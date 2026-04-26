# Inbox Triager

A per-prospect AI email cockpit. Each prospect ("friend") gets a private URL
(`/friends/{slug}`) where they sign in with Google, the app reads their last
~40 inbox threads, and OpenAI generates a summary + reply draft for each.

The product is a **gift wedge**: hand-crafted for one specific person you're
trying to win. Not a SaaS signup, not a public app.

## Status

- **Phase 1 (shipped)** — End-to-end Gmail read + AI interpretation + draft
  persistence + push-to-Gmail-drafts wired.
- **Phase 2A (shipped)** — Tenancy fix: every API route auth-gated via
  Supabase JWT (Bearer header or `?access_token=` for SSE); slug binds to
  the first signing-in Supabase user (`prospects.friend_supabase_user_id`)
  and rejects mismatches; SSR no longer pre-fetches the snapshot. Cockpit
  fetches snapshot client-side after ownership confirmed. See
  [`security.md`](./security.md) for what's still open in 2B/2C.
- **Phase 2B (next)** — Encrypt refresh tokens at rest (`pgsodium`), tighten
  RLS to enforce ownership, add `friend_audit_log`.
- **Phase 2C** — In-cockpit "disconnect" + "delete my data" controls.
- **Phase 3 (deferred)** — `gmail.compose` scope, recipient enrichment,
  pattern extraction across sent mail, OAuth verification submission to
  Google.

## Where things live

```
app/friends/[slug]/page.tsx              server component, loads friend + snapshot
app/friends/[slug]/not-found.tsx         404 surface for inactive slugs
app/friends/layout.tsx                   font + dark-theme shell
app/friends/friends.css                  scoped editorial dark theme
app/api/friends/[slug]/
  link-tokens/route.ts                   claims slug ownership + stores Gmail tokens
  stream/route.ts                        SSE: fetch + analyze + emit events
  snapshot/route.ts                      JSON cockpit state
  context/route.ts                       PATCH friend_personalization_context (voice samples)
  drafts/[draftId]/route.ts              edit draft / push to Gmail drafts
  threads/[threadId]/status/route.ts     mark done / ignored

components/friends/
  cockpit.tsx                            client orchestrator (auth + SSE + state)
  sign-in-hero.tsx                       two-step pre-OAuth trust panel
  connection-strip.tsx                   sticky status bar
  context-panel.tsx                      left side panel (desktop) / drawer (mobile)
  thread-card.tsx                        thread + draft editor

lib/friends/
  types.ts                               shared types
  prompts.ts                             OpenAI system + user prompts
  ai.ts                                  OpenAI structured-output interpretation + style extraction
  gmail.ts                               threads.list + threads.get + sent fetch + draft create
  sync.ts                                end-to-end ingestion pipeline
  db.ts                                  DAL on top of Supabase service role
  auth.ts                                requireFriendOwner / requireSessionForFriend (JWT verify)
lib/supabase-server.ts                   service-role server client

scripts/friends/seed-test-slug.mjs       one-off seeder for /friends/test-slug
.claude/skills/friend-new-prospect/      Claude Code skill for spinning up new slugs

supabase/migrations/                     fresh-init consolidated migration
```

## Doc map

- [`architecture.md`](./architecture.md) — the system at a glance + data flow
- [`user-flow.md`](./user-flow.md) — what the friend sees, what the operator does
- [`data-model.md`](./data-model.md) — DB schema + invariants
- [`configuration.md`](./configuration.md) — env, GCP, Supabase, deploy
- [`security.md`](./security.md) — **read this** — tenancy model, leakage,
  remediation plan
- [`runbook.md`](./runbook.md) — common failures + how to debug
