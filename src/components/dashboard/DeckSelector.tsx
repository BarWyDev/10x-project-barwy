/**
 * DeckSelector Component
 * 
 * Allows users to:
 * - View list of existing decks
 * - Select a deck
 * - Create a new deck
 * 
 * Refactored to use:
 * - useDecks custom hook for deck management
 * - CreateDeckForm component for deck creation
 * - DeckGrid component for deck display
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateDeckForm } from './CreateDeckForm';
import { useDecks } from '@/lib/hooks/useDecks';
import { formatDateLong } from '@/lib/utils/formatting';
import type { DeckDTO } from '@/types';

export interface DeckSelectorProps {
  onDeckSelected: (deck: DeckDTO) => void;
  selectedDeckId?: string;
  autoSelectFirst?: boolean; // If true, auto-select first deck on mount
}

export function DeckSelector({ 
  onDeckSelected, 
  selectedDeckId,
  autoSelectFirst = true // Default to true for backward compatibility
}: DeckSelectorProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Use custom hook for deck management
  const {
    decks,
    isLoading,
    isCreating,
    error,
    createDeck: createNewDeck,
    selectDeck,
  } = useDecks({
    selectedDeckId,
    autoSelectFirst,
    onDeckSelected,
  });

  /**
   * Handle deck creation
   */
  const handleCreateDeck = useCallback(async (data: { name: string; description?: string }) => {
    try {
      await createNewDeck(data);
      setShowCreateForm(false);
    } catch (err) {
      // Error is handled in the hook
      console.error('Error creating deck:', err);
    }
  }, [createNewDeck]);

  /**
   * Handle form cancellation
   */
  const handleCancelCreate = useCallback(() => {
    setShowCreateForm(false);
  }, []);

  /**
   * Handle deck selection
   */
  const handleSelectDeck = useCallback((deck: DeckDTO) => {
    selectDeck(deck);
  }, [selectDeck]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Twoje talie</h2>
          <p className="text-sm text-gray-600">
            Wybierz talię lub utwórz nową
          </p>
        </div>
        {!showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)}>
            + Nowa talia
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Create Deck Form */}
      {showCreateForm && (
        <CreateDeckForm
          onSubmit={handleCreateDeck}
          onCancel={handleCancelCreate}
          isSubmitting={isCreating}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {/* Decks List */}
      {!isLoading && decks.length === 0 && !showCreateForm && (
        <Alert>
          <AlertDescription className="text-center py-4">
            <p className="text-lg font-medium text-gray-700 mb-2">
              Nie masz jeszcze żadnych talii
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Utwórz pierwszą talię, aby zacząć generować fiszki
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              Utwórz pierwszą talię
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && decks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <Card
              key={deck.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedDeckId === deck.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : ''
              }`}
              onClick={() => handleSelectDeck(deck)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{deck.name}</CardTitle>
                  {selectedDeckId === deck.id && (
                    <Badge className="bg-blue-500">Wybrana</Badge>
                  )}
                </div>
                {deck.description && (
                  <CardDescription className="line-clamp-2">
                    {deck.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{deck.flashcard_count} fiszek</span>
                  <span>{formatDateLong(deck.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}






