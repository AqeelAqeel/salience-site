-- ============================================================
-- Adds friend_personalization_context to prospects.
--
-- Free-form, editable context that the /friends/[slug] cockpit
-- shows in the top-left panel and that the reply drafter injects
-- into the LLM system prompt as voice/style grounding.
--
-- Suggested contents: example reply copy, common phrases, opening
-- lines the user actually uses, vocabulary quirks, anything that
-- helps the model write in their voice instead of a generic one.
-- ============================================================

alter table public.prospects
  add column if not exists friend_personalization_context text not null default '';
