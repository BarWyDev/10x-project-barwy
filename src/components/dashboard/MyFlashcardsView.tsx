/**
 * MyFlashcardsView Component
 *
 * Displays all user flashcards grouped by deck with filtering options.
 * Provides quick view and delete functionality.
 *
 * Refactored to use:
 * - Custom hook (useFlashcardManagement) for state management
 * - FlashcardCard component for individual cards
 * - Utility functions from formatting.ts
 */

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EditFlashcardDialog } from "./EditFlashcardDialog";
import { FlashcardCard } from "./FlashcardCard";
import { useFlashcardManagement } from "@/lib/hooks/useFlashcardManagement";
import { getFlashcardPlural } from "@/lib/utils/formatting";
import type { FlashcardEntity } from "@/types";

interface FlashcardWithDeck extends FlashcardEntity {
  deck: {
    id: string;
    name: string;
  } | null;
}

export interface MyFlashcardsViewProps {
  flashcards: FlashcardWithDeck[];
  selectedDeckName?: string;
}

export function MyFlashcardsView({ flashcards: initialFlashcards, selectedDeckName }: MyFlashcardsViewProps) {
  // Use custom hook for flashcard management
  const { flashcards, handleDelete, toggleExpanded, isDeleting, isExpanded } =
    useFlashcardManagement(initialFlashcards);

  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [editingFlashcard, setEditingFlashcard] = useState<FlashcardWithDeck | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEdit = useCallback((flashcard: FlashcardWithDeck) => {
    setEditingFlashcard(flashcard);
    setEditDialogOpen(true);
  }, []);

  const handleFlashcardUpdated = useCallback(() => {
    // Refresh the page to show updated flashcard
    window.location.reload();
  }, []);

  // Get unique decks
  const decks = useMemo(() => {
    const deckMap = new Map<string, { id: string; name: string; count: number }>();

    flashcards.forEach((flashcard) => {
      if (flashcard.deck) {
        const existing = deckMap.get(flashcard.deck.id);
        if (existing) {
          existing.count++;
        } else {
          deckMap.set(flashcard.deck.id, {
            id: flashcard.deck.id,
            name: flashcard.deck.name,
            count: 1,
          });
        }
      }
    });

    return Array.from(deckMap.values());
  }, [flashcards]);

  // Filter flashcards by selected deck (only for client-side filtering, not URL-based)
  const filteredFlashcards = useMemo(() => {
    // If filtering by URL parameter, show all flashcards (already filtered server-side)
    if (selectedDeckName) return flashcards;

    // Otherwise, use client-side filter
    if (!selectedDeck) return flashcards;
    return flashcards.filter((f) => f.deck?.id === selectedDeck);
  }, [flashcards, selectedDeck, selectedDeckName]);

  // Empty state
  if (flashcards.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {selectedDeckName ? `Fiszki z talii: ${selectedDeckName}` : "Moje Fiszki"}
            </h2>
            <p className="text-gray-600 mt-2">
              {selectedDeckName ? `Brak fiszek w tej talii` : `Wszystkie twoje fiszki w jednym miejscu`}
            </p>
          </div>
          <div className="flex gap-2">
            {selectedDeckName && (
              <Button variant="outline" asChild>
                <a href="/app">Wszystkie fiszki</a>
              </Button>
            )}
            <Button asChild>
              <a href="/generate">Generuj Fiszki</a>
            </Button>
          </div>
        </div>

        <Alert>
          <AlertDescription className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              {selectedDeckName ? `Brak fiszek w talii "${selectedDeckName}"` : `Nie masz jeszcze żadnych fiszek`}
            </p>
            <p className="text-sm text-gray-500 mb-4">Wygeneruj swoje pierwsze fiszki przy użyciu AI</p>
            <Button asChild>
              <a href="/generate">Rozpocznij generowanie</a>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {selectedDeckName ? `Fiszki z talii: ${selectedDeckName}` : "Moje Fiszki"}
          </h2>
          <p className="text-gray-600 mt-2">
            {selectedDeckName
              ? `Wyświetlam ${flashcards.length} ${getFlashcardPlural(flashcards.length)} z tej talii`
              : `Wszystkie twoje fiszki (${flashcards.length})`}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedDeckName && (
            <Button variant="outline" asChild>
              <a href="/app">Wszystkie fiszki</a>
            </Button>
          )}
          <Button asChild>
            <a href="/generate">Generuj Fiszki</a>
          </Button>
        </div>
      </div>

      {/* Deck Filter - only show if not already filtered by URL */}
      {!selectedDeckName && decks.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedDeck === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDeck(null)}
          >
            Wszystkie ({flashcards.length})
          </Button>
          {decks.map((deck) => (
            <Button
              key={deck.id}
              variant={selectedDeck === deck.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDeck(deck.id)}
            >
              {deck.name} ({deck.count})
            </Button>
          ))}
        </div>
      )}

      {/* Flashcards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFlashcards.map((flashcard) => (
          <FlashcardCard
            key={flashcard.id}
            flashcard={flashcard}
            isExpanded={isExpanded(flashcard.id)}
            isDeleting={isDeleting(flashcard.id)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleExpand={toggleExpanded}
          />
        ))}
      </div>

      {/* Edit Dialog */}
      <EditFlashcardDialog
        flashcard={editingFlashcard}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onFlashcardUpdated={handleFlashcardUpdated}
      />
    </div>
  );
}
