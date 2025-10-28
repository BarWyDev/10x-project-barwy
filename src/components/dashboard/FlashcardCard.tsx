/**
 * FlashcardCard Component
 *
 * Displays a single flashcard with flip/reveal functionality:
 * - Initially shows only front content (question)
 * - Click "Pokaż odpowiedź" to reveal back content (answer)
 * - AI/Manual badge
 * - Deck information
 * - Edit and Delete actions with confirmation dialog
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { formatDate, truncate } from "@/lib/utils/formatting";
import type { FlashcardEntity } from "@/types";

interface FlashcardWithDeck extends FlashcardEntity {
  deck: {
    id: string;
    name: string;
  } | null;
}

export interface FlashcardCardProps {
  flashcard: FlashcardWithDeck;
  isExpanded: boolean;
  isDeleting: boolean;
  onEdit: (flashcard: FlashcardWithDeck) => void;
  onDelete: (flashcardId: string) => void;
  onToggleExpand: (flashcardId: string) => void;
}

export const FlashcardCard = React.memo(
  ({ flashcard, isExpanded, isDeleting, onEdit, onDelete, onToggleExpand }: FlashcardCardProps) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);

    const handleEdit = () => onEdit(flashcard);
    const handleDeleteClick = () => setShowDeleteDialog(true);
    const handleDeleteConfirm = () => onDelete(flashcard.id);
    const handleToggleExpand = () => onToggleExpand(flashcard.id);
    const handleReveal = () => setIsRevealed(!isRevealed);

    return (
      <Card className={`transition-all hover:shadow-md ${isDeleting ? "opacity-50" : ""}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="text-xs font-semibold text-gray-500 mb-2">
                {isRevealed ? "❓ Pytanie" : "🎴 Przód fiszki"}
              </div>
              <CardTitle className="text-lg font-medium leading-relaxed">{flashcard.front_content}</CardTitle>
            </div>
            <div className="flex gap-1">
              <Badge variant={flashcard.ai_generated ? "default" : "secondary"} className="text-xs">
                {flashcard.ai_generated ? "AI" : "Ręcznie"}
              </Badge>
            </div>
          </div>
          {flashcard.deck && <div className="text-xs text-gray-500 mt-2">📚 {flashcard.deck.name}</div>}
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Answer section - revealed on button click */}
          {isRevealed && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">✅ Odpowiedź</div>
              <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                {isExpanded ? flashcard.back_content : truncate(flashcard.back_content, 200)}
              </p>
              {flashcard.back_content.length > 200 && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 mt-2 text-xs text-blue-600 hover:text-blue-700"
                  onClick={handleToggleExpand}
                >
                  {isExpanded ? "📖 Pokaż mniej" : "📖 Pokaż więcej"}
                </Button>
              )}
            </div>
          )}

          {/* Reveal/Hide button */}
          <Button
            variant={isRevealed ? "outline" : "default"}
            size="lg"
            className="w-full font-medium"
            onClick={handleReveal}
            disabled={isDeleting}
          >
            {isRevealed ? "🔄 Ukryj odpowiedź" : "👁️ Pokaż odpowiedź"}
          </Button>

          {/* Action buttons and date */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-gray-500">{formatDate(flashcard.created_at)}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleEdit} disabled={isDeleting}>
                Edytuj
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteClick} disabled={isDeleting}>
                {isDeleting ? "Usuwanie..." : "Usuń"}
              </Button>
            </div>
          </div>
        </CardContent>

        <DeleteConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeleteConfirm}
          title="Usunąć fiszkę?"
          description={`Czy na pewno chcesz usunąć fiszkę "${truncate(flashcard.front_content, 50)}"? Tej operacji nie można cofnąć.`}
          confirmText="Usuń fiszkę"
          isLoading={isDeleting}
        />
      </Card>
    );
  }
);

FlashcardCard.displayName = "FlashcardCard";
