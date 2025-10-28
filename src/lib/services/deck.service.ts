/**
 * Deck Service
 *
 * Handles deck-related business logic including ownership verification.
 * Uses Supabase RLS (Row Level Security) to ensure users can only access their own decks.
 */

import type { SupabaseClient } from "../../db/supabase.client";
import { NotFoundError } from "../errors/api-errors";

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
      .from("decks")
      .select("id")
      .eq("id", deckId)
      .eq("user_id", userId)
      .single();

    // If error or no data returned, either deck doesn't exist or user doesn't own it
    if (error || !data) {
      throw new NotFoundError("Deck not found or access denied");
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
      .from("decks")
      .select("*")
      .eq("id", deckId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      throw new NotFoundError("Deck not found or access denied");
    }

    return data;
  }

  /**
   * Gets all decks for a user with flashcard count
   *
   * @param userId - UUID of the user
   * @returns Array of decks with flashcard counts
   *
   * Note: Uses RLS policies to automatically filter by user_id.
   */
  async getAllDecks(userId: string) {
    const { data, error } = await this.supabase
      .from("decks")
      .select(
        `
        *,
        flashcards:flashcards(count)
      `
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching decks:", error);
      throw new Error("Could not fetch decks");
    }

    // Transform the data to include flashcard_count
    return (data || []).map((deck) => ({
      ...deck,
      flashcard_count: deck.flashcards?.[0]?.count || 0,
      flashcards: undefined, // Remove the raw flashcards object
    }));
  }

  /**
   * Creates a new deck for a user
   *
   * @param name - Name of the deck
   * @param description - Optional description
   * @param userId - UUID of the user
   * @returns The newly created deck
   */
  async createDeck(name: string, description: string | null, userId: string) {
    const { data, error } = await this.supabase
      .from("decks")
      .insert({
        name,
        description,
        user_id: userId,
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Error creating deck:", error);
      throw new Error("Could not create deck");
    }

    return data;
  }
}
