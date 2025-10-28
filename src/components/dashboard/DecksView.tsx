/**
 * DecksView Component
 *
 * Displays all user decks with flashcard counts and actions.
 * Handles empty states and provides create/edit/delete functionality.
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreateDeckDialog } from "./CreateDeckDialog";
import type { DeckEntity } from "@/types";

interface DeckWithCount extends DeckEntity {
  flashcard_count: number;
}

export interface DecksViewProps {
  decks: DeckWithCount[];
}

export function DecksView({ decks: initialDecks }: DecksViewProps) {
  const [decks, setDecks] = useState(initialDecks);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleDeckCreated = () => {
    // Refresh the page to show new deck
    window.location.reload();
  };

  const handleDelete = async (deckId: string) => {
    const deck = decks.find((d) => d.id === deckId);
    if (!deck) return;

    // Warn if deck has flashcards
    if (deck.flashcard_count > 0) {
      const confirmed = window.confirm(
        `Czy na pewno chcesz usunąć talię "${deck.name}"? Wszystkie ${deck.flashcard_count} fiszek również zostanie usuniętych.`
      );
      if (!confirmed) return;
    } else {
      const confirmed = window.confirm(`Czy na pewno chcesz usunąć talię "${deck.name}"?`);
      if (!confirmed) return;
    }

    setDeletingIds((prev) => new Set(prev).add(deckId));

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete deck");
      }

      // Remove from state
      setDecks((prev) => prev.filter((d) => d.id !== deckId));
    } catch (error) {
      console.error("Error deleting deck:", error);
      alert("Nie udało się usunąć talii. Spróbuj ponownie.");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(deckId);
        return next;
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Empty state
  if (decks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Moje Talie</h2>
            <p className="text-gray-600 mt-2">Organizuj swoje fiszki w talie tematyczne</p>
          </div>
          <div className="flex gap-2">
            <CreateDeckDialog onDeckCreated={handleDeckCreated} />
            <Button asChild>
              <a href="/generate">Generuj Fiszki</a>
            </Button>
          </div>
        </div>

        <Alert>
          <AlertDescription className="text-center py-12">
            <div className="text-6xl mb-4">🎴</div>
            <p className="text-lg font-medium text-gray-700 mb-2">Nie masz jeszcze żadnych talii</p>
            <p className="text-sm text-gray-500 mb-4">Talie są tworzone automatycznie podczas generowania fiszek</p>
            <Button asChild>
              <a href="/generate">Rozpocznij generowanie fiszek</a>
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
          <h2 className="text-3xl font-bold text-gray-900">Moje Talie</h2>
          <p className="text-gray-600 mt-2">Zarządzaj swoimi taliami i fiszkami</p>
        </div>
        <div className="flex gap-2">
          <CreateDeckDialog onDeckCreated={handleDeckCreated} />
          <Button asChild>
            <a href="/generate">Generuj Fiszki</a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map((deck) => (
          <Card
            key={deck.id}
            className={`transition-all hover:shadow-lg ${deletingIds.has(deck.id) ? "opacity-50" : ""}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-1">{deck.name}</CardTitle>
                  {deck.description && <CardDescription className="text-sm">{deck.description}</CardDescription>}
                </div>
                <Badge variant="secondary" className="ml-2">
                  {deck.flashcard_count} {deck.flashcard_count === 1 ? "fiszka" : "fiszek"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs text-gray-500">Utworzono: {formatDate(deck.created_at)}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a href={`/app?deck=${deck.id}`}>Pokaż fiszki</a>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(deck.id)}
                  disabled={deletingIds.has(deck.id)}
                >
                  {deletingIds.has(deck.id) ? "Usuwanie..." : "Usuń"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
