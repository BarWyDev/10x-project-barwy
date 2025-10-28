/**
 * Deck Detail API Endpoint
 *
 * Handles operations on a single deck:
 * - GET /api/decks/:id - Get deck details
 * - DELETE /api/decks/:id - Delete a deck and all its flashcards
 */

import type { APIRoute } from "astro";
import { DeckService } from "../../../lib/services/deck.service";
import type { ErrorResponse } from "../../../types";

export const prerender = false;

/**
 * DELETE - Delete a deck and all its flashcards
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Check authentication
    if (!locals.user) {
      const errorResponse: ErrorResponse = {
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = locals.supabase;
    const userId = locals.user.id;
    const deckId = params.id;

    if (!deckId) {
      const errorResponse: ErrorResponse = {
        error: {
          code: "VALIDATION_ERROR",
          message: "Deck ID is required",
        },
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify ownership
    const deckService = new DeckService(supabase);
    await deckService.verifyDeckOwnership(deckId, userId);

    // Delete flashcards first (cascading should handle this, but explicit is better)
    const { error: flashcardsError } = await supabase
      .from("flashcards")
      .delete()
      .eq("deck_id", deckId)
      .eq("user_id", userId);

    if (flashcardsError) {
      console.error("Error deleting flashcards:", flashcardsError);
      throw new Error("Failed to delete flashcards");
    }

    // Delete the deck
    const { error: deckError } = await supabase.from("decks").delete().eq("id", deckId).eq("user_id", userId);

    if (deckError) {
      console.error("Error deleting deck:", deckError);
      throw new Error("Failed to delete deck");
    }

    console.log("[DECKS] Deleted deck:", deckId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/decks/:id:", error);

    const errorResponse: ErrorResponse = {
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to delete deck",
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
