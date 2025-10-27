/**
 * POST /api/flashcards/generate
 * 
 * Generates flashcard proposals from provided text using AI.
 * Does NOT save flashcards to database - returns proposals for user review.
 * 
 * Features:
 * - AI-powered flashcard generation (OpenAI GPT-4o-mini)
 * - Daily limit enforcement (100 generations per user)
 * - Deck ownership verification
 * - Comprehensive error handling
 * 
 * Related endpoints:
 * - POST /api/flashcards/batch - Save accepted proposals
 * - GET /api/users/me/limits - Check available limits
 */

import type { APIRoute } from 'astro';
import { generateFlashcardsSchema } from '../../../lib/validation/flashcard.schemas';
import { DeckService } from '../../../lib/services/deck.service';
import { UsageService } from '../../../lib/services/usage.service';
import { AIService } from '../../../lib/services/ai.service';
import {
  APIError,
  ValidationError,
} from '../../../lib/errors/api-errors';
import type { GenerateFlashcardsResponse, ErrorResponse } from '../../../types';

/**
 * Disable static prerendering for this API endpoint
 * This ensures the endpoint runs server-side for each request
 */
export const prerender = false;

/**
 * POST handler for flashcard generation
 * 
 * Request Flow:
 * 1. Authentication check (JWT token validation)
 * 2. Request body validation (Zod schema)
 * 3. Deck ownership verification
 * 4. Daily usage limit check
 * 5. AI flashcard generation
 * 6. Response with proposals and usage info
 * 
 * @param request - Astro API request object
 * @param locals - Astro locals containing Supabase client
 * @returns JSON response with flashcard proposals or error
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // ========================================================================
    // 1. AUTHENTICATION
    // ========================================================================
    if (!locals.user) {
      const errorResponse: ErrorResponse = {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = locals.supabase;
    
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const userId = locals.user.id;
    
    console.log('[GENERATE] User:', userId);

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
    const validationResult = generateFlashcardsSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      throw new ValidationError('Invalid request data', {
        field: firstError.path.join('.') || 'unknown',
        reason: firstError.message,
      });
    }

    const { deck_id, text } = validationResult.data;

    // ========================================================================
    // 3. VERIFY DECK OWNERSHIP
    // ========================================================================
    const deckService = new DeckService(supabase);
    await deckService.verifyDeckOwnership(deck_id, userId);

    // ========================================================================
    // 4. CHECK DAILY USAGE LIMITS
    // ========================================================================
    const usageService = new UsageService(supabase);
    const { canGenerate, usageInfo } = await usageService.checkAndGetUsage(userId);

    if (!canGenerate) {
      usageService.throwLimitExceeded(usageInfo.total_generated_today);
    }

    // ========================================================================
    // 5. GENERATE FLASHCARDS USING AI
    // ========================================================================
    const aiService = new AIService();
    const proposals = await aiService.generateFlashcards(text);

    // ========================================================================
    // 6. PREPARE AND RETURN RESPONSE
    // ========================================================================
    const response: GenerateFlashcardsResponse = {
      proposals,
      usage: {
        generated_count: proposals.length,
        total_generated_today: usageInfo.total_generated_today,
        daily_limit: usageInfo.daily_limit,
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
    
    // Handle known API errors with proper status codes and messages
    if (error instanceof APIError) {
      const errorResponse: ErrorResponse = {
        error: {
          code: error.code as any,
          message: error.message,
          details: error.details as any,
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
    console.error('Unexpected error in generate endpoint:', error);
    
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

