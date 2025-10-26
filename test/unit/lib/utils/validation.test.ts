/**
 * Przykładowy test jednostkowy - utility functions
 * 
 * Best practices demonstrowane tutaj:
 * - Testing pure functions
 * - Edge cases and boundary testing
 * - Using inline snapshots when appropriate
 */

import { describe, it, expect } from 'vitest';

// Mock funkcji do przetestowania - zastąp właściwymi funkcjami z projektu
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

describe('validation utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      // Arrange & Act & Assert
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
      expect(validateEmail('test123@test-domain.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      // Arrange & Act & Assert
      expect(validateEmail('not-an-email')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('test@.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });

    it('should handle edge cases', () => {
      // Arrange & Act & Assert
      expect(validateEmail('test@example')).toBe(false);
      expect(validateEmail('test @example.com')).toBe(false);
      expect(validateEmail('test@exam ple.com')).toBe(false);
    });
  });

  describe('truncateText', () => {
    it('should not truncate text shorter than max length', () => {
      // Arrange
      const text = 'Short text';
      const maxLength = 20;

      // Act
      const result = truncateText(text, maxLength);

      // Assert
      expect(result).toBe(text);
    });

    it('should truncate text longer than max length', () => {
      // Arrange
      const text = 'This is a very long text that should be truncated';
      const maxLength = 20;

      // Act
      const result = truncateText(text, maxLength);

      // Assert
      expect(result).toBe('This is a very long ...');
      expect(result.length).toBe(maxLength + 3); // +3 for '...'
    });

    it('should handle exact max length', () => {
      // Arrange
      const text = 'Exactly twenty chars';
      const maxLength = 20;

      // Act
      const result = truncateText(text, maxLength);

      // Assert
      expect(result).toBe(text);
    });

    it('should handle empty string', () => {
      // Arrange
      const text = '';
      const maxLength = 10;

      // Act
      const result = truncateText(text, maxLength);

      // Assert
      expect(result).toBe('');
    });
  });
});

