/**
 * API Client for Flashcards
 *
 * This module provides functions for interacting with the flashcards API endpoints.
 * All functions handle authentication automatically through cookies.
 */

import type {
  GenerateFlashcardsCommand,
  GenerateFlashcardsResponse,
  BatchCreateFlashcardsCommand,
  BatchCreateFlashcardsResponse,
  CreateFlashcardCommand,
  FlashcardDTO,
  PaginatedFlashcardsResponse,
  ListFlashcardsParams,
  ErrorResponse,
} from "../../types";

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, string | number | boolean | null | undefined>
  ) {
    super(message);
    this.name = "APIError";
  }

  static fromResponse(statusCode: number, errorResponse: ErrorResponse): APIError {
    return new APIError(statusCode, errorResponse.error.code, errorResponse.error.message, errorResponse.error.details);
  }
}

/**
 * Helper function to handle API responses
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    try {
      const errorData: ErrorResponse = await response.json();
      throw APIError.fromResponse(response.status, errorData);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      // If we can't parse the error response, throw a generic error
      throw new APIError(response.status, "INTERNAL_ERROR", "An unexpected error occurred");
    }
  }

  // For 204 No Content responses
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Generate flashcard proposals using AI
 *
 * @param command - Contains deck_id and text to generate flashcards from
 * @param demo - If true, uses demo endpoint without authentication (for testing only)
 * @returns Promise with proposals and usage information
 * @throws APIError with appropriate error code
 */
export async function generateFlashcards(
  command: GenerateFlashcardsCommand,
  demo = false
): Promise<GenerateFlashcardsResponse> {
  const endpoint = demo ? "/api/flashcards/generate-demo" : "/api/flashcards/generate";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include cookies for authentication
    body: JSON.stringify(command),
  });

  return handleResponse<GenerateFlashcardsResponse>(response);
}

/**
 * Create a single flashcard
 *
 * @param command - Contains deck_id and flashcard content
 * @returns Promise with the created flashcard
 * @throws APIError with appropriate error code
 */
export async function createFlashcard(command: CreateFlashcardCommand): Promise<FlashcardDTO> {
  const response = await fetch("/api/flashcards", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(command),
  });

  return handleResponse<FlashcardDTO>(response);
}

/**
 * Batch create flashcards from AI proposals
 *
 * @param command - Contains deck_id and array of flashcards to create
 * @param demo - If true, uses demo endpoint without authentication (for testing only)
 * @returns Promise with created flashcards
 * @throws APIError with appropriate error code
 */
export async function batchCreateFlashcards(
  command: BatchCreateFlashcardsCommand,
  demo = false
): Promise<BatchCreateFlashcardsResponse> {
  const endpoint = demo ? "/api/flashcards/batch-demo" : "/api/flashcards/batch";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(command),
  });

  return handleResponse<BatchCreateFlashcardsResponse>(response);
}

/**
 * Get paginated list of flashcards
 *
 * @param params - Query parameters for filtering and pagination
 * @returns Promise with paginated flashcards list
 * @throws APIError with appropriate error code
 */
export async function getFlashcards(params?: ListFlashcardsParams): Promise<PaginatedFlashcardsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }
  if (params?.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }
  if (params?.deck_id) {
    searchParams.append("deck_id", params.deck_id);
  }
  if (params?.status) {
    searchParams.append("status", params.status);
  }
  if (params?.ai_generated !== undefined) {
    searchParams.append("ai_generated", params.ai_generated.toString());
  }
  if (params?.sort) {
    searchParams.append("sort", params.sort);
  }
  if (params?.order) {
    searchParams.append("order", params.order);
  }

  const url = `/api/flashcards${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse<PaginatedFlashcardsResponse>(response);
}

/**
 * Delete a flashcard
 *
 * @param id - UUID of the flashcard to delete
 * @returns Promise that resolves when deletion is complete
 * @throws APIError with appropriate error code
 */
export async function deleteFlashcard(id: string): Promise<void> {
  const response = await fetch(`/api/flashcards/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  await handleResponse<Record<string, never>>(response);
}

/**
 * Update a flashcard
 *
 * @param id - UUID of the flashcard to update
 * @param command - Fields to update
 * @returns Promise with updated flashcard
 * @throws APIError with appropriate error code
 */
export async function updateFlashcard(
  id: string,
  command: { front_content?: string; back_content?: string }
): Promise<FlashcardDTO> {
  const response = await fetch(`/api/flashcards/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(command),
  });

  return handleResponse<FlashcardDTO>(response);
}
