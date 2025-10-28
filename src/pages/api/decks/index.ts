/**
 * GET /api/decks - List all decks for authenticated user
 * POST /api/decks - Create a new deck
 *
 * Requires authentication. Uses RLS policies to ensure data isolation.
 */

import type { APIRoute } from "astro";
import { z } from "zod";
import type { DeckDTO, ErrorResponse } from "../../../types";

export const prerender = false;

// Validation schema for creating a deck
const createDeckSchema = z.object({
  name: z.string().trim().min(1, "Deck name is required").max(100, "Deck name too long"),
  description: z.string().trim().max(500, "Description too long").optional(),
});

/**
 * GET - List all decks for the authenticated user
 */
export const GET: APIRoute = async ({ locals }) => {
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

    // Fetch user's decks with flashcard count
    // RLS policies will automatically filter by user_id
    const { data: decks, error } = await supabase
      .from("decks")
      .select("*, flashcards(count)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching decks:", error);
      throw new Error("Failed to fetch decks");
    }

    // Transform to DeckDTO format with flashcard_count
    const deckDTOs: DeckDTO[] = (decks || []).map(
      (deck: {
        id: string;
        user_id: string;
        name: string;
        description: string | null;
        created_at: string;
        updated_at: string;
        flashcards?: { count: number }[];
      }) => ({
        id: deck.id,
        user_id: deck.user_id,
        name: deck.name,
        description: deck.description,
        created_at: deck.created_at,
        updated_at: deck.updated_at,
        flashcard_count: deck.flashcards?.[0]?.count || 0,
      })
    );

    return new Response(JSON.stringify(deckDTOs), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/decks:", error);

    const errorResponse: ErrorResponse = {
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch decks",
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * POST - Create a new deck
 */
export const POST: APIRoute = async ({ request, locals }) => {
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

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      const errorResponse: ErrorResponse = {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid JSON in request body",
        },
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate with Zod
    const validationResult = createDeckSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      const errorResponse: ErrorResponse = {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: {
            field: firstError.path.join(".") || "unknown",
            reason: firstError.message,
          },
        },
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { name, description } = validationResult.data;

    // Create deck in database for authenticated user
    const deckData = {
      name: name.trim(),
      description: description?.trim() || null,
      user_id: userId,
    };

    const { data: newDeck, error: insertError } = await supabase.from("decks").insert(deckData).select().single();

    if (insertError) {
      console.error("Error creating deck:", insertError);

      // Check for specific errors
      if (insertError.code === "23505") {
        const errorResponse: ErrorResponse = {
          error: {
            code: "VALIDATION_ERROR",
            message: "A deck with this name already exists",
          },
        };
        return new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      throw new Error("Failed to create deck");
    }

    if (!newDeck) {
      throw new Error("No deck was created");
    }

    console.log("[DECKS] Created new deck:", newDeck.id, newDeck.name);

    // Return created deck with flashcard_count = 0
    const deckDTO: DeckDTO = {
      ...newDeck,
      flashcard_count: 0,
    };

    return new Response(JSON.stringify(deckDTO), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error in POST /api/decks:", error);

    const errorResponse: ErrorResponse = {
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to create deck",
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
