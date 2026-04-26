-- ============================================================
-- Adds common_phrases to friend_ai_state.
--
-- The /friends sync extracts ~6–12 short phrases the user actually
-- reuses across their sent mail (openers, connectors, sign-offs).
-- These are shown in the cockpit's top-left "your voice" panel and
-- injected into the reply-drafter prompt as concrete vocabulary
-- grounding alongside the prose communication_style summary.
-- ============================================================

alter table public.friend_ai_state
  add column if not exists common_phrases text[] not null default '{}';
