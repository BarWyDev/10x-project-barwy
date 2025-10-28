/**
 * useFlashcardManagement Hook
 *
 * Manages flashcard state including:
 * - Deletion with optimistic updates
 * - Expand/collapse state
 * - Loading states
 */

import { useState, useCallback } from "react";
import type { FlashcardEntity } from "@/types";

interface FlashcardWithDeck extends FlashcardEntity {
  deck: {
    id: string;
    name: string;
  } | null;
}

export function useFlashcardManagement(initialFlashcards: FlashcardWithDeck[]) {
  const [flashcards, setFlashcards] = useState(initialFlashcards);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  /**
   * Handle flashcard deletion
   */
  const handleDelete = useCallback(async (flashcardId: string) => {
    setDeletingIds((prev) => new Set(prev).add(flashcardId));

    try {
      const response = await fetch(`/api/flashcards/${flashcardId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete flashcard");
      }

      // Remove from state on success
      setFlashcards((prev) => prev.filter((f) => f.id !== flashcardId));
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      alert("Nie udało się usunąć fiszki. Spróbuj ponownie.");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(flashcardId);
        return next;
      });
    }
  }, []);

  /**
   * Toggle expanded state for a flashcard
   */
  const toggleExpanded = useCallback((flashcardId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(flashcardId)) {
        next.delete(flashcardId);
      } else {
        next.add(flashcardId);
      }
      return next;
    });
  }, []);

  /**
   * Check if flashcard is being deleted
   */
  const isDeleting = useCallback(
    (flashcardId: string) => {
      return deletingIds.has(flashcardId);
    },
    [deletingIds]
  );

  /**
   * Check if flashcard is expanded
   */
  const isExpanded = useCallback(
    (flashcardId: string) => {
      return expandedIds.has(flashcardId);
    },
    [expandedIds]
  );

  return {
    flashcards,
    handleDelete,
    toggleExpanded,
    isDeleting,
    isExpanded,
  };
}
