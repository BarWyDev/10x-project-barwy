-- Migration: Create flashcard_status enum type
-- Description: Creates a custom enum type for tracking flashcard status in the spaced repetition system
-- Author: AI Assistant
-- Date: 2025-10-13

-- Create the flashcard_status enum type
create type public.flashcard_status as enum (
    'new',
    'learning',
    'mastered'
);

-- Add a comment to the type for better documentation
comment on type public.flashcard_status is 'Tracks the status of a flashcard in the spaced repetition system';
