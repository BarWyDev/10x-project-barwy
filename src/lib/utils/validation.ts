/**
 * Validation Utilities
 *
 * This module provides reusable validation functions for flashcard content.
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate text length against min and max constraints
 *
 * @param text - Text to validate
 * @param min - Minimum allowed length (after trim)
 * @param max - Maximum allowed length (after trim)
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateTextLength(text: string, min: number, max: number): ValidationResult {
  const trimmed = text.trim();
  const length = trimmed.length;

  if (length === 0 && min > 0) {
    return {
      isValid: false,
      error: undefined, // Don't show error for empty field
    };
  }

  if (length < min) {
    return {
      isValid: false,
      error: `Dodaj jeszcze ${min - length} znaków, aby móc wygenerować fiszki`,
    };
  }

  if (length > max) {
    return {
      isValid: false,
      error: `Tekst jest za długi o ${length - max} znaków`,
    };
  }

  return { isValid: true };
}

/**
 * Validate flashcard front content
 *
 * @param frontContent - Front content to validate
 * @returns ValidationResult
 */
export function validateFrontContent(frontContent: string): ValidationResult {
  return validateTextLength(frontContent, 1, 1000, "Awers");
}

/**
 * Validate flashcard back content
 *
 * @param backContent - Back content to validate
 * @returns ValidationResult
 */
export function validateBackContent(backContent: string): ValidationResult {
  return validateTextLength(backContent, 1, 2000, "Rewers");
}

/**
 * Validate complete flashcard content (both front and back)
 *
 * @param frontContent - Front content to validate
 * @param backContent - Back content to validate
 * @returns Object with validation results for both fields
 */
export function validateFlashcardContent(
  frontContent: string,
  backContent: string
): {
  front: ValidationResult;
  back: ValidationResult;
  isValid: boolean;
} {
  const front = validateFrontContent(frontContent);
  const back = validateBackContent(backContent);

  return {
    front,
    back,
    isValid: front.isValid && back.isValid,
  };
}

/**
 * Validate text for AI generation
 *
 * @param text - Text to validate
 * @returns ValidationResult
 */
export function validateGenerationText(text: string): ValidationResult {
  return validateTextLength(text, 50, 5000, "Tekst");
}

/**
 * Check if usage limit is exceeded
 *
 * @param usedToday - Number of generations used today
 * @param dailyLimit - Daily limit
 * @returns true if limit is exceeded
 */
export function isUsageLimitExceeded(usedToday: number, dailyLimit: number): boolean {
  return usedToday >= dailyLimit;
}

/**
 * Calculate usage percentage
 *
 * @param usedToday - Number of generations used today
 * @param dailyLimit - Daily limit
 * @returns Percentage (0-100)
 */
export function calculateUsagePercentage(usedToday: number, dailyLimit: number): number {
  if (dailyLimit === 0) return 0;
  return Math.round((usedToday / dailyLimit) * 100);
}

/**
 * Get usage color based on percentage
 *
 * @param percentage - Usage percentage (0-100)
 * @returns Color indicator: 'success' | 'warning' | 'danger'
 */
export function getUsageColor(percentage: number): "success" | "warning" | "danger" {
  if (percentage <= 70) return "success";
  if (percentage <= 90) return "warning";
  return "danger";
}
