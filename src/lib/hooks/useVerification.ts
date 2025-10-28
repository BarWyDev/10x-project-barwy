/**
 * useVerification Hook
 *
 * Manages the state and logic for AI proposal verification and editing.
 * Handles validation, batch creation, and proposal management.
 */

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { batchCreateFlashcards, APIError } from "../api/flashcards.api";
import { validateFlashcardContent } from "../utils/validation";
import type { FlashcardProposal, BatchCreateFlashcardsResponse, ErrorResponse } from "../../types";

export interface EditableProposal {
  id: string; // temporary client-side ID
  front_content: string;
  back_content: string;
  isEdited: boolean; // whether user edited this proposal
  errors: {
    front_content?: string;
    back_content?: string;
  };
}

export interface UseVerificationReturn {
  // State
  proposals: EditableProposal[];
  isSaving: boolean;
  error: ErrorResponse | null;

  // Actions
  initializeProposals: (proposals: FlashcardProposal[]) => void;
  updateProposal: (id: string, field: "front_content" | "back_content", value: string) => void;
  deleteProposal: (id: string) => void;
  saveAllProposals: (deckId: string, demo?: boolean) => Promise<BatchCreateFlashcardsResponse | null>;
  resetError: () => void;

  // Validation
  isValid: boolean;
  hasProposals: boolean;
}

export function useVerification(demoMode = false): UseVerificationReturn {
  const [proposals, setProposals] = useState<EditableProposal[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);

  // Initialize proposals from AI response
  const initializeProposals = useCallback((rawProposals: FlashcardProposal[]) => {
    const editableProposals: EditableProposal[] = rawProposals.map((proposal) => ({
      id: uuidv4(),
      front_content: proposal.front_content,
      back_content: proposal.back_content,
      isEdited: false,
      errors: {},
    }));

    setProposals(editableProposals);
  }, []);

  // Update a single proposal
  const updateProposal = useCallback(
    (id: string, field: "front_content" | "back_content", value: string) => {
      setProposals((prev) =>
        prev.map((proposal) => {
          if (proposal.id !== id) return proposal;

          // Mark as edited if value changed
          const originalValue = field === "front_content" ? proposal.front_content : proposal.back_content;
          const isEdited = value !== originalValue || proposal.isEdited;

          // Validate the updated proposal
          const updatedProposal = {
            ...proposal,
            [field]: value,
            isEdited,
          };

          const validation = validateFlashcardContent(updatedProposal.front_content, updatedProposal.back_content);

          return {
            ...updatedProposal,
            errors: {
              front_content: validation.front.error,
              back_content: validation.back.error,
            },
          };
        })
      );

      // Reset error when user makes changes
      if (error) {
        setError(null);
      }
    },
    [error]
  );

  // Delete a proposal
  const deleteProposal = useCallback((id: string) => {
    setProposals((prev) => prev.filter((proposal) => proposal.id !== id));
  }, []);

  // Save all proposals
  const saveAllProposals = useCallback(
    async (deckId: string, demo = false): Promise<BatchCreateFlashcardsResponse | null> => {
      // Validate all proposals
      const allValid = proposals.every((proposal) => {
        const validation = validateFlashcardContent(proposal.front_content, proposal.back_content);
        return validation.isValid;
      });

      if (!allValid) {
        setError({
          error: {
            code: "VALIDATION_ERROR",
            message: "Popraw błędy walidacji przed zapisaniem",
          },
        });
        return null;
      }

      if (proposals.length === 0) {
        setError({
          error: {
            code: "VALIDATION_ERROR",
            message: "Musisz zostawić przynajmniej jedną fiszkę",
          },
        });
        return null;
      }

      setIsSaving(true);
      setError(null);

      try {
        const payload = {
          deck_id: deckId,
          flashcards: proposals.map((proposal) => ({
            front_content: proposal.front_content.trim(),
            back_content: proposal.back_content.trim(),
            ai_accepted: !proposal.isEdited, // true if not edited by user
          })),
        };

        console.log("[useVerification] Saving proposals:", payload);

        const response = await batchCreateFlashcards(payload, demo || demoMode);

        return response;
      } catch (err) {
        if (err instanceof APIError) {
          setError({
            error: {
              code: err.code,
              message: err.message,
              details: err.details,
            },
          });
        } else if (err instanceof TypeError && err.message === "Failed to fetch") {
          setError({
            error: {
              code: "INTERNAL_ERROR" as const,
              message: "Problem z połączeniem. Sprawdź internet i spróbuj ponownie.",
            },
          });
        } else {
          setError({
            error: {
              code: "INTERNAL_ERROR" as const,
              message: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
            },
          });
        }
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [proposals, demoMode]
  );

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // Check if all proposals are valid
  const isValid = proposals.every((proposal) => {
    const validation = validateFlashcardContent(proposal.front_content, proposal.back_content);
    return validation.isValid;
  });

  const hasProposals = proposals.length > 0;

  return {
    proposals,
    isSaving,
    error,
    initializeProposals,
    updateProposal,
    deleteProposal,
    saveAllProposals,
    resetError,
    isValid,
    hasProposals,
  };
}
