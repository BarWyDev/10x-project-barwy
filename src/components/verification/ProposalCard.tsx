/**
 * ProposalCard Component
 *
 * Displays a single flashcard proposal with:
 * - Editable front and back content
 * - Save individual button
 * - Delete button
 * - Visual feedback for saved state
 */

import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Loader2, CheckCircle2 } from "lucide-react";
import type { FlashcardProposal } from "@/types";

export interface ProposalCardProps {
  proposal: FlashcardProposal & { id: string };
  index: number;
  isSaving: boolean;
  isSaved: boolean;
  onUpdate: (index: number, field: "front_content" | "back_content", value: string) => void;
  onDelete: (index: number) => void;
  onSave: (index: number) => void;
}

export const ProposalCard = React.memo(
  ({ proposal, index, isSaving, isSaved, onUpdate, onDelete, onSave }: ProposalCardProps) => {
    const handleFrontChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdate(index, "front_content", e.target.value);
      },
      [index, onUpdate]
    );

    const handleBackChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdate(index, "back_content", e.target.value);
      },
      [index, onUpdate]
    );

    const handleDelete = useCallback(() => {
      onDelete(index);
    }, [index, onDelete]);

    const handleSave = useCallback(() => {
      onSave(index);
    }, [index, onSave]);

    return (
      <Card className={`bg-white/50 transition-opacity ${isSaved ? "opacity-60" : ""}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Fiszka {index + 1}</span>
            <div className="flex items-center gap-2">
              {!isSaved && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  aria-label="Save flashcard"
                  className="text-blue-600 hover:text-blue-800 px-2"
                >
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isSaving ? "Zapisywanie..." : "Zapisz"}
                </Button>
              )}
              {isSaved && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Zapisano</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isSaved || isSaving}
                aria-label="Delete flashcard"
                className="text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor={`front-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                Awers (przód fiszki)
              </label>
              <Textarea
                id={`front-${index}`}
                value={proposal.front_content}
                onChange={handleFrontChange}
                placeholder="Pytanie lub hasło..."
                rows={3}
                maxLength={1000}
                disabled={isSaved || isSaving}
                className="w-full resize-none"
              />
            </div>
            <div>
              <label htmlFor={`back-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                Rewers (tył fiszki)
              </label>
              <Textarea
                id={`back-${index}`}
                value={proposal.back_content}
                onChange={handleBackChange}
                placeholder="Odpowiedź lub definicja..."
                rows={4}
                maxLength={2000}
                disabled={isSaved || isSaving}
                className="w-full resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

ProposalCard.displayName = "ProposalCard";
