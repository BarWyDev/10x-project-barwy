/**
 * DeckSelector Component
 * 
 * Allows users to:
 * - View list of existing decks
 * - Select a deck
 * - Create a new deck
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getDecks, createDeck } from '@/lib/api/decks.api';
import type { DeckDTO } from '@/types';

export interface DeckSelectorProps {
  onDeckSelected: (deck: DeckDTO) => void;
  selectedDeckId?: string;
}

export function DeckSelector({ onDeckSelected, selectedDeckId }: DeckSelectorProps) {
  const [decks, setDecks] = useState<DeckDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');

  // Load decks on mount
  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedDecks = await getDecks();
      setDecks(fetchedDecks);
      
      // Auto-select first deck if none selected
      if (!selectedDeckId && fetchedDecks.length > 0) {
        onDeckSelected(fetchedDecks[0]);
      }
    } catch (err) {
      console.error('Error loading decks:', err);
      setError('Nie udało się załadować talii. Sprawdź połączenie z bazą danych.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newDeckName.trim().length === 0) {
      setError('Nazwa talii jest wymagana');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const newDeck = await createDeck({
        name: newDeckName.trim(),
        description: newDeckDescription.trim() || undefined,
      });

      // Add to list and select
      setDecks(prev => [newDeck, ...prev]);
      onDeckSelected(newDeck);
      
      // Reset form
      setNewDeckName('');
      setNewDeckDescription('');
      setShowCreateForm(false);
    } catch (err: any) {
      console.error('Error creating deck:', err);
      setError(err.message || 'Nie udało się utworzyć talii');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectDeck = (deck: DeckDTO) => {
    onDeckSelected(deck);
  };

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
        <Card>
          <CardHeader>
            <CardTitle>Utwórz nową talię</CardTitle>
            <CardDescription>
              Dodaj nazwę i opcjonalny opis dla swojej talii
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateDeck} className="space-y-4">
              <div>
                <Label htmlFor="deck-name">Nazwa talii *</Label>
                <Input
                  id="deck-name"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  placeholder="np. Biologia - Komórka"
                  maxLength={100}
                  disabled={isCreating}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="deck-description">Opis (opcjonalnie)</Label>
                <Textarea
                  id="deck-description"
                  value={newDeckDescription}
                  onChange={(e) => setNewDeckDescription(e.target.value)}
                  placeholder="np. Notatki z lekcji o budowie komórki"
                  maxLength={500}
                  disabled={isCreating}
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewDeckName('');
                    setNewDeckDescription('');
                    setError(null);
                  }}
                  disabled={isCreating}
                >
                  Anuluj
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Tworzenie...' : 'Utwórz talię'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
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
                  <span>{new Date(deck.created_at).toLocaleDateString('pl-PL')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


