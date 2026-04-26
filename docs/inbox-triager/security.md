# Security & Tenancy

> **Status: Phase 1 has real data-tenancy gaps.** This doc names them
> concretely, then lays out the remediation. Don't share `/friends/{slug}`
> URLs publicly until at least the Phase 2A fix lands.

## The mental model we promise to friends

When a friend visits `/friends/jamie`, the implicit promise is:

> "This URL is for **me**. I sign in with **my** Google. The cockpit shows
> **my** emails. No one else, even with the URL, can see my data."

That's the contract the trust panel and privacy policy commit to.

## What the implementation actually does (today)

The slug `jamie` resolves to a `prospects` row. Anyone who knows the URL can:

1. **See pre-rendered cockpit data on initial page load** — `app/friends/[slug]/page.tsx` is a server component that calls `getCockpitSnapshot(friend)` *before* any auth check. The HTML it streams to the browser embeds whatever threads, drafts, summaries, and recipient names are stored under that prospect_id.
2. **Hit any `/api/friends/{slug}/*` route** — none of them check a Supabase session. They only check that `friend_slug` exists in `prospects`. So:
   - `GET /api/friends/jamie/snapshot` → returns Jamie's full cockpit JSON to anyone.
   - `GET /api/friends/jamie/stream` → runs a sync against Jamie's stored Gmail tokens (refreshing if needed) and streams the AI analyses to the caller.
   - `PATCH /api/friends/jamie/drafts/{id}` → anyone can edit Jamie's drafts.
   - `POST /api/friends/jamie/drafts/{id}` → anyone can push a Gmail draft into Jamie's drafts folder (currently 412s without `gmail.compose` scope, but the auth layer is the gap, not the scope).
3. **Sign in *as* Jamie's slug with a different Google account.** `link-tokens` upserts on `(prospect_id, supabase_user_id)`, so a second user signing in just adds a new token row. Subsequent syncs may use *either* user's tokens depending on which row `getGmailToken` happens to return. Mail from two different humans gets co-mingled under the same `prospect_id`.

## Concrete leakage scenarios

| Scenario | Outcome |
|---|---|
| You send `https://salience.ventures/friends/jamie` to Jamie. Sam intercepts the link (forwarded email, slack screenshot). | Sam visits the URL, sees Jamie's last 40 thread summaries, recipients, and drafts in their browser. No sign-in required. |
| Jamie signs in. A week later, anyone with the URL hits "resync". | A fresh sync runs against Jamie's stored Gmail tokens, exposing new mail to whoever holds the URL. |
| Sam signs in with their own Gmail at `/friends/jamie`. | Sam's Gmail tokens get stored under Jamie's prospect_id. The next sync may use Sam's tokens, ingesting Sam's mail into Jamie's cockpit. Both users now see a polluted view. |
| Jamie shares their cockpit screenshot showing the URL. | Anyone who reads the screenshot can visit the URL with the same effects above. |

The first scenario is the loudest — **literally anyone who guesses a slug
sees stored email summaries.** Slugs are first-name-last-name in practice,
so "guessing" is reasonable for any name in your CRM.

## Why this exists

It was the simplest path to a working v0. Every API route and the SSR data
fetch take the slug as the only authority — there's no session check. We
wrote it that way because:

1. The first sign-in *creates* the relationship between (Supabase user,
   prospect). Until then, there's no auth to check against.
2. Re-running the SSR snapshot after sign-in to bind it to a specific user
   adds a round-trip we hadn't built.
3. The product only ever has one intended human per slug, so we leaned on
   "URL is private" as a soft fence.

That's not enough.

## Remediation plan

### Phase 2A — minimum viable hardening (4–6 hours)

**1. Bind a slug to one Supabase user on first link.**

When `link-tokens` fires, if `prospects.friend_supabase_user_id` is null, set
it to the signing-in user. If it's already set and doesn't match, reject:

```ts
// app/api/friends/[slug]/link-tokens/route.ts
const friend = await getFriendBySlug(slug);
if (friend.friend_supabase_user_id &&
    friend.friend_supabase_user_id !== body.supabaseUserId) {
  return NextResponse.json(
    { error: "this cockpit is bound to a different account" },
    { status: 403 }
  );
}
```

This means the FIRST signed-in user owns the slug. Operator can clear
`friend_supabase_user_id` if they want to re-bind (script + admin UI later).

**2. Auth-gate every API route.**

Add a helper in `lib/friends/auth.ts`:

