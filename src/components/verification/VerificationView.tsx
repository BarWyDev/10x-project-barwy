/**
 * VerificationView Component
 *
 * Main view for reviewing and editing AI-generated flashcard proposals.
 * Allows editing, deletion, and batch saving of proposals.
 *
 * Refactored to use:
 * - useProposalManagement custom hook for state management
 * - ProposalCard component for individual proposals
 */

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ProposalCard } from "./ProposalCard";
import { useProposalManagement } from "@/lib/hooks/useProposalManagement";
import type { FlashcardProposal } from "@/types";

interface VerificationViewProps {
  initialProposals: FlashcardProposal[];
  deckId: string;
  onCancel: () => void;
  onSaveSuccess: () => void;
  demoMode?: boolean;
}

export const VerificationView = ({
  initialProposals,
  deckId,
  onCancel,
  onSaveSuccess,
  demoMode = false,
}: VerificationViewProps) => {
  // Use custom hook for proposal management
  const {
    proposals,
    updateProposal,
    deleteProposal,
    saveSingle,
    saveAll,
    getSaveState,
    isBatchSaving,
    unsavedCount,
    canSaveAll,
  } = useProposalManagement({
    deckId,
    initialProposals,
    demoMode,
    onSaveSuccess,
  });

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Weryfikacja wygenerowanych fiszek</h1>
        <p className="text-muted-foreground mt-1">
          Przejrzyj i edytuj fiszki przed zapisaniem. Możesz zmienić treść lub usunąć niepotrzebne fiszki.
        </p>
        <p className="text-sm font-medium mt-2">
          Liczba fiszek: <span className="text-primary">{proposals.length}</span>
        </p>
      </div>

      <div className="space-y-4">
        {proposals.map((proposal, index) => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            index={index}
            isSaving={getSaveState(proposal.id) === "saving"}
            isSaved={getSaveState(proposal.id) === "saved"}
            onUpdate={updateProposal}
            onDelete={deleteProposal}
            onSave={saveSingle}
          />
        ))}
      </div>

      {proposals.length > 0 && (
        <div className="mt-8 flex justify-end items-center gap-2 sticky bottom-4 bg-background/80 backdrop-blur-sm py-3 px-4 rounded-md border">
          <Button variant="outline" onClick={onCancel} disabled={isBatchSaving}>
            Anuluj
          </Button>
          <Button onClick={saveAll} disabled={!canSaveAll}>
            {isBatchSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {`Zapisz pozostałe (${unsavedCount})`}
          </Button>
        </div>
      )}
    </div>
  );
};
