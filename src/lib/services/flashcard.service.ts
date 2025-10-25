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
}