```ts
export async function requireFriendOwner(
  req: Request,
  slug: string
): Promise<{ friend: FriendSurface; userId: string } | NextResponse> {
  const auth = req.headers.get("authorization");
  const token = auth?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "no session" }, { status: 401 });

  // Verify the JWT against Supabase
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
  const { data, error } = await supa.auth.getUser(token);
  if (error || !data.user) return NextResponse.json({ error: "bad session" }, { status: 401 });

  const friend = await getFriendBySlug(slug);
  if (!friend) return NextResponse.json({ error: "no friend" }, { status: 404 });
  if (friend.friend_supabase_user_id !== data.user.id) {
    return NextResponse.json({ error: "not your cockpit" }, { status: 403 });
  }
  return { friend, userId: data.user.id };
}
```

Client always sends `Authorization: Bearer ${session.access_token}` on every
fetch + EventSource. Every server route uses `requireFriendOwner` first.

**3. Defer the snapshot fetch until after auth.**

Change `app/friends/[slug]/page.tsx` to render the sign-in hero unconditionally
on first render. The Cockpit client component fetches the snapshot via
`/api/friends/{slug}/snapshot` (with the new auth header) only after a
session exists. SSR no longer leaks data.

**4. Restrict snapshot HTTP route to authed owners.**

Same `requireFriendOwner` gate. After 2A, no one without a valid Supabase
session matching `friend_supabase_user_id` can read the cockpit.

After 2A:
- Anonymous URL access shows only the (publicly-known) headline + pitch + CTA.
- Only the bound user can read snapshots, run syncs, edit drafts.
- Cross-pollination between users is impossible.

### Phase 2B — defensive depth (4–8 hours)

**5. Tighten RLS.**

Drop the open `WITH CHECK (true)` policies. Replace with policies keyed off
`auth.uid() = (select friend_supabase_user_id from prospects where id =
prospect_id)` — even if a future bug exposes the publishable key + a route
that uses the anon client, RLS prevents the read.

**6. Encrypt refresh tokens at rest.**

Use `pgsodium` or app-level AES-GCM with a `GMAIL_TOKEN_ENC_KEY` env. Today
the refresh token is stored plaintext in `friend_gmail_tokens.refresh_token`.
A DB dump leaks long-lived Gmail access for every signed-in friend.

**7. Add audit logging.**

A `friend_audit_log` table: every snapshot read, sync run, draft push, with
`(prospect_id, supabase_user_id, action, timestamp, ip_hash)`. Lets you
detect anomalous access patterns and gives you something to show in an
incident review.

### Phase 2C — friend-facing controls (UX work)

**8. "Disconnect" button in the cockpit.**
Calls a new `/api/friends/{slug}/disconnect` that:
- Revokes the access token via Google's `/revoke` endpoint
- Deletes the `friend_gmail_tokens` row
- Clears `friend_supabase_user_id` (or sets a `disconnected_at` timestamp)
- Optionally hard-deletes all `friend_*` data for that prospect

**9. "Delete all my data" link in privacy policy.**
Same backend, exposed at `/legal/data-request` with email confirmation.

**10. "Last accessed" stamp in the cockpit.**
"Last fetched 14m ago by aqeel@salience.ventures from 73.x.x.x" — visible to
the friend so unauthorized access is conspicuous.

## What you need to know operationally — until 2A lands

- Treat slug URLs as **share-once, in-DM-only** links. Don't post them in
  group chats, public Notion, public spreadsheets.
- Don't reuse a slug across people. Each friend gets a unique slug.
- If you suspect a slug leaked: in Supabase, run `update prospects set
  friend_enabled = false where friend_slug = 'xyz'`. The route returns 404
  and the SSE shuts down. Then run `delete from friend_gmail_tokens where
  prospect_id = '...'` and `delete from friend_email_threads where
  prospect_id = '...'` to wipe content.

## Other security considerations

- **Email body bodies are stored in Postgres.** `friend_email_messages.body_text`
  and `body_html` are full content. Operate on this assumption when picking
  hosting region (Supabase EU vs US), DB backup retention, and DPA signatures
  with OpenAI.
- **OpenAI sees thread bodies.** API-tier OpenAI states data isn't trained on,
  but it traverses their network. Note this in your DPA. The privacy policy
  already discloses it.
- **No DPIA yet.** If you land an EU friend (post-verification), you'll want
  a DPIA on file given the volume of personal data + AI processing.
- **No 2FA on the operator side.** The Supabase service role key in the
  Vercel env is the keys-to-the-kingdom. Rotate quarterly. Don't share. Don't
  paste in screenshots.
- **The pre-existing `prospects` table predates the friend system** and the
  `intake` flows expose prospect rows in the public-shared `prospect_sessions`
  pattern. Audit those endpoints separately — they have their own tenancy
  model and aren't covered here.

## Bottom line

Phase 1 ships a beautiful, *demonstrably broken* tenancy model. The fix is
not exotic; it's "auth-gate the routes" + "bind slug to one user." It's
worth doing this week before the second test user signs up. The plan above
is sequenced so 2A is the contract you can live with publicly, 2B is
defense-in-depth, 2C is the polish layer you'd advertise on the privacy
page.
