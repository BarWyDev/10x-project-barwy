/**
 * POST /api/flashcards/generate-demo
 * 
 * DEMO VERSION - No authentication required
 * Generates flashcard proposals from provided text using AI.
 * 
 * ⚠️ WARNING: This is for testing only! Remove in production.
 * Production should use /api/flashcards/generate with proper auth.
 */

import type { APIRoute } from 'astro';
import { generateFlashcardsSchema } from '../../../lib/validation/flashcard.schemas';
import { AIService } from '../../../lib/services/ai.service';
import {
  APIError,
  ValidationError,
} from '../../../lib/errors/api-errors';
import type { GenerateFlashcardsResponse, ErrorResponse } from '../../../types';

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

    // Validate with Zod schema (only text, deck_id is not used in demo)
    const validationResult = generateFlashcardsSchema.safeParse({
      deck_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID for validation
      text: (body as any).text,
    });
    
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      throw new ValidationError('Invalid request data', {
        field: firstError.path.join('.') || 'unknown',
        reason: firstError.message,
      });
    }

    const { text } = validationResult.data;

    // ========================================================================
    // 2. GENERATE FLASHCARDS USING AI
    // ========================================================================
    console.log('[DEMO] Generating flashcards from text:', text.substring(0, 100) + '...');
    
    const aiService = new AIService();
    const proposals = await aiService.generateFlashcards(text);

    console.log('[DEMO] Generated', proposals.length, 'flashcards');

    // ========================================================================
    // 3. RETURN RESPONSE (Mock usage info for demo)
    // ========================================================================
    const response: GenerateFlashcardsResponse = {
      proposals,
      usage: {
        generated_count: proposals.length,
        total_generated_today: 10, // Mock value
        daily_limit: 100,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
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

