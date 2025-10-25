/**
 * POST /api/flashcards/batch-demo
 * 
 * DEMO VERSION - No authentication required, no database save
 * Simulates batch flashcard creation for testing purposes.
 * 
 * ⚠️ WARNING: This is for testing only! Remove in production.
 * Production should use /api/flashcards/batch with proper auth.
 */

import type { APIRoute } from 'astro';
import { batchCreateFlashcardsSchema } from '../../../lib/validation/flashcard.schemas';
import {
  APIError,
  ValidationError,
} from '../../../lib/errors/api-errors';
import type { BatchCreateFlashcardsResponse, ErrorResponse } from '../../../types';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // ========================================================================
    // 1. PARSE AND VALIDATE REQUEST BODY
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
      throw new ValidationError('Invalid request data', {
        field: firstError.path.join('.') || 'unknown',
        reason: firstError.message,
      });
    }

    const { deck_id, flashcards } = validationResult.data;

    console.log('[DEMO] Batch create request:');
    console.log('[DEMO] - deck_id:', deck_id);
    console.log('[DEMO] - flashcards count:', flashcards.length);
    console.log('[DEMO] - flashcards:', JSON.stringify(flashcards, null, 2));

    // ========================================================================
    // 2. SIMULATE DATABASE INSERT (just create mock flashcards)
    // ========================================================================
    
    // Simulate a small delay like a real API would have
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create mock flashcard DTOs
    const mockCreatedFlashcards = flashcards.map((flashcard, index) => ({
      id: `${Date.now()}${index}`.padStart(36, '0').slice(0, 8) + '-0000-0000-0000-' + `${Date.now()}${index}`.padStart(12, '0').slice(-12),
      user_id: '00000000-0000-0000-0000-000000000000',
      deck_id: deck_id,
      front_content: flashcard.front_content,
      back_content: flashcard.back_content,
      status: 'new' as const,
      ai_generated: true,
      ai_accepted: flashcard.ai_accepted,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    console.log('[DEMO] Created', mockCreatedFlashcards.length, 'mock flashcards');

    // ========================================================================
    // 3. RETURN RESPONSE
    // ========================================================================
    const response: BatchCreateFlashcardsResponse = {
      created: mockCreatedFlashcards,
      count: mockCreatedFlashcards.length,
    };

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================
    
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

    console.error('[DEMO] Unexpected error:', error);
    
    const errorResponse: ErrorResponse = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
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

