/**
 * useDecks Hook
 * 
 * Manages deck state including:
 * - Loading decks from API
 * - Creating new decks
 * - Selecting decks
 * - Auto-selection logic
 */

import { useState, useEffect, useCallback } from 'react';
import { getDecks, createDeck as createDeckApi } from '@/lib/api/decks.api';
import type { DeckDTO } from '@/types';

interface UseDeckOptions {
  selectedDeckId?: string;
  autoSelectFirst?: boolean;
  onDeckSelected?: (deck: DeckDTO) => void;
}

export function useDecks(options: UseDeckOptions = {}) {
  const { selectedDeckId, autoSelectFirst = true, onDeckSelected } = options;

  const [decks, setDecks] = useState<DeckDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  /**
   * Load decks from API
   */
  const loadDecks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedDecks = await getDecks();
      setDecks(fetchedDecks);
      
      // Auto-select first deck ONLY on initial load if conditions met
      if (
        isInitialLoad && 
        !selectedDeckId && 
        fetchedDecks.length > 0 && 
        autoSelectFirst &&
        onDeckSelected
      ) {
        onDeckSelected(fetchedDecks[0]);
      }
      
      setIsInitialLoad(false);
    } catch (err: any) {
      console.error('Error loading decks:', err);
      const errorMessage = err?.message || 'Nie udało się załadować talii';
      setError(errorMessage + ' (Sprawdź czy jesteś zalogowany)');
    } finally {
      setIsLoading(false);
    }
  }, [isInitialLoad, selectedDeckId, autoSelectFirst, onDeckSelected]);

  /**
   * Create new deck
   */
  const createDeck = useCallback(async (data: { name: string; description?: string }) => {
    setIsCreating(true);
    setError(null);

    try {
      const newDeck = await createDeckApi(data);
      
      // Add to list
      setDecks(prev => [newDeck, ...prev]);
      
      // Auto-select new deck
      if (onDeckSelected) {
        onDeckSelected(newDeck);
      }
      
      return newDeck;
    } catch (err: any) {
      console.error('Error creating deck:', err);
      const errorMessage = err.message || 'Nie udało się utworzyć talii';
      setError(errorMessage);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [onDeckSelected]);

  /**
   * Select a deck
   */
  const selectDeck = useCallback((deck: DeckDTO) => {
    if (onDeckSelected) {
      onDeckSelected(deck);
    }
  }, [onDeckSelected]);

  // Load decks on mount
  useEffect(() => {
    loadDecks();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    decks,
    isLoading,
    isCreating,
    error,
    createDeck,
    selectDeck,
    reloadDecks: loadDecks,
  };
}

