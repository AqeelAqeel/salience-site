---
name: friend-new-prospect
description: Spin up a new /friends/[slug] AI-email-drafter cockpit for a specific prospect. Use when the user says "set up a friend at X", "make a friends page for Y", "add jamie to /friends", etc. Creates or updates the prospects row (with friend_slug, friend_enabled, friend_headline, friend_pitch, friend_tone_hints, friend_signoff) so the personalized cockpit at /friends/{slug} becomes live.
---

# friend-new-prospect

You're setting up a personalized `/friends/[slug]` cockpit for a specific prospect the user wants to win. Each friend gets a URL that renders a dark AI email cockpit tailored to them.

## What this produces

One row in the `prospects` table with friend-surface fields populated:
- `friend_slug` — URL segment (lowercase, hyphen-separated, unique)
- `friend_enabled = true` — gates visibility
- `friend_headline` — hero headline (italicize accent words with `*text*`)
- `friend_pitch` — subhead under the headline
- `friend_tone_hints` — voice guidance the AI follows when drafting replies
- `friend_signoff` — sign-off the AI appends

If a prospect with this `full_name` or `company_name` already exists, **update** that row rather than creating a duplicate.

## Gather these inputs (ask the user, one question per beat)

1. **Who** — first + last name. Company. Role if known.
2. **Slug** — derive from the name (`jamie-smith`); confirm with the user.
3. **Angle** — one sentence: why this person specifically? What's the wedge? (This shapes the headline and pitch.)
4. **Relationship** — cold, warm referral, or existing relationship? One-line history.
5. **Voice cues** — how does this person write or want to be written to? Concise? Warm? Academic? Emoji? Any words to avoid? Any signature quirks?
6. **Sign-off** — the sign-off the AI should use when drafting replies **in their voice** (e.g. "— J", "Cheers,\nJamie", "Best, Jamie Smith").
7. **CRM notes** — anything you already know about them worth threading into drafts (recent mutual friends, company news, past conversations).

Keep the user moving. If they skip a field, fill it with an empty string; don't block.

## Generate the surface copy

- `friend_headline`: short, personal, ideally uses their first name. Feel: a friend built you a thing. Mark the accent word/phrase with `*asterisks*` — the UI italicizes it in the amber accent color.
  - Good: `Hey Jamie — I built you a *thing*.`
  - Good: `Let's give you back *an hour* of mornings, Sam.`
- `friend_pitch`: 1–3 sentences. Frame the tool and what they'll see when they sign in. Reassure on privacy (read-only, their mail stays in their account).
- `friend_tone_hints`: 2–4 sentences describing their voice for the AI. Written in the second person to the AI ("Write like Jamie: short, direct, no fluff. Drop the pleasantries.").

## Write the row

Use `psql` or the Supabase JS client via a one-off Node script. If the user has `supabase` CLI configured, the cleanest path is a direct SQL insert. Pattern:

```sql
insert into public.prospects (
  full_name, company_name, role_title,
  friend_slug, friend_enabled,
  friend_headline, friend_pitch, friend_tone_hints, friend_signoff,
  crm_notes, meeting_notes, priority, lead_status
) values (
  '{{full_name}}', '{{company_name}}', '{{role_title}}',
  '{{slug}}', true,
  '{{headline}}', '{{pitch}}', '{{tone_hints}}', '{{signoff}}',
  '{{crm_notes}}', '{{meeting_notes}}', 'high', 'warm'
)
on conflict (friend_slug) do update set
  full_name = excluded.full_name,
  company_name = excluded.company_name,
  role_title = excluded.role_title,
  friend_enabled = true,
  friend_headline = excluded.friend_headline,
  friend_pitch = excluded.friend_pitch,
  friend_tone_hints = excluded.friend_tone_hints,
  friend_signoff = excluded.friend_signoff,
  crm_notes = excluded.crm_notes,
  meeting_notes = excluded.meeting_notes;
```

Prefer using the existing Supabase client (`lib/supabase.ts` / `lib/supabase-server.ts`) from a short Node script you put in `scripts/friends/` (if you need to). Never commit API keys.

## After creating

1. Confirm to the user: `"live at /friends/{slug} — open it to see"`.
2. Remind them: the cockpit requires migration `003_friend_drafter.sql` to have been applied. If the user hasn't run migrations yet, flag it.
3. Remind them: Supabase Auth → Google provider must have `gmail.readonly` enabled and `access_type=offline + prompt=consent` configured (the client-side code already sends these; the Supabase dashboard just needs Google credentials).
4. Offer to tweak the headline/pitch if the first pass lands flat.

## Don't

- Don't set `friend_enabled=true` until all required copy fields have *something* — an empty headline renders a default, but it won't feel personal.
- Don't overwrite an existing prospect's `friend_tone_hints` unless the user explicitly said "update".
- Don't create duplicate prospects for the same person with slightly different names. Search by name first.
