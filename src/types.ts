/**
 * DTO (Data Transfer Object) and Command Model Type Definitions
 *
 * This file contains TypeScript types for data transfer objects and command models
 * used throughout the API. All types are derived from the database schema types
 * defined in src/db/database.types.ts to ensure type safety and consistency.
 */

import type { Tables, TablesInsert, TablesUpdate, Enums } from "./db/database.types";

// ============================================================================
// BASE ENTITY TYPES (derived from database schema)
// ============================================================================

/**
 * Deck entity as stored in the database
 * Derived from: Database.public.Tables.decks.Row
 */
export type DeckEntity = Tables<"decks">;

/**
 * Flashcard entity as stored in the database
 * Derived from: Database.public.Tables.flashcards.Row
 */
export type FlashcardEntity = Tables<"flashcards">;

/**
 * Flashcard status enum
 * Derived from: Database.public.Enums.flashcard_status
 */
export type FlashcardStatus = Enums<"flashcard_status">;

// ============================================================================
// PAGINATION TYPES
// ============================================================================

/**
 * Pagination metadata included in paginated responses
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

/**
 * Generic paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// ============================================================================
// DECK DTOs AND COMMANDS
// ============================================================================

/**
 * Deck DTO (Data Transfer Object)
 * Extended from DeckEntity with additional computed fields
 * Used in: GET /api/decks, GET /api/decks/:id
 */
export interface DeckDTO extends DeckEntity {
  flashcard_count: number;
}

/**
 * Deck DTO without the flashcard_count field
 * Used in: POST /api/decks, PATCH /api/decks/:id responses
 */
export type DeckWithoutCountDTO = Omit<DeckDTO, "flashcard_count">;

/**
 * Create Deck Command
 * Used in: POST /api/decks request body
 * Derived from: TablesInsert<'decks'> excluding auto-generated and system fields
 */
export type CreateDeckCommand = Pick<TablesInsert<"decks">, "name" | "description">;

/**
 * Update Deck Command
 * Used in: PATCH /api/decks/:id request body
 * Derived from: TablesUpdate<'decks'> allowing partial updates of name and description
 */
export type UpdateDeckCommand = Pick<TablesUpdate<"decks">, "name" | "description">;

/**
 * Paginated list of decks
 * Used in: GET /api/decks response
 */
export type PaginatedDecksResponse = PaginatedResponse<DeckDTO>;

// ============================================================================
// FLASHCARD DTOs AND COMMANDS
// ============================================================================

/**
 * Flashcard DTO (Data Transfer Object)
 * Directly mapped from FlashcardEntity
 * Used in: GET /api/flashcards, GET /api/flashcards/:id, POST /api/flashcards, PATCH /api/flashcards/:id
 */
export type FlashcardDTO = FlashcardEntity;

/**
 * Create Flashcard Command (Manual)
 * Used in: POST /api/flashcards request body
 * Derived from: TablesInsert<'flashcards'> with only user-provided fields
 */
export type CreateFlashcardCommand = Pick<TablesInsert<"flashcards">, "deck_id" | "front_content" | "back_content">;

/**
 * Update Flashcard Command
 * Used in: PATCH /api/flashcards/:id request body
 * Derived from: TablesUpdate<'flashcards'> allowing partial updates of content and status
 */
export type UpdateFlashcardCommand = Pick<TablesUpdate<"flashcards">, "front_content" | "back_content" | "status">;

/**
 * Paginated list of flashcards
 * Used in: GET /api/flashcards response
 */
export type PaginatedFlashcardsResponse = PaginatedResponse<FlashcardDTO>;

// ============================================================================
// AI GENERATION DTOs AND COMMANDS
// ============================================================================

/**
 * Flashcard Proposal (AI-generated, not yet saved)
 * Used in: POST /api/flashcards/generate response
 * Represents a flashcard suggestion before user acceptance
 */
export interface FlashcardProposal {
  front_content: string;
  back_content: string;
}

/**
 * AI Generation Usage Information
 * Tracks daily AI generation limits and usage
 */
export interface UsageInfo {
  generated_count: number;
  total_generated_today: number;
  daily_limit: number;
}

/**
 * Generate Flashcards Command
 * Used in: POST /api/flashcards/generate request body
 */
export interface GenerateFlashcardsCommand {
  deck_id: string;
  text: string;
}

