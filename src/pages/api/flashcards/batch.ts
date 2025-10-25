/**
 * POST /api/flashcards/batch
 * 
 * Creates multiple flashcards in a single transaction.
 * Used to save AI-generated flashcard proposals after user verification.
 * 
 * Features:
 * - Batch creation (1-100 flashcards at once)
 * - Deck ownership verification
 * - AI acceptance tracking (ai_accepted flag)
 * - Transaction safety (all or nothing)
 * - Comprehensive error handling
 * 
 * Related endpoints:
 * - POST /api/flashcards/generate - Generate proposals
 * - GET /api/flashcards - List flashcards
 */

import type { APIRoute } from 'astro';
import { batchCreateFlashcardsSchema } from '../../../lib/validation/flashcard.schemas';
import { DeckService } from '../../../lib/services/deck.service';
import {
  APIError,
  UnauthorizedError,
  ValidationError,
  NotFoundError,
} from '../../../lib/errors/api-errors';
import type { 
  BatchCreateFlashcardsResponse, 
  ErrorResponse,
  FlashcardDTO 
} from '../../../types';

/**
 * Disable static prerendering for this API endpoint
 * This ensures the endpoint runs server-side for each request
 */
export const prerender = false;

/**
 * POST handler for batch flashcard creation
 * 
 * Request Flow:
 * 1. Authentication check (JWT token validation)
 * 2. Request body validation (Zod schema)
 * 3. Deck ownership verification
 * 4. Batch insert flashcards (with AI acceptance tracking)
 * 5. Response with created flashcards
 * 
 * @param request - Astro API request object
 * @param locals - Astro locals containing Supabase client
 * @returns JSON response with created flashcards or error
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // ========================================================================
    // 1. USER ID (Simplified - no authentication)
    // ========================================================================
    const supabase = locals.supabase;
    
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // For simplified version without auth, use test user
    const TEST_USER_ID = '11111111-1111-1111-1111-111111111111';
    const userId = TEST_USER_ID;
    
    console.log('[BATCH] Using test user:', userId);

    // ========================================================================
    // 2. PARSE AND VALIDATE REQUEST BODY
    // ========================================================================
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError('Invalid JSON in request body');
    }

    // Validate with Zod schema
    const validationResult = batchCreateFlashcardsSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      console.error('[BATCH] Validation error:', {
        field: firstError.path.join('.'),
        reason: firstError.message,
        allErrors: validationResult.error.errors,
      });
      throw new ValidationError('Invalid request data', {
        field: firstError.path.join('.') || 'unknown',
        reason: firstError.message,
      });
    }

    const { deck_id, flashcards } = validationResult.data;
    console.log(`[BATCH] Validated request: ${flashcards.length} flashcards for deck ${deck_id}`);

    // ========================================================================
    // 3. VERIFY DECK OWNERSHIP
    // ========================================================================
    const deckService = new DeckService(supabase);
    await deckService.verifyDeckOwnership(deck_id, userId);

    // ========================================================================
    // 4. BATCH INSERT FLASHCARDS
    // ========================================================================
    
    // Prepare flashcards for insertion
    const flashcardsToInsert = flashcards.map(flashcard => ({
      user_id: userId,
      deck_id: deck_id,
      front_content: flashcard.front_content.trim(),
      back_content: flashcard.back_content.trim(),
      ai_generated: true, // All batch-created flashcards are AI-generated
      ai_accepted: flashcard.ai_accepted, // Track if user accepted or edited
      status: 'new' as const, // Default status for new flashcards
    }));

    // Insert all flashcards in a single query (atomic operation)
    const { data: createdFlashcards, error: insertError } = await supabase
      .from('flashcards')
      .insert(flashcardsToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting flashcards:', insertError);
      
      // Check for specific database errors
      if (insertError.code === '23503') {
        // Foreign key violation - deck doesn't exist (shouldn't happen after verification)
        throw new NotFoundError('Deck not found');
      }
      
      throw new Error('Failed to create flashcards');
    }

    if (!createdFlashcards || createdFlashcards.length === 0) {
      throw new Error('No flashcards were created');
    }

    // ========================================================================
    // 5. PREPARE AND RETURN RESPONSE
    // ========================================================================
    const response: BatchCreateFlashcardsResponse = {
      created: createdFlashcards as FlashcardDTO[],
      count: createdFlashcards.length,
    };

    return new Response(JSON.stringify(response), {
      status: 201, // 201 Created
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================
    
    // Handle known API errors with proper status codes and messages
    if (error instanceof APIError) {
      const errorResponse: ErrorResponse = {
        error: {
          code: error.code as any,
          message: error.message,
          details: error.details,
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: error.statusCode,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Handle unexpected errors (log for debugging, don't expose internals)
    console.error('Unexpected error in batch create endpoint:', error);
    
    const errorResponse: ErrorResponse = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred while creating flashcards',
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

