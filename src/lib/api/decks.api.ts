/**
 * API Client for Decks
 *
 * Functions for interacting with the decks API endpoints.
 */

import type { DeckDTO, CreateDeckCommand, ErrorResponse } from "../../types";

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
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
      throw new APIError(response.status, "INTERNAL_ERROR", "An unexpected error occurred");
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Get all decks
 *
 * @returns Promise with array of decks
 * @throws APIError with appropriate error code
 */
export async function getDecks(): Promise<DeckDTO[]> {
  const response = await fetch("/api/decks", {
    method: "GET",
    credentials: "include",
  });

  return handleResponse<DeckDTO[]>(response);
}

/**
 * Create a new deck
 *
 * @param command - Contains name and optional description
 * @returns Promise with created deck
 * @throws APIError with appropriate error code
 */
export async function createDeck(command: CreateDeckCommand): Promise<DeckDTO> {
  const response = await fetch("/api/decks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(command),
  });

  return handleResponse<DeckDTO>(response);
}

/**
 * Get a single deck by ID
 *
 * @param id - UUID of the deck
 * @returns Promise with deck
 * @throws APIError with appropriate error code
 */
export async function getDeck(id: string): Promise<DeckDTO> {
  const response = await fetch(`/api/decks/${id}`, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse<DeckDTO>(response);
}



