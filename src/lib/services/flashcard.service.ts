import type { SupabaseClient, Flashcard } from '../db/supabase.client';
import { APIError } from '../errors/api-errors';

type FlashcardInsert = Omit<Flashcard, 'id' | 'created_at' | 'updated_at' | 'last_reviewed_at' | 'due_at' | 'interval' | 'ease_factor' | 'repetitions'>;

export class FlashcardService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Creates a single flashcard in the database
   * @param flashcardData - The data for the new flashcard
   * @returns The newly created flashcard
   * @throws {APIError} If the flashcard could not be created
   */
  async createFlashcard(flashcardData: FlashcardInsert): Promise<Flashcard> {
    const { data, error } = await this.supabase
      .from('flashcards')
      .insert(flashcardData)
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating flashcard:', error);
      throw new APIError(500, 'DATABASE_ERROR', 'Could not create flashcard');
    }

    return data;
  }

  /**
   * Gets all flashcards for a user, optionally filtered by deck
   * 
   * @param userId - UUID of the user
   * @param deckId - Optional UUID of the deck to filter by
   * @returns Array of flashcards with deck information
   * 
   * Note: Uses RLS policies to automatically filter by user_id.
   */
  async getAllFlashcards(userId: string, deckId?: string) {
    let query = this.supabase
      .from('flashcards')
      .select(`
        *,
        deck:decks(id, name)
      `)
      .eq('user_id', userId);

    if (deckId) {
      query = query.eq('deck_id', deckId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching flashcards:', error);
      throw new APIError(500, 'DATABASE_ERROR', 'Could not fetch flashcards');
    }

    return data || [];
  }

  /**
   * Updates a flashcard
   * 
   * @param flashcardId - UUID of the flashcard to update
   * @param userId - UUID of the user (for verification)
   * @param updates - Partial flashcard data to update
   * @returns Updated flashcard
   * @throws {APIError} If the flashcard could not be updated
   */
  async updateFlashcard(
    flashcardId: string, 
    userId: string, 
    updates: { front_content?: string; back_content?: string }
  ): Promise<Flashcard> {
    const { data, error } = await this.supabase
      .from('flashcards')
      .update(updates)
      .eq('id', flashcardId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating flashcard:', error);
      throw new APIError(500, 'DATABASE_ERROR', 'Could not update flashcard');
    }

    return data;
  }

  /**
   * Deletes a flashcard
   * 
   * @param flashcardId - UUID of the flashcard to delete
   * @param userId - UUID of the user (for verification)
   * @throws {APIError} If the flashcard could not be deleted
   */
  async deleteFlashcard(flashcardId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('flashcards')
      .delete()
      .eq('id', flashcardId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting flashcard:', error);
      throw new APIError(500, 'DATABASE_ERROR', 'Could not delete flashcard');
    }
  }
}
