/**
 * Flashcard Detail API Endpoint
 * 
 * Handles operations on a single flashcard:
 * - GET /api/flashcards/:id - Get flashcard details
 * - PATCH /api/flashcards/:id - Update a flashcard
 * - DELETE /api/flashcards/:id - Delete a flashcard
 */

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { FlashcardService } from '../../../lib/services/flashcard.service';
import type { ErrorResponse } from '../../../types';

export const prerender = false;

const updateFlashcardSchema = z.object({
  front_content: z.string().trim().min(1, 'Front content cannot be empty').max(1000).optional(),
  back_content: z.string().trim().min(1, 'Back content cannot be empty').max(2000).optional(),
});

/**
 * PATCH - Update a flashcard
 */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    const supabase = locals.supabase;
    const flashcardId = params.id;

    if (!flashcardId) {
      const errorResponse: ErrorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Flashcard ID is required',
        },
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
    const validationResult = updateFlashcardSchema.safeParse(body);
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

    // For simplified version without auth, use test user
    const TEST_USER_ID = '11111111-1111-1111-1111-111111111111';
    const userId = TEST_USER_ID;

    // Update the flashcard
    const flashcardService = new FlashcardService(supabase);
    const updatedFlashcard = await flashcardService.updateFlashcard(
      flashcardId, 
      userId, 
      validationResult.data
    );

    console.log('[FLASHCARDS] Updated flashcard:', flashcardId);

    return new Response(JSON.stringify(updatedFlashcard), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error in PATCH /api/flashcards/:id:', error);
    
    const errorResponse: ErrorResponse = {
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Failed to update flashcard',
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * DELETE - Delete a flashcard
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const supabase = locals.supabase;
    const flashcardId = params.id;

    if (!flashcardId) {
      const errorResponse: ErrorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Flashcard ID is required',
        },
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // For simplified version without auth, use test user
    const TEST_USER_ID = '11111111-1111-1111-1111-111111111111';
    const userId = TEST_USER_ID;

    // Delete the flashcard
    const flashcardService = new FlashcardService(supabase);
    await flashcardService.deleteFlashcard(flashcardId, userId);

    console.log('[FLASHCARDS] Deleted flashcard:', flashcardId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error in DELETE /api/flashcards/:id:', error);
    
    const errorResponse: ErrorResponse = {
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Failed to delete flashcard',
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

