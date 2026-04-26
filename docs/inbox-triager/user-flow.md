# User Flow

There are two roles: **operator** (you) and **friend** (the prospect/recipient
you're trying to win).

## Operator flow — provisioning a new cockpit

You have CRM context on someone you want to win. You want to give them a
personalized AI email tool with their name on it.

1. **Invoke the local skill.** In Claude Code, ask: `set up a friend at
   /friends/jamie-smith`. The `friend-new-prospect` skill walks through:
   - First/last name + company + role
   - Slug (defaults to `firstname-lastname`)
   - Angle (1 sentence: why this person specifically?)
   - Voice cues (how they write or want to be written to)
   - Sign-off the AI should use in drafts ("— J", "Best, Jamie", etc.)
   - CRM notes worth threading into the AI's context
2. **Skill writes the row.** Upserts into `prospects` with `friend_slug`,
   `friend_enabled=true`, `friend_headline`, `friend_pitch`,
   `friend_tone_hints`, `friend_signoff`. The personalized headline supports
   `*italic accent*` markup that renders in amber.
3. **Pre-flight the URL.** Open `/friends/{slug}` in your browser. Confirm:
   - The headline reads naturally
   - The pitch frames what the tool does
   - The trust panel (Step 2 of sign-in) lists the right scopes
4. **Add the friend's Gmail to GCP test users.** Until you complete OAuth
   verification, only Google accounts in the GCP OAuth test-user list can
   sign in. See [`configuration.md`](./configuration.md) → "GCP test users".
5. **Hand them the link.** Direct message, email, etc. The slug is unguessable
   in practice (it's hyphenated names), but it's not auth — see
   [`security.md`](./security.md).

### Future operator UX (not built)

The user asked for: *"the configuration is an admin and whatever it is, I go
and set up a test user. I can hyperlink somebody and that's that."* This means:

- A `/admin` route protected by your Supabase login.
- A "New friend" form: name, email, company, slug, headline, pitch, tone,
  signoff. Submit posts to `/api/admin/friends`, writes the row.
- A list of existing slugs with copy-link, disable, delete.
- A "Add to GCP test users" copy-helper (with their email pre-filled in a
  Google Cloud Console deep link, since GCP doesn't have a public API for
  test-user management).

This is a Phase 2 build item. Today the skill plays this role.

## Friend flow — first visit

1. **Lands on `/friends/{slug}`.** Hero card loads with their first name in
   the headline ("Hey Jamie — I built you a *thing*."). Background is warm
   black with grain texture; the hero has a small mock inbox preview to
   anchor the value prop visually.
2. **Clicks "Show me what this needs →".** This advances to a consent
   panel (the second view of `sign-in-hero.tsx`). They see two
   side-by-side cards:
   - **what this reads**: ~40 recent threads, subjects + bodies +
     participants, the connected Google account email
   - **what it never does**: send mail, share data, train models, let
     humans read mail
   - Plus a "where your data lives" card and a "you can revoke anytime"
     card
   - A required acknowledgement checkbox + links to /privacy and /terms
3. **Clicks "Continue with Google".** Supabase initiates OAuth with extra
   `gmail.readonly` scope. They see Google's account picker, then the
   "Google hasn't verified this app" warning (expected — see consent
   panel microcopy that prepares them: *"you'll see 'Google hasn't
   verified this app.' that's expected — click advanced → continue"*).
4. **Lands back on `/friends/{slug}`.** Supabase exchanges the code for a
   session; `onAuthStateChange("SIGNED_IN")` fires. Client posts the
   provider tokens to `/api/friends/{slug}/link-tokens`. Server upserts to
   `friend_gmail_tokens`. Client triggers SSE sync.
5. **Watches the cockpit fill in live.** Sticky top strip shows
   `reading · 3/40` then `12 pending · 28 read`. Thread cards stream in
   over 30–90s as OpenAI finishes per-thread analyses. Each card has:
   - Urgency dot (low/medium/high — high pulses amber)
   - Subject + counterparty
   - Summary + sender intent + suggested action
   - Inline draft editor with their voice already applied
   - "copy" / "save edit" / "put in gmail drafts" buttons
   - "mark done" to remove from pending
6. **Reviews drafts, edits in place, copies or pushes to Gmail Drafts.**
   The "put in gmail drafts" path needs `gmail.compose` scope — Phase 3
   work; today it 412s with a clear error.
7. **Calibrates the AI's voice in the left panel.** A "your voice ·
   samples" textarea at the top of the context panel lets the friend
   paste real reply examples + phrases they use ("heads-down on", "ping
   you") and phrases they avoid ("circling back"). Saves on blur or
   ⌘↵. The next sync reads this from
   `prospects.friend_personalization_context` and feeds it into the
   drafter prompt as voice grounding. Iterate: paste more samples →
   resync → drafts sound more like them.

## Friend flow — return visit

- Same URL. If their browser still has the Supabase session cookie (default
  TTL: 1 hour for access token, refresh token persistent), they land
  straight into the cockpit. The server-side snapshot loads what we stored
  in the last sync.
- They can hit "resync" in the top strip to fetch new mail.
- If session expired, they see the sign-in hero again and re-OAuth — the
  refresh token persistence means they go through a faster Google screen
  (already-granted scopes).

## Failure modes the friend can hit

| State | What they see | What's wrong |
|-------|--------------|-------------|
| Slug doesn't exist | "This door wasn't for you." 404 page | Operator hasn't created the row, or `friend_enabled=false` |
| Google "unverified app" | Yellow warning screen | Expected — operator hasn't done OAuth verification yet. Trust panel prepares them. |
| "no gmail tokens linked yet" SSE error | Cockpit loads but SSE shows error | Sign-in didn't complete cleanly. Re-click sign-in. |
| "connection lost" | Sticky strip flips to error state | Was the proxy timeout bug. Heartbeat fix is in `stream/route.ts` — needs deploy. |
| Empty cockpit after sync | "All N threads are clean" | Their inbox literally has no threads needing reply (rare) |
| Token refresh fails | Error event with "Gmail token expired and GOOGLE_OAUTH_CLIENT_ID..." | Env var missing on the deployment — see [`configuration.md`](./configuration.md) |

## What you (operator) see in the friend's flow

You don't. There's no admin observation layer. Whether they signed in,
whether the sync worked, whether they hit "put in gmail drafts" — you don't
see any of it. Phase 2 should add operator analytics:

- "Last sign-in" timestamp on the prospect row
- "Last sync" + "thread count" + "drafts pushed"
- A `/admin/friends/{slug}` view that shows the sync log without showing
  thread contents (preserve the friend's privacy)
