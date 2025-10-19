/**
 * Zod Validation Schemas for Flashcard Operations
 * 
 * These schemas validate request data for flashcard-related API endpoints.
 * All schemas use Zod for runtime type checking and validation.
 */

import { z } from 'zod';

/**
 * Schema for Generate Flashcards Command
 * Used in: POST /api/flashcards/generate
 * 
 * Validates:
 * - deck_id: Must be a valid UUID
 * - text: Must be between 50 and 5000 characters (after trimming)
 */
export const generateFlashcardsSchema = z.object({
  deck_id: z.string().uuid('Invalid deck ID format'),
  text: z
    .string()
    .trim()
    .min(50, 'Text must be at least 50 characters long')
    .max(5000, 'Text must not exceed 5000 characters'),
});

/**
 * Inferred TypeScript type from generateFlashcardsSchema
 * Used for type-safe input validation
 */
export type GenerateFlashcardsInput = z.infer<typeof generateFlashcardsSchema>;

/**
 * Schema for Batch Create Flashcards Command
 * Used in: POST /api/flashcards/batch
 * 
 * Validates:
 * - deck_id: Must be a valid UUID
 * - flashcards: Array of flashcard items (min 1, max 100)
 *   - front_content: Required, 1-1000 characters
 *   - back_content: Required, 1-2000 characters
 *   - ai_accepted: Required boolean flag
 */
export const batchCreateFlashcardsSchema = z.object({
  deck_id: z.string().uuid('Invalid deck ID format'),
  flashcards: z
    .array(
      z.object({
        front_content: z
          .string()
          .trim()
          .min(1, 'Front content is required')
          .max(1000, 'Front content must not exceed 1000 characters'),
        back_content: z
          .string()
          .trim()
          .min(1, 'Back content is required')
          .max(2000, 'Back content must not exceed 2000 characters'),
        ai_accepted: z.boolean(),
      })
    )
    .min(1, 'At least one flashcard is required')
    .max(100, 'Cannot create more than 100 flashcards at once'),
});

/**
 * Inferred TypeScript type from batchCreateFlashcardsSchema
 */
export type BatchCreateFlashcardsInput = z.infer<typeof batchCreateFlashcardsSchema>;

/**
 * Schema for Create Single Flashcard Command
 * Used in: POST /api/flashcards
 * 
 * Validates:
 * - deck_id: Must be a valid UUID
 * - front_content: Required, 1-1000 characters
 * - back_content: Required, 1-2000 characters
 */
export const createFlashcardSchema = z.object({
  deck_id: z.string().uuid('Invalid deck ID format'),
  front_content: z
    .string()
    .trim()
    .min(1, 'Front content is required')
    .max(1000, 'Front content must not exceed 1000 characters'),
  back_content: z
    .string()
    .trim()
    .min(1, 'Back content is required')
    .max(2000, 'Back content must not exceed 2000 characters'),
});

/**
 * Inferred TypeScript type from createFlashcardSchema
 */
export type CreateFlashcardInput = z.infer<typeof createFlashcardSchema>;

/**
 * Schema for Update Flashcard Command
 * Used in: PATCH /api/flashcards/:id
 * 
 * Validates partial updates - all fields are optional but at least one must be provided
 */
export const updateFlashcardSchema = z
  .object({
    front_content: z
      .string()
      .trim()
      .min(1, 'Front content cannot be empty')
      .max(1000, 'Front content must not exceed 1000 characters')
      .optional(),
    back_content: z
      .string()
      .trim()
      .min(1, 'Back content cannot be empty')
      .max(2000, 'Back content must not exceed 2000 characters')
      .optional(),
    status: z.enum(['new', 'learning', 'review', 'relearning']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

/**
 * Inferred TypeScript type from updateFlashcardSchema
 */
export type UpdateFlashcardInput = z.infer<typeof updateFlashcardSchema>;

/**
 * Schema for Record Review Command
 * Used in: POST /api/flashcards/:id/review
 * 
 * Validates:
 * - rating: Must be one of the valid review ratings
 */
export const recordReviewSchema = z.object({
  rating: z.enum(['again', 'hard', 'good', 'easy'], {
    errorMap: () => ({ message: 'Rating must be one of: again, hard, good, easy' }),
  }),
});

/**
 * Inferred TypeScript type from recordReviewSchema
 */
export type RecordReviewInput = z.infer<typeof recordReviewSchema>;

