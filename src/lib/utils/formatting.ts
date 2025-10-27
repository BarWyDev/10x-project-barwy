/**
 * Formatting Utilities
 * 
 * Common formatting functions for dates, text truncation, etc.
 */

/**
 * Format date string to Polish locale
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date to long Polish format
 */
export function formatDateLong(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncate(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Pluralize Polish words based on count
 */
export function pluralize(
  count: number,
  singular: string,
  plural: string,
  pluralGenitive: string
): string {
  if (count === 1) return singular;
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
    return plural;
  }
  return pluralGenitive;
}

/**
 * Get plural form for "fiszka" based on count
 */
export function getFlashcardPlural(count: number): string {
  return pluralize(count, 'fiszka', 'fiszki', 'fiszek');
}

