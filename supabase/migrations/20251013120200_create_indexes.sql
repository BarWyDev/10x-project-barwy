-- Migration: Create indexes for performance optimization
-- Description: Creates indexes on foreign keys and frequently queried columns
-- Author: AI Assistant
-- Date: 2025-10-13

-- Create index for decks.user_id
create index idx_decks_user_id on public.decks(user_id);
comment on index public.idx_decks_user_id is 'Improves performance of queries filtering by user_id';

-- Create indexes for flashcards table
create index idx_flashcards_deck_id on public.flashcards(deck_id);
comment on index public.idx_flashcards_deck_id is 'Improves performance of queries filtering by deck_id';

create index idx_flashcards_user_id on public.flashcards(user_id);
comment on index public.idx_flashcards_user_id is 'Improves performance of queries filtering by user_id';
