/**
 * FlashcardGenerator Component
 * 
 * Form for generating flashcards using AI from provided text.
 * Includes character counter, usage limit indicator, and validation.
 */

import { useFlashcardGenerator } from '@/lib/hooks/useFlashcardGenerator';
import { UsageLimitIndicator } from './UsageLimitIndicator';
import { CharacterCounter } from './CharacterCounter';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import type { FlashcardProposal, UsageInfo } from '@/types';

export interface FlashcardGeneratorProps {
  deckId: string;
  initialUsageInfo?: UsageInfo;
  onGenerateSuccess: (proposals: FlashcardProposal[], usageInfo: UsageInfo) => void;
  onGenerateError?: (error: string) => void;
  demoMode?: boolean; // If true, uses demo API without authentication
}

const MIN_LENGTH = 50;
const MAX_LENGTH = 5000;

export function FlashcardGenerator({
  deckId,
  initialUsageInfo,
  onGenerateSuccess,
  onGenerateError,
  demoMode = false,
}: FlashcardGeneratorProps) {
  const {
    text,
    isGenerating,
    error,
    usageInfo,
    setText,
    generateFlashcards,
    resetError,
    isValid,
    validationErrors,
    canGenerate,
  } = useFlashcardGenerator(initialUsageInfo, demoMode);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    
    // Prevent exceeding max length
    if (newText.length > MAX_LENGTH) {
      return;
    }
    
    setText(newText);
    
    // Reset error when user starts typing
    if (error) {
      resetError();
    }
  };

  const handleGenerate = async () => {
    const response = await generateFlashcards(deckId, demoMode);
    
    if (response) {
      // Success - pass proposals to parent
      onGenerateSuccess(response.proposals, response.usage);
    } else if (error && onGenerateError) {
      // Error - notify parent if handler provided
      onGenerateError(error.error.message);
    }
  };

  const isButtonDisabled = !isValid || isGenerating || !canGenerate;

  // Get user-friendly error message
  const getErrorMessage = () => {
    if (!error) return null;

    switch (error.error.code) {
      case 'VALIDATION_ERROR':
        return validationErrors.text || error.error.message;
      case 'LIMIT_EXCEEDED':
        return 'Osiągnięto dzienny limit generowania. Spróbuj ponownie jutro o 00:00.';
      case 'AI_GENERATION_FAILED':
        return 'Nie udało się wygenerować fiszek z tego tekstu. Spróbuj z innym fragmentem lub zmień sformułowanie.';
      case 'NOT_FOUND':
        return 'Nie znaleziono talii. Odśwież stronę.';
      default:
        return error.error.message;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="generation-text" className="text-base font-semibold">
            Wklej swoje notatki
          </Label>
          <CharacterCounter current={text.length} max={MAX_LENGTH} />
        </div>
        
        <Textarea
          id="generation-text"
          value={text}
          onChange={handleTextChange}
          placeholder="Wklej tutaj tekst, z którego chcesz wygenerować fiszki (minimum 50 znaków)...&#10;&#10;Przykład:&#10;Mitochondria są organellami błonowymi znajdującymi się w cytoplazmie komórek eukariotycznych. Odpowiadają za produkcję ATP..."
          className="min-h-[200px] resize-y"
          disabled={isGenerating}
          aria-describedby={validationErrors.text ? 'text-error' : undefined}
          aria-invalid={!!validationErrors.text}
        />
        
        {validationErrors.text && !error && (
          <p id="text-error" className="text-sm text-red-600 mt-1">
            {validationErrors.text}
          </p>
        )}
      </div>

      {/* Usage Limit Indicator */}
      {usageInfo && (
        <UsageLimitIndicator usageInfo={usageInfo} />
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{getErrorMessage()}</AlertDescription>
        </Alert>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isButtonDisabled}
        className="w-full"
        size="lg"
      >
        {isGenerating ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Generowanie...
          </>
        ) : (
          'Generuj fiszki z AI'
        )}
      </Button>

      {/* Helper text */}
      <p className="text-xs text-gray-500 text-center">
        {canGenerate 
          ? `Potrzebujesz minimum ${MIN_LENGTH} znaków, aby wygenerować fiszki`
          : 'Osiągnięto dzienny limit. Wróć jutro po więcej generacji.'
        }
      </p>
    </div>
  );
}

