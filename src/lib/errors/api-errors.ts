/**
 * Custom API Error Classes
 * 
 * These error classes provide standardized error handling across the API.
 * Each error class includes:
 * - statusCode: HTTP status code for the error
 * - code: Machine-readable error code
 * - message: Human-readable error message
 * - details: Optional additional context about the error
 */

export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'APIError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - Validation errors
 * Used when request data fails validation
 */
export class ValidationError extends APIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(400, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

/**
 * 401 Unauthorized - Authentication errors
 * Used when authentication is required or fails
 */
export class UnauthorizedError extends APIError {
  constructor(message = 'Authentication required') {
    super(401, 'UNAUTHORIZED', message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * 403 Forbidden - Authorization errors
 * Used when user doesn't have permission to access resource
 */
export class ForbiddenError extends APIError {
  constructor(message: string) {
    super(403, 'FORBIDDEN', message);
    this.name = 'ForbiddenError';
  }
}

/**
 * 404 Not Found - Resource not found
 * Used when requested resource doesn't exist or user doesn't have access
 */
export class NotFoundError extends APIError {
  constructor(message: string) {
    super(404, 'NOT_FOUND', message);
    this.name = 'NotFoundError';
  }
}

/**
 * 422 Unprocessable Entity - AI generation errors
 * Used when AI fails to generate flashcards from provided text
 */
export class AIGenerationError extends APIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(422, 'AI_GENERATION_FAILED', message, details);
    this.name = 'AIGenerationError';
  }
}

/**
 * 429 Too Many Requests - Rate limiting
 * Used when user exceeds daily AI generation limit
 */
export class LimitExceededError extends APIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(429, 'LIMIT_EXCEEDED', message, details);
    this.name = 'LimitExceededError';
  }
}

/**
 * 500 Internal Server Error - Unexpected errors
 * Used for unexpected errors that aren't user's fault
 */
export class InternalError extends APIError {
  constructor(message = 'An unexpected error occurred') {
    super(500, 'INTERNAL_ERROR', message);
    this.name = 'InternalError';
  }
}

