/**
 * FlashcardList Component
 * 
 * Displays a paginated table of flashcards with edit and delete actions.
 * Handles loading states, empty states, and optimistic updates.
 */

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { FlashcardDTO, PaginationInfo } from '@/types';

export interface FlashcardListProps {
  flashcards: FlashcardDTO[];
  pagination: PaginationInfo;
  isLoading: boolean;
  onEdit: (flashcard: FlashcardDTO) => void;
  onDelete: (flashcardId: string) => Promise<void>;
  onPageChange: (page: number) => void;
}

export function FlashcardList({
  flashcards,
  pagination,
  isLoading,
  onEdit,
  onDelete,
  onPageChange,
}: FlashcardListProps) {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleDelete = async (id: string) => {
    if (deletingIds.has(id)) return;

    const confirmed = window.confirm('Czy na pewno chcesz usunąć tę fiszkę?');
    if (!confirmed) return;

    setDeletingIds(prev => new Set(prev).add(id));
    try {
      await onDelete(id);
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncate = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  // Empty state
  if (flashcards.length === 0) {
    return (
      <Alert>
        <AlertDescription className="text-center py-8">
          <p className="text-lg font-medium text-gray-700 mb-2">
            Nie masz jeszcze żadnych fiszek
          </p>
          <p className="text-sm text-gray-500">
            Wygeneruj je za pomocą AI lub dodaj ręcznie
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Awers</TableHead>
              <TableHead className="w-[30%]">Rewers</TableHead>
              <TableHead className="w-[15%]">Utworzono</TableHead>
              <TableHead className="w-[10%]">Metoda</TableHead>
              <TableHead className="w-[15%] text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flashcards.map((flashcard) => (
              <TableRow 
                key={flashcard.id}
                className={deletingIds.has(flashcard.id) ? 'opacity-50' : ''}
              >
                <TableCell className="font-medium">
                  {truncate(flashcard.front_content)}
                </TableCell>
                <TableCell>
                  {truncate(flashcard.back_content)}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(flashcard.created_at)}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={flashcard.ai_generated ? 'default' : 'secondary'}
                  >
                    {flashcard.ai_generated ? 'AI' : 'Ręcznie'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(flashcard)}
                    disabled={deletingIds.has(flashcard.id)}
                  >
                    Edytuj
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(flashcard.id)}
                    disabled={deletingIds.has(flashcard.id)}
                  >
                    {deletingIds.has(flashcard.id) ? 'Usuwanie...' : 'Usuń'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Strona {pagination.page} z {pagination.total_pages} 
            ({pagination.total} fiszek)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Poprzednia
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.total_pages}
            >
              Następna
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