/**
 * Generate Flashcards Response
 * Used in: POST /api/flashcards/generate response
 */
export interface GenerateFlashcardsResponse {
  proposals: FlashcardProposal[];
  usage: UsageInfo;
}

/**
 * Flashcard Batch Item
 * Represents a single flashcard in a batch creation request
 * Used in: POST /api/flashcards/batch request body
 */
export interface FlashcardBatchItem {
  front_content: string;
  back_content: string;
  ai_accepted: boolean;
}

/**
 * Batch Create Flashcards Command
 * Used in: POST /api/flashcards/batch request body
 */
export interface BatchCreateFlashcardsCommand {
  deck_id: string;
  flashcards: FlashcardBatchItem[];
}

/**
 * Batch Create Flashcards Response
 * Used in: POST /api/flashcards/batch response
 */
export interface BatchCreateFlashcardsResponse {
  created: FlashcardDTO[];
  count: number;
}

// ============================================================================
// LEARNING SESSION DTOs AND COMMANDS
// ============================================================================

/**
 * Due Flashcard DTO
 * Simplified flashcard for learning sessions (excludes user_id)
 * Used in: GET /api/flashcards/due response
 */
export type DueFlashcardDTO = Pick<FlashcardEntity, "id" | "deck_id" | "front_content" | "back_content" | "status">;

/**
 * Get Due Flashcards Response
 * Used in: GET /api/flashcards/due response
 */
export interface GetDueFlashcardsResponse {
  flashcards: DueFlashcardDTO[];
  total_due: number;
}

/**
 * Review Rating
 * Enum for spaced repetition algorithm ratings
 */
export type ReviewRating = "again" | "hard" | "good" | "easy";

/**
 * Record Review Command
 * Used in: POST /api/flashcards/:id/review request body
 */
export interface RecordReviewCommand {
  rating: ReviewRating;
}

/**
 * Reviewed Flashcard DTO
 * Extended flashcard with next review date information
 * Used in: POST /api/flashcards/:id/review response
 */
export interface ReviewedFlashcardDTO extends FlashcardDTO {
  next_review_date: string;
}

// ============================================================================
// USER LIMITS DTOs
// ============================================================================

/**
 * AI Generation Limits
 * Daily limits and usage for AI flashcard generation
 */
export interface AiGenerationLimits {
  daily_limit: number;
  used_today: number;
  remaining_today: number;
  resets_at: string;
}

/**
 * User Statistics
 * Aggregated statistics about user's flashcards
 */
export interface UserStatistics {
  total_flashcards: number;
  ai_generated_flashcards: number;
  manually_created_flashcards: number;
  ai_acceptance_rate: number;
}

/**
 * User Limits Response
 * Used in: GET /api/users/me/limits response
 */
export interface UserLimitsResponse {
  ai_generation: AiGenerationLimits;
  statistics: UserStatistics;
}

// ============================================================================
// ERROR RESPONSE TYPES
// ============================================================================

/**
 * Error codes used throughout the API
 */
export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "LIMIT_EXCEEDED"
  | "AI_GENERATION_FAILED"
  | "INTERNAL_ERROR";

/**
 * Error details object
 * Contains additional context about the error
 */
export type ErrorDetails = Record<string, string | number | boolean | null | undefined>;

/**
 * Error Response
 * Standardized error response format used across all API endpoints
 */
export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: ErrorDetails;
  };
}

// ============================================================================
// QUERY PARAMETER TYPES
// ============================================================================

/**
 * Pagination Query Parameters
 * Common pagination parameters used in list endpoints
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Sorting Parameters
 * Common sorting parameters used in list endpoints
 */
export interface SortingParams {
  sort?: string;
  order?: "asc" | "desc";
}

/**
 * List Decks Query Parameters
 * Used in: GET /api/decks
 */
export interface ListDecksParams extends PaginationParams, SortingParams {}

/**
 * List Flashcards Query Parameters
 * Used in: GET /api/flashcards
 */
export interface ListFlashcardsParams extends PaginationParams, SortingParams {
  deck_id?: string;
  status?: FlashcardStatus;
  ai_generated?: boolean;
}

/**
 * Get Due Flashcards Query Parameters
 * Used in: GET /api/flashcards/due
 */
export interface GetDueFlashcardsParams {
  deck_id?: string;
  limit?: number;
}
