/**
 * MyFlashcardsView Component
 * 
 * Displays all user flashcards grouped by deck with filtering options.
 * Provides quick view and delete functionality.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EditFlashcardDialog } from './EditFlashcardDialog';
import type { FlashcardEntity } from '@/types';

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
  const [flashcards, setFlashcards] = useState(initialFlashcards);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingFlashcard, setEditingFlashcard] = useState<FlashcardWithDeck | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEdit = (flashcard: FlashcardWithDeck) => {
    setEditingFlashcard(flashcard);
    setEditDialogOpen(true);
  };

  const handleFlashcardUpdated = () => {
    // Refresh the page to show updated flashcard
    window.location.reload();
  };

  // Get unique decks
  const decks = useMemo(() => {
    const deckMap = new Map<string, { id: string; name: string; count: number }>();
    
    flashcards.forEach(flashcard => {
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
    return flashcards.filter(f => f.deck?.id === selectedDeck);
  }, [flashcards, selectedDeck, selectedDeckName]);

  const handleDelete = async (flashcardId: string) => {
    const confirmed = window.confirm('Czy na pewno chcesz usunąć tę fiszkę?');
    if (!confirmed) return;

    setDeletingIds(prev => new Set(prev).add(flashcardId));

    try {
      const response = await fetch(`/api/flashcards/${flashcardId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete flashcard');
      }

      // Remove from state
      setFlashcards(prev => prev.filter(f => f.id !== flashcardId));
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      alert('Nie udało się usunąć fiszki. Spróbuj ponownie.');
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(flashcardId);
        return next;
      });
    }
  };

  const toggleExpanded = (flashcardId: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(flashcardId)) {
        next.delete(flashcardId);
      } else {
        next.add(flashcardId);
      }
      return next;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncate = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Empty state
  if (flashcards.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {selectedDeckName ? `Fiszki z talii: ${selectedDeckName}` : 'Moje Fiszki'}
            </h2>
            <p className="text-gray-600 mt-2">
              {selectedDeckName 
                ? `Brak fiszek w tej talii`
                : `Wszystkie twoje fiszki w jednym miejscu`
              }
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
              {selectedDeckName 
                ? `Brak fiszek w talii "${selectedDeckName}"`
                : `Nie masz jeszcze żadnych fiszek`
              }
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Wygeneruj swoje pierwsze fiszki przy użyciu AI
            </p>
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
            {selectedDeckName ? `Fiszki z talii: ${selectedDeckName}` : 'Moje Fiszki'}
          </h2>
          <p className="text-gray-600 mt-2">
            {selectedDeckName 
              ? `Wyświetlam ${flashcards.length} ${flashcards.length === 1 ? 'fiszkę' : 'fiszek'} z tej talii`
              : `Wszystkie twoje fiszki (${flashcards.length})`
            }
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
            variant={selectedDeck === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDeck(null)}
          >
            Wszystkie ({flashcards.length})
          </Button>
          {decks.map(deck => (
            <Button
              key={deck.id}
              variant={selectedDeck === deck.id ? 'default' : 'outline'}
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
        {filteredFlashcards.map((flashcard) => {
          const isExpanded = expandedIds.has(flashcard.id);
          const isDeleting = deletingIds.has(flashcard.id);

          return (
            <Card
              key={flashcard.id}
              className={`transition-all hover:shadow-md ${
                isDeleting ? 'opacity-50' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-medium flex-1">
                    {flashcard.front_content}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Badge 
                      variant={flashcard.ai_generated ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {flashcard.ai_generated ? 'AI' : 'Ręcznie'}
                    </Badge>
                  </div>
                </div>
                {flashcard.deck && (
                  <div className="text-xs text-gray-500 mt-1">
                    📚 {flashcard.deck.name}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    {isExpanded 
                      ? flashcard.back_content 
                      : truncate(flashcard.back_content)
                    }
                  </p>
                  {flashcard.back_content.length > 100 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 mt-1 text-xs"
                      onClick={() => toggleExpanded(flashcard.id)}
                    >
                      {isExpanded ? 'Pokaż mniej' : 'Pokaż więcej'}
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {formatDate(flashcard.created_at)}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(flashcard)}
                      disabled={isDeleting}
                    >
                      Edytuj
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(flashcard.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Usuwanie...' : 'Usuń'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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

