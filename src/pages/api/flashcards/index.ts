import type { APIRoute } from 'astro';
import { z } from 'zod';
import { DeckService } from '../../../lib/services/deck.service';
import { FlashcardService } from '../../../lib/services/flashcard.service';
import { 
  APIError, 
  UnauthorizedError, 
  ValidationError 
} from '../../../lib/errors/api-errors';
import type { ErrorResponse } from '../../../types';

export const prerender = false;

const createFlashcardSchema = z.object({
  deck_id: z.string().uuid('Invalid deck ID format'),
  front_content: z.string().trim().min(1, 'Front content cannot be empty').max(1000),
  back_content: z.string().trim().min(1, 'Back content cannot be empty').max(2000),
});

/**
 * POST handler for creating a single flashcard
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // ========================================================================
    // 1. AUTHENTICATION
    // ========================================================================
    if (!locals.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const supabase = locals.supabase;
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    const userId = locals.user.id;

    // ========================================================================
    // 2. PARSE AND VALIDATE REQUEST BODY
    // ========================================================================
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError('Invalid JSON in request body');
    }

    const validationResult = createFlashcardSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      throw new ValidationError('Invalid request data', {
        field: firstError.path.join('.'),
        reason: firstError.message,
      });
    }
    const { deck_id, front_content, back_content } = validationResult.data;

    // ========================================================================
    // 3. VERIFY DECK OWNERSHIP
    // ========================================================================
    const deckService = new DeckService(supabase);
    await deckService.verifyDeckOwnership(deck_id, userId);

    // ========================================================================
    // 4. CREATE FLASHCARD
    // ========================================================================
    const flashcardService = new FlashcardService(supabase);
    const newFlashcard = await flashcardService.createFlashcard({
      deck_id,
      user_id: userId,
      front_content,
      back_content,
      ai_generated: true, // Assuming proposals are from AI
    });

    // ========================================================================
    // 5. RETURN RESPONSE
    // ========================================================================
    return new Response(JSON.stringify(newFlashcard), {
      status: 201, // 201 Created
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
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
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.error('Unexpected error in create flashcard endpoint:', error);
    const errorResponse: ErrorResponse = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
