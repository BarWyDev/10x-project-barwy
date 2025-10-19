-- Migration: Add index for AI usage limit tracking
-- Description: Creates composite index for efficient daily usage counting
-- Author: AI Assistant
-- Date: 2025-10-19
-- Related: POST /api/flashcards/generate endpoint

-- Create composite index for AI-generated flashcards usage tracking
-- This index optimizes the query that counts AI-generated flashcards created today
-- Used by UsageService.checkAndGetUsage() to enforce daily limits
create index if not exists idx_flashcards_user_ai_created 
on public.flashcards(user_id, ai_generated, created_at)
where ai_generated = true;

comment on index public.idx_flashcards_user_ai_created is 
'Optimizes daily AI generation limit checking. Filters on user_id, ai_generated flag, and created_at timestamp.';

