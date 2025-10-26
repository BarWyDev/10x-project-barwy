/**
 * Test fixtures - reużywalne dane testowe
 */

import type { Flashcard, Deck } from '@/types';

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
};

export const mockDeck: Deck = {
  id: 'deck-1',
  user_id: mockUser.id,
  name: 'Test Deck',
  description: 'Test deck description',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

export const mockFlashcard: Flashcard = {
  id: 'flashcard-1',
  deck_id: mockDeck.id,
  user_id: mockUser.id,
  front: 'Test Question',
  back: 'Test Answer',
  status: 'verified',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

export const mockFlashcards: Flashcard[] = [
  mockFlashcard,
  {
    ...mockFlashcard,
    id: 'flashcard-2',
    front: 'Question 2',
    back: 'Answer 2',
  },
  {
    ...mockFlashcard,
    id: 'flashcard-3',
    front: 'Question 3',
    back: 'Answer 3',
  },
];

export const mockGeneratedFlashcard = {
  front: 'Generated Question',
  back: 'Generated Answer',
};

