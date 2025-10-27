/**
 * FlashcardCard Component
 * 
 * Displays a single flashcard with:
 * - Front and back content (with expand/collapse)
 * - AI/Manual badge
 * - Deck information
 * - Edit and Delete actions with confirmation dialog
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { formatDate, truncate } from '@/lib/utils/formatting';
import type { FlashcardEntity } from '@/types';

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

export const FlashcardCard = React.memo(({
  flashcard,
  isExpanded,
  isDeleting,
  onEdit,
  onDelete,
  onToggleExpand,
}: FlashcardCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEdit = () => onEdit(flashcard);
  const handleDeleteClick = () => setShowDeleteDialog(true);
  const handleDeleteConfirm = () => onDelete(flashcard.id);
  const handleToggleExpand = () => onToggleExpand(flashcard.id);

  return (
    <Card
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
              onClick={handleToggleExpand}
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
              onClick={handleEdit}
              disabled={isDeleting}
            >
              Edytuj
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              {isDeleting ? 'Usuwanie...' : 'Usuń'}
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
});

FlashcardCard.displayName = 'FlashcardCard';

