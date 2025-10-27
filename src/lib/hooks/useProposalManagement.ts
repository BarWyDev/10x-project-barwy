/**
 * useProposalManagement Hook
 * 
 * Manages flashcard proposal state including:
 * - Editing proposals
 * - Deleting proposals
 * - Saving individual proposals
 * - Batch saving all proposals
 * - Tracking saving state for each proposal
 */

import { useState, useCallback } from 'react';
import { createFlashcard, batchCreateFlashcards } from '@/lib/api/flashcards.api';
import type { FlashcardProposal, FlashcardDTO } from '@/types';

type ProposalWithId = FlashcardProposal & { id: string };
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface UseProposalManagementOptions {
  deckId: string;
  initialProposals: FlashcardProposal[];
  demoMode?: boolean;
  onSaveSuccess?: (flashcards: FlashcardDTO[]) => void;
}

export function useProposalManagement({
  deckId,
  initialProposals,
  demoMode = false,
  onSaveSuccess,
}: UseProposalManagementOptions) {
  // Add unique IDs to proposals
  const [proposals, setProposals] = useState<ProposalWithId[]>(
    initialProposals.map(p => ({ ...p, id: crypto.randomUUID() }))
  );
  
  const [savingState, setSavingState] = useState<Record<string, SaveState>>({});
  const [isBatchSaving, setIsBatchSaving] = useState(false);

  /**
   * Update proposal field
   */
  const updateProposal = useCallback((
    index: number,
    field: 'front_content' | 'back_content',
    value: string
  ) => {
    setProposals(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  /**
   * Delete proposal
   */
  const deleteProposal = useCallback((index: number) => {
    setProposals(prev => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Save single proposal
   */
  const saveSingle = useCallback(async (index: number) => {
    const proposal = proposals[index];
    if (!proposal) return;

    const proposalId = proposal.id;
    setSavingState(prev => ({ ...prev, [proposalId]: 'saving' }));

    try {
      await createFlashcard({
        deck_id: deckId,
        front_content: proposal.front_content,
        back_content: proposal.back_content,
      });
      
      setSavingState(prev => ({ ...prev, [proposalId]: 'saved' }));
    } catch (error) {
      console.error('Failed to save flashcard:', error);
      setSavingState(prev => ({ ...prev, [proposalId]: 'error' }));
      throw error;
    }
  }, [proposals, deckId]);

  /**
   * Save all unsaved proposals
   */
  const saveAll = useCallback(async () => {
    const unsavedProposals = proposals.filter(p => savingState[p.id] !== 'saved');
    
    if (unsavedProposals.length === 0) {
      return;
    }

    setIsBatchSaving(true);

    try {
      const result = await batchCreateFlashcards({
        deck_id: deckId,
        flashcards: unsavedProposals.map(({ front_content, back_content }) => ({
          front_content,
          back_content,
          ai_accepted: true,
        })),
      }, demoMode);
      
      // Mark all as saved
      const newSavingState = { ...savingState };
      unsavedProposals.forEach(p => {
        newSavingState[p.id] = 'saved';
      });
      setSavingState(newSavingState);

      // Callback after successful save with created flashcards
      if (onSaveSuccess) {
        setTimeout(() => onSaveSuccess(result.created), 1000);
      }
    } catch (error) {
      console.error('Failed to batch save flashcards:', error);
      throw error;
    } finally {
      setIsBatchSaving(false);
    }
  }, [proposals, savingState, deckId, demoMode, onSaveSuccess]);

  /**
   * Get save state for a proposal
   */
  const getSaveState = useCallback((proposalId: string): SaveState => {
    return savingState[proposalId] || 'idle';
  }, [savingState]);

  /**
   * Get count of unsaved proposals
   */
  const unsavedCount = proposals.filter(p => savingState[p.id] !== 'saved').length;

  /**
   * Check if can save all
   */
  const canSaveAll = unsavedCount > 0 && !isBatchSaving;

  return {
    proposals,
    updateProposal,
    deleteProposal,
    saveSingle,
    saveAll,
    getSaveState,
    isBatchSaving,
    unsavedCount,
    canSaveAll,
  };
}

