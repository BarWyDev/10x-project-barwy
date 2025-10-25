/**
 * GET /api/decks - List all decks
 * POST /api/decks - Create a new deck
 * 
 * SIMPLIFIED VERSION - No authentication required
 * Works with RLS policies disabled (allow all)
 */

import type { APIRoute } from 'astro';
import { z } from 'zod';
import type { DeckDTO, CreateDeckCommand, ErrorResponse } from '../../../types';

export const prerender = false;

// Validation schema for creating a deck
const createDeckSchema = z.object({
  name: z.string().trim().min(1, 'Deck name is required').max(100, 'Deck name too long'),
  description: z.string().trim().max(500, 'Description too long').optional(),
  user_id: z.string().uuid('Invalid user ID').optional(), // Optional for now
});

/**
 * GET - List all decks
 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    const supabase = locals.supabase;

    // Fetch all decks with flashcard count
    const { data: decks, error } = await supabase
      .from('decks')
      .select('*, flashcards(count)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching decks:', error);
      throw new Error('Failed to fetch decks');
    }

    // Transform to DeckDTO format with flashcard_count
    const deckDTOs: DeckDTO[] = (decks || []).map((deck: any) => ({
      id: deck.id,
      user_id: deck.user_id,
      name: deck.name,
      description: deck.description,
      created_at: deck.created_at,
      updated_at: deck.updated_at,
      flashcard_count: deck.flashcards?.[0]?.count || 0,
    }));

    return new Response(JSON.stringify(deckDTOs), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/decks:', error);
    
    const errorResponse: ErrorResponse = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch decks',
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * POST - Create a new deck
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const supabase = locals.supabase;

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      const errorResponse: ErrorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid JSON in request body',
        },
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate with Zod
    const validationResult = createDeckSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      const errorResponse: ErrorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: {
            field: firstError.path.join('.') || 'unknown',
            reason: firstError.message,
          },
        },
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { name, description, user_id } = validationResult.data;

    // Create deck in database
    // For simplified version without auth, use test user_id if not provided
    const TEST_USER_ID = '11111111-1111-1111-1111-111111111111';
    const deckData = {
      name: name.trim(),
      description: description?.trim() || null,
      user_id: user_id || TEST_USER_ID, // Test user for no-auth mode
    };

    const { data: newDeck, error: insertError } = await supabase
      .from('decks')
      .insert(deckData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating deck:', insertError);
      
      // Check for specific errors
      if (insertError.code === '23505') {
        const errorResponse: ErrorResponse = {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'A deck with this name already exists',
          },
        };
        return new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      throw new Error('Failed to create deck');
    }

    if (!newDeck) {
      throw new Error('No deck was created');
    }

    console.log('[DECKS] Created new deck:', newDeck.id, newDeck.name);

    // Return created deck with flashcard_count = 0
    const deckDTO: DeckDTO = {
      ...newDeck,
      flashcard_count: 0,
    };

    return new Response(JSON.stringify(deckDTO), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error in POST /api/decks:', error);
    
    const errorResponse: ErrorResponse = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create deck',
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

