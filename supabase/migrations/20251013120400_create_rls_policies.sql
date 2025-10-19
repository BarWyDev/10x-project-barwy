-- Migration: Create Row Level Security policies
-- Description: Creates RLS policies for decks and flashcards tables (all policies disabled - return true)
-- Author: AI Assistant
-- Date: 2025-10-13

-- RLS policies for decks table
create policy "Allow all operations on decks"
    on public.decks
    for all
    using (true)
    with check (true);

comment on policy "Allow all operations on decks" on public.decks is 'Temporarily disabled RLS - allows all operations on decks';

-- RLS policies for flashcards table
create policy "Allow all operations on flashcards"
    on public.flashcards
    for all
    using (true)
    with check (true);

comment on policy "Allow all operations on flashcards" on public.flashcards is 'Temporarily disabled RLS - allows all operations on flashcards';