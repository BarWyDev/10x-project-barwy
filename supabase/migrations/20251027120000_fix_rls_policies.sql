-- Migration: Fix Row Level Security policies
-- Description: Replaces permissive RLS policies with proper user-based security
-- Author: AI Assistant
-- Date: 2025-10-27

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow all operations on decks" ON public.decks;
DROP POLICY IF EXISTS "Allow all operations on flashcards" ON public.flashcards;

-- ============================================================================
-- DECKS TABLE POLICIES
-- ============================================================================

-- Users can view only their own decks
CREATE POLICY "Users can view their own decks"
    ON public.decks
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own decks
CREATE POLICY "Users can create their own decks"
    ON public.decks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update only their own decks
CREATE POLICY "Users can update their own decks"
    ON public.decks
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete only their own decks
CREATE POLICY "Users can delete their own decks"
    ON public.decks
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- FLASHCARDS TABLE POLICIES
-- ============================================================================

-- Users can view only their own flashcards
CREATE POLICY "Users can view their own flashcards"
    ON public.flashcards
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own flashcards
CREATE POLICY "Users can create their own flashcards"
    ON public.flashcards
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update only their own flashcards
CREATE POLICY "Users can update their own flashcards"
    ON public.flashcards
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete only their own flashcards
CREATE POLICY "Users can delete their own flashcards"
    ON public.flashcards
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Users can view their own decks" ON public.decks IS 
    'Restricts SELECT queries to decks owned by the authenticated user';

COMMENT ON POLICY "Users can create their own decks" ON public.decks IS 
    'Allows INSERT operations only when user_id matches authenticated user';

COMMENT ON POLICY "Users can update their own decks" ON public.decks IS 
    'Allows UPDATE operations only on decks owned by the authenticated user';

COMMENT ON POLICY "Users can delete their own decks" ON public.decks IS 
    'Allows DELETE operations only on decks owned by the authenticated user';

COMMENT ON POLICY "Users can view their own flashcards" ON public.flashcards IS 
    'Restricts SELECT queries to flashcards owned by the authenticated user';

COMMENT ON POLICY "Users can create their own flashcards" ON public.flashcards IS 
    'Allows INSERT operations only when user_id matches authenticated user';

COMMENT ON POLICY "Users can update their own flashcards" ON public.flashcards IS 
    'Allows UPDATE operations only on flashcards owned by the authenticated user';

COMMENT ON POLICY "Users can delete their own flashcards" ON public.flashcards IS 
    'Allows DELETE operations only on flashcards owned by the authenticated user';

