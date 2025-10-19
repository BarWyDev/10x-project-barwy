-- Migration: Create triggers for automatic updated_at handling
-- Description: Creates a function and triggers to automatically update the updated_at timestamp
-- Author: AI Assistant
-- Date: 2025-10-13

-- Create the trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

comment on function public.handle_updated_at() is 'Trigger function to automatically update updated_at timestamp';

-- Create trigger for decks table
create trigger on_decks_updated
    before update on public.decks
    for each row
    execute procedure public.handle_updated_at();

comment on trigger on_decks_updated on public.decks is 'Automatically updates the updated_at timestamp when a deck is modified';

-- Create trigger for flashcards table
create trigger on_flashcards_updated
    before update on public.flashcards
    for each row
    execute procedure public.handle_updated_at();

comment on trigger on_flashcards_updated on public.flashcards is 'Automatically updates the updated_at timestamp when a flashcard is modified';
