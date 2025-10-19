/**
 * Deck Service
 * 
 * Handles deck-related business logic including ownership verification.
 * Uses Supabase RLS (Row Level Security) to ensure users can only access their own decks.
 */

import type { SupabaseClient } from '../../db/supabase.client';
import { NotFoundError } from '../errors/api-errors';

export class DeckService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Verifies that a deck exists and belongs to the specified user
   * 
   * @param deckId - UUID of the deck to verify
   * @param userId - UUID of the user who should own the deck
   * @throws {NotFoundError} If deck doesn't exist or user doesn't have access
   * 
   * Note: Uses RLS policies, so the query will automatically filter by user_id.
   * This means we don't reveal whether a deck exists if the user doesn't own it.
   */
  async verifyDeckOwnership(deckId: string, userId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('decks')
      .select('id')
      .eq('id', deckId)
      .eq('user_id', userId)
      .single();

    // If error or no data returned, either deck doesn't exist or user doesn't own it
    if (error || !data) {
      throw new NotFoundError('Deck not found or access denied');
    }
  }

  /**
   * Gets a deck by ID with ownership verification
   * 
   * @param deckId - UUID of the deck to retrieve
   * @param userId - UUID of the user who should own the deck
   * @returns The deck entity
   * @throws {NotFoundError} If deck doesn't exist or user doesn't have access
   */
  async getDeckById(deckId: string, userId: string) {
    const { data, error } = await this.supabase
      .from('decks')
      .select('*')
      .eq('id', deckId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundError('Deck not found or access denied');
    }

    return data;
  }
}

