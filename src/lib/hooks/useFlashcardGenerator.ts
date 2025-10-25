/**
 * useFlashcardGenerator Hook
 * 
 * Manages the state and logic for AI flashcard generation.
 * Handles validation, API calls, and usage limit tracking.
 */

import { useState, useCallback } from 'react';
import { generateFlashcards, APIError } from '../api/flashcards.api';
import { validateGenerationText, isUsageLimitExceeded } from '../utils/validation';
import type { 
  GenerateFlashcardsResponse, 
  UsageInfo,
  ErrorResponse,
} from '../../types';

interface GeneratorFormErrors {
  text?: string;
}

export interface UseFlashcardGeneratorReturn {
  // State
  text: string;
  isGenerating: boolean;
  error: ErrorResponse | null;
  usageInfo: UsageInfo | null;
  
  // Actions
  setText: (text: string) => void;
  generateFlashcards: (deckId: string, demo?: boolean) => Promise<GenerateFlashcardsResponse | null>;
  resetError: () => void;
  setUsageInfo: (info: UsageInfo) => void;
  
  // Validation
  isValid: boolean;
  validationErrors: GeneratorFormErrors;
  canGenerate: boolean;
}

export function useFlashcardGenerator(
  initialUsageInfo?: UsageInfo,
  demoMode: boolean = false
): UseFlashcardGeneratorReturn {
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(
    initialUsageInfo || null
  );

  // Validation
  const validationResult = validateGenerationText(text);
  const validationErrors: GeneratorFormErrors = {
    text: validationResult.isValid ? undefined : validationResult.error,
  };
  const isValid = validationResult.isValid;

  // Check if user can generate (within daily limit)
  const canGenerate = usageInfo
    ? !isUsageLimitExceeded(usageInfo.total_generated_today, usageInfo.daily_limit)
    : true;

  // Generate flashcards
  const handleGenerate = useCallback(
    async (deckId: string, demo: boolean = false): Promise<GenerateFlashcardsResponse | null> => {
      // Validate before generating
      if (!isValid) {
        setError({
          error: {
            code: 'VALIDATION_ERROR',
            message: validationErrors.text || 'Niepoprawne dane',
          },
        });
        return null;
      }

      if (!canGenerate && !demoMode && !demo) {
        setError({
          error: {
            code: 'LIMIT_EXCEEDED',
            message: 'Osiągnięto dzienny limit generowania',
          },
        });
        return null;
      }

      setIsGenerating(true);
      setError(null);

      try {
        const response = await generateFlashcards({
          deck_id: deckId,
          text: text.trim(),
        }, demo || demoMode);

        // Update usage info
        setUsageInfo(response.usage);

        return response;
      } catch (err) {
        if (err instanceof APIError) {
          setError({
            error: {
              code: err.code as any,
              message: err.message,
              details: err.details,
            },
          });
        } else if (err instanceof TypeError && err.message === 'Failed to fetch') {
          setError({
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Problem z połączeniem. Sprawdź internet i spróbuj ponownie.',
            },
          });
        } else {
          setError({
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.',
            },
          });
        }
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [text, isValid, canGenerate, validationErrors.text, demoMode]
  );

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    text,
    isGenerating,
    error,
    usageInfo,
    setText,
    generateFlashcards: handleGenerate,
    resetError,
    setUsageInfo,
    isValid,
    validationErrors,
    canGenerate,
  };
}

