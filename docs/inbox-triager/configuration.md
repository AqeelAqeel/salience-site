# Configuration

What you need set up — once per environment — for the cockpit to function.

## Environment variables

`.env.local` (dev) and Vercel project env (prod) both need:

| Var | Where to get it | Used by |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API | client + server |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | same | client (sign-in) |
| `NEXT_SECRET_SUPABASE_SERVICE_ROLE_KEY` | same → service_role | server only — DB writes bypass RLS |
| `OPENAI_API_KEY` | platform.openai.com | server (interpretation) |
| `GOOGLE_OAUTH_CLIENT_ID` | GCP Console → Credentials | server (token refresh) |
| `GOOGLE_OAUTH_CLIENT_SECRET` | same | server (token refresh) |

**The Google ones are easy to forget** — Supabase Dashboard's Google provider
also takes them, but our server still needs them separately. Without them,
the cockpit works for the first hour, then access tokens expire and the
refresh call throws. The SSE route now preflights these and returns a
descriptive error event instead of "connection lost".

## Google Cloud Platform setup

### 1. OAuth consent screen

GCP Console → APIs & Services → **OAuth consent screen**:

| Field | Value |
|---|---|
| User Type | External |
| App name | `Salience Inbox AI` |
| User support email | your address |
| App logo | 120×120 PNG |
| Application home page | `https://salience.ventures` |
| Application privacy policy | `https://salience.ventures/privacy` |
| Application terms of service | `https://salience.ventures/terms` |
| Authorized domains | `salience.ventures` |
| Developer contact | your address |

Scopes: add `https://www.googleapis.com/auth/gmail.readonly` only. (Don't add
`gmail.compose` until you ship the push-to-drafts feature; it triggers an
additional review requirement.)

### 2. OAuth 2.0 Client ID

GCP Console → Credentials → **Create credentials** → OAuth Client ID → Web
application.

| Field | Value |
|---|---|
| Authorized JavaScript origins | (none required) |
| Authorized redirect URIs | `https://<project-ref>.supabase.co/auth/v1/callback` |

Supabase Dashboard → Authentication → Providers → Google shows the exact
redirect URI to register here.

Save the **Client ID** and **Client Secret** — paste them into both:
- Supabase → Authentication → Providers → Google
- Your env vars (`GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`)

### 3. Publishing status: Testing + test users

OAuth consent screen → **Publishing status: Testing**.

Add up to 100 test-user Gmail addresses. Only those addresses can complete
the consent flow until you submit for verification. They'll still see the
"unverified app" warning but can click *Advanced → Continue*. The pre-OAuth
trust panel I built prepares them for that exact moment.

When you're ready for unrestricted access:
- Submit for OAuth verification (3–10 days best case, weeks realistic)
- For Gmail-restricted scopes you'll also need a CASA security assessment
  ($0–$15k depending on tier)

## Supabase setup

### 1. Auth → URL Configuration

| Field | Value |
|---|---|
| Site URL | `https://salience.ventures` (must include scheme!) |
| Redirect URLs | `http://localhost:3000/**`, `http://localhost:3001/**`, `https://salience.ventures/**`, `https://www.salience.ventures/**` |

A common gotcha: **Site URL must have `https://`**. If you type
`salience.ventures`, Supabase treats it as a relative path and
post-OAuth redirects land at `<project-ref>.supabase.co/salience.ventures`.

### 2. Auth → Providers → Google

- Enable
- Paste Client ID + Secret from GCP

### 3. Schema migration

The schema is consolidated in
`supabase/migrations/20260423000000_fresh_init.sql`. It:

- **Drops the public schema** (warning — destroys all existing data)
- Recreates everything: chat tables, prospects, prospect_sessions,
  friend_*, with indexes + triggers + RLS policies

If you're working against an existing project with data, do not run this as-is.
Apply only the friend_* delta:

1. Copy from `-- 7. Friend drafter ...` (search for it) through end of file
2. Run in Supabase SQL editor

For a fresh project, paste the whole file.

## Vercel deployment

Vercel project env vars must mirror `.env.local`. Set them via:
- Dashboard → Settings → Environment Variables, or
- `vercel env add` from CLI

Note: SSR + SSE work on Vercel Fluid Compute (Node.js runtime, default for
this app). The `maxDuration = 300` export on `/stream/route.ts` is honored on
all Vercel plans now.

## Operator local workflow

```bash
# One-time
npm install
cp .env.example .env.local
# fill in env values

# Apply migration (fresh project) via Supabase Studio SQL editor

# Spin up a test friend
node scripts/friends/seed-test-slug.mjs

# Run dev server
npm run dev   # http://localhost:3000 or :3001 if 3000 is taken
open http://localhost:3001/friends/test-slug

# Provision a real friend
# In Claude Code: "set up a friend at /friends/jane-doe"
# Walks through name, slug, headline, pitch, tone, signoff
```

## Things that bite people

- **Site URL without scheme** → post-OAuth redirect lands at supabase.co
- **Redirect URLs missing `:3001`** → silent fallback to Site URL
- **Missing `GOOGLE_OAUTH_CLIENT_ID/SECRET` in prod env** → works for 1
  hour, then SSE dies on token refresh
- **Test user not in GCP test-user list** → user can't even click
  Advanced→Continue; they get a hard "access blocked" screen
- **Forgot to enable Gmail API in GCP project** → token refresh succeeds
  but `users.threads.list` 403s. Enable: APIs & Services → Library → Gmail
  API → Enable
