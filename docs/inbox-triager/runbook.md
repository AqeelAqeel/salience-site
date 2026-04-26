# Runbook

Common failures and how to debug them. Most cockpit issues fall into one of
these buckets.

## Symptom: "connection lost" in the sticky strip

What it means: the EventSource saw the SSE close before `sync_completed`
fired. Browser console may not show the underlying error because EventSource
errors are opaque.

Causes, in order of likelihood:

### 1. Vercel proxy idle-timeout (most common)

OpenAI calls take 5–15s per thread. If the first analysis takes >25s, the
edge proxy may close the idle stream.

**Diagnosis:** Watch the sync strip: does it say `reading · 0/40` for >20s
before flipping to `connection lost`? That's it.

**Fix:** the route now sends a `: ping\n\n` heartbeat every 15s
(`app/api/friends/[slug]/stream/route.ts`). If you're seeing this on a
deployment older than that fix, redeploy.

### 2. Token refresh failing (env vars missing)

The access token is good for 1 hour. After that, `refreshIfNeeded` calls
Google's `/token` endpoint with `GOOGLE_OAUTH_CLIENT_ID` +
`GOOGLE_OAUTH_CLIENT_SECRET`. Without those env vars in the deployment, it
throws.

**Diagnosis:** the new SSE route preflights env vars and emits a structured
error event:
```json
{"type":"error","message":"server is missing env vars: GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET. ..."}
```
Open DevTools → Network → click the `/stream` row → Response → look for that.

**Fix:** add both vars in Vercel project settings (Production + Preview).
Then redeploy or trigger a new deployment.

### 3. Refresh token revoked at Google

If the friend visited <https://myaccount.google.com/permissions> and revoked
Salience, the refresh call returns `400 invalid_grant`.

**Diagnosis:** SSE error event message contains "invalid_grant" or
"Token has been expired or revoked".

**Fix:** the friend has to re-sign-in. The cockpit will pick up the new
tokens.

### 4. Gmail API not enabled

Token refresh succeeds, but `users.threads.list` returns
`403 Gmail API has not been used in project ...`.

**Diagnosis:** SSE error event contains
"Gmail API has not been used in project".

**Fix:** GCP Console → APIs & Services → Library → Gmail API → Enable.

## Symptom: 404 page ("This door wasn't for you")

The slug doesn't resolve to an active prospect.

**Diagnosis:**
```sql
select id, friend_slug, friend_enabled
from prospects
where friend_slug = '<slug>';
```
If the row exists but `friend_enabled=false`, that's the cause.
If no row, the slug was never created.

**Fix:** run the `friend-new-prospect` skill to create it, or
`update prospects set friend_enabled=true where friend_slug='...'` to
re-enable.

## Symptom: signed in with Google but cockpit doesn't load — stays on hero

Means the auth callback didn't end with a `link-tokens` POST.

**Diagnosis path:**

1. **Was the redirect URL in Supabase's allowlist?** Check Supabase →
   Authentication → URL Configuration → Redirect URLs. Should include
   `http://localhost:3001/**` (dev) and `https://salience.ventures/**`
   (prod).
2. **Did the redirect actually land on the app domain?** If post-OAuth URL
   shows `<ref>.supabase.co/...` instead of your app domain, Site URL is
   misconfigured (must include `https://`).
3. **Console warnings.** The cockpit logs `[friends] Session present but no
   provider_token...` if the OAuth flow didn't return a Gmail token. Means
   either scope wasn't granted or `access_type=offline` wasn't honored.
4. **Hit `/api/friends/{slug}/snapshot`.** If it returns
   `connectedGoogleEmail: null`, no token row exists yet. Check DB:
   ```sql
   select google_email, expiry_date
   from friend_gmail_tokens
   where prospect_id = (
     select id from prospects where friend_slug = '<slug>'
   );
   ```

## Symptom: drafts get pushed to Gmail Drafts → 412 or 500

The push-to-drafts endpoint requires `gmail.compose` scope. Today we only
request `gmail.readonly`.

**Fix path (Phase 3 work):**
1. Add `https://www.googleapis.com/auth/gmail.compose` to the OAuth scopes
   in `cockpit.tsx` (`signInWithOAuth.options.scopes`).
2. Add it to the GCP OAuth consent screen scope list. This triggers a
   second-tier review (Restricted scope).
3. Existing users have to re-OAuth to grant the new scope.

Until then, the workflow is "copy" → paste into Gmail manually.

## Symptom: re-running the same sync produces duplicate drafts

Each run inserts a new `friend_reply_drafts` row with `version = 1`. The
schema doesn't currently increment versions across runs.

**Workaround:** delete drafts that aren't the latest:
```sql
delete from friend_reply_drafts where created_at <
  (select max(created_at) from friend_reply_drafts where thread_id = '...')
  and thread_id = '...';
```

**Permanent fix:** in `lib/friends/sync.ts`, after generating a new draft,
upsert with `version = (max(version) + 1)` instead of always `version = 1`.

## Symptom: cockpit shows another user's data

If you're seeing this, you're hitting the data-tenancy issue described in
[`security.md`](./security.md). Anyone who has the slug URL — even without
signing in — sees the data of whoever previously linked tokens at that slug.

**Immediate mitigation:** disable the affected slug:
```sql
update prospects set friend_enabled = false where friend_slug = '<slug>';
```

Optionally wipe the data:
```sql
delete from friend_gmail_tokens where prospect_id = '<id>';
delete from friend_email_messages where prospect_id = '<id>';
delete from friend_email_threads where prospect_id = '<id>';
delete from friend_thread_interpretations where prospect_id = '<id>';
delete from friend_reply_drafts where prospect_id = '<id>';
delete from friend_recipient_profiles where prospect_id = '<id>';
delete from friend_ai_state where prospect_id = '<id>';
```

**Real fix:** Phase 2A in [`security.md`](./security.md).

## Symptom: dev server fails to start with "Missing NEXT_PUBLIC_SUPABASE_URL"

The boot guard in `lib/supabase-server.ts` throws.

**Fix:** populate `.env.local` from `.env.example`. The friend cockpit needs
all of:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_SECRET_SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`

## Diagnostic queries

Token state for a friend:
```sql
select google_email, scope, expiry_date, updated_at
from friend_gmail_tokens
where prospect_id = (select id from prospects where friend_slug = '<slug>');
```

Last sync state:
```sql
select status, count(*)
from friend_email_threads
where prospect_id = (select id from prospects where friend_slug = '<slug>')
group by status;
```

Drafts pending review:
```sql
select t.subject, d.body, d.status, d.version, d.updated_at
from friend_reply_drafts d
join friend_email_threads t on t.id = d.thread_id
where d.prospect_id = (select id from prospects where friend_slug = '<slug>')
order by d.updated_at desc
limit 20;
```

## When you're stuck

1. Open browser DevTools → Network → look for `/api/friends/{slug}/stream`
   → Response tab. Any `error` event there explains 80% of failures.
2. Check Vercel function logs for that route. Stack traces from
   `runSync`/`refreshIfNeeded`/`interpretThread` are explicit.
3. Reach for the diagnostic SQL above before guessing.
