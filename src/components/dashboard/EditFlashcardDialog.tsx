/**
 * EditFlashcardDialog Component
 * 
 * Dialog for editing an existing flashcard's content.
 * Uses Shadcn/ui Dialog component.
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { FlashcardEntity } from '@/types';

interface EditFlashcardDialogProps {
  flashcard: FlashcardEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFlashcardUpdated?: () => void;
}

export function EditFlashcardDialog({
  flashcard,
  open,
  onOpenChange,
  onFlashcardUpdated,
}: EditFlashcardDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [frontContent, setFrontContent] = useState('');
  const [backContent, setBackContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Update form when flashcard changes
  useEffect(() => {
    if (flashcard) {
      setFrontContent(flashcard.front_content);
      setBackContent(flashcard.back_content);
      setError(null);
    }
  }, [flashcard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!flashcard) return;

    if (!frontContent.trim()) {
      setError('Awers fiszki nie może być pusty');
      return;
    }

    if (!backContent.trim()) {
      setError('Rewers fiszki nie może być pusty');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/flashcards/${flashcard.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          front_content: frontContent.trim(),
          back_content: backContent.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message || 'Nie udało się zaktualizować fiszki');
      }

      // Success - close dialog
      onOpenChange(false);
      
      // Callback to refresh parent component
      if (onFlashcardUpdated) {
        onFlashcardUpdated();
      }
    } catch (err) {
      console.error('Error updating flashcard:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił błąd');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        // Reset error when closing
        setError(null);
      }
    }
  };

  if (!flashcard) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edytuj fiszkę</DialogTitle>
            <DialogDescription>
              Zaktualizuj zawartość fiszki. Zmiany zostaną zapisane natychmiast.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="front-content">
                Awers (pytanie) <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="front-content"
                placeholder="Treść awersu..."
                value={frontContent}
                onChange={(e) => setFrontContent(e.target.value)}
                maxLength={1000}
                rows={3}
                disabled={isLoading}
                autoFocus
              />
              <p className="text-xs text-gray-500">
                {frontContent.length}/1000 znaków
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="back-content">
                Rewers (odpowiedź) <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="back-content"
                placeholder="Treść rewersu..."
                value={backContent}
                onChange={(e) => setBackContent(e.target.value)}
                maxLength={2000}
                rows={5}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                {backContent.length}/2000 znaków
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

