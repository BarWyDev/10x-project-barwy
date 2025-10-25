/**
 * VerificationView Component
 * 
 * Main view for reviewing and editing AI-generated flashcard proposals.
 * Allows editing, deletion, and batch saving of proposals.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { createFlashcard, batchCreateFlashcards } from '@/lib/api/flashcards.api';
import type { FlashcardProposal, Flashcard } from '@/types';

interface ProposalCardProps {
  proposal: FlashcardProposal;
  index: number;
  isSaving: boolean;
  isSaved: boolean;
  onUpdate: (index: number, field: 'front_content' | 'back_content', value: string) => void;
  onDelete: (index: number) => void;
  onSave: (index: number) => void;
}

const ProposalCard = ({ proposal, index, isSaving, isSaved, onUpdate, onDelete, onSave }: ProposalCardProps) => {
  return (
    <Card className={`bg-white/50 transition-opacity ${isSaved ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Fiszka {index + 1}</span>
          <div className="flex items-center gap-2">
            {!isSaved && (
              <Button
                variant="link"
                size="sm"
                onClick={() => onSave(index)}
                disabled={isSaving}
                aria-label="Save flashcard"
                className="text-blue-600 hover:text-blue-800 px-2"
              >
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isSaving ? 'Zapisywanie...' : 'Zapisz'}
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
              onClick={() => onDelete(index)}
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
              onChange={(e) => onUpdate(index, 'front_content', e.target.value)}
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
              onChange={(e) => onUpdate(index, 'back_content', e.target.value)}
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
};


export const VerificationView = ({ initialProposals, deckId, onCancel, onSaveSuccess, demoMode = false }) => {
  const [proposals, setProposals] = useState<FlashcardProposal[]>(initialProposals.map(p => ({ ...p, id: crypto.randomUUID() })));
  const [savingState, setSavingState] = useState<{ [key: string]: 'idle' | 'saving' | 'saved' }>({});
  const [isBatchSaving, setIsBatchSaving] = useState(false);

  const handleUpdate = (index: number, field: 'front_content' | 'back_content', value: string) => {
    const newProposals = [...proposals];
    newProposals[index][field] = value;
    setProposals(newProposals);
  };

  const handleDelete = (index: number) => {
    const newProposals = proposals.filter((_, i) => i !== index);
    setProposals(newProposals);
  };

  const handleSaveSingle = async (index: number) => {
    const proposal = proposals[index];
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
      setSavingState(prev => ({ ...prev, [proposalId]: 'idle' }));
      // TODO: Show error toast
    }
  };

  const handleSaveAll = async () => {
    const unsavedProposals = proposals.filter(p => savingState[p.id] !== 'saved');
    if (unsavedProposals.length === 0) return;

    setIsBatchSaving(true);
    try {
      await batchCreateFlashcards({
        deck_id: deckId,
        flashcards: unsavedProposals.map(({ front_content, back_content }) => ({
          front_content,
          back_content,
          ai_accepted: true, // Add the missing field
        })),
      }, demoMode);
      
      // Mark all as saved
      const newSavingState = { ...savingState };
      unsavedProposals.forEach(p => {
        newSavingState[p.id] = 'saved';
      });
      setSavingState(newSavingState);

      // Potentially call onSaveSuccess after a delay to show all are saved
      setTimeout(() => onSaveSuccess(), 1000);

    } catch (error) {
      console.error('Failed to batch save flashcards:', error);
      // TODO: Show error toast
    } finally {
      setIsBatchSaving(false);
    }
  };

  const unsavedCount = proposals.filter(p => savingState[p.id] !== 'saved').length;
  const canSaveAll = unsavedCount > 0 && !isBatchSaving;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Weryfikacja wygenerowanych fiszek</h1>
        <p className="text-muted-foreground mt-1">
          Przejrzyj i edytuj fiszki przed zapisaniem. Możesz zmienić treść lub usunąć niepotrzebne fiszki.
        </p>
        <p className="text-sm font-medium mt-2">Liczba fiszek: <span className="text-primary">{proposals.length}</span></p>
      </div>

      <div className="space-y-4">
        {proposals.map((proposal, index) => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            index={index}
            isSaving={savingState[proposal.id] === 'saving'}
            isSaved={savingState[proposal.id] === 'saved'}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onSave={() => handleSaveSingle(index)}
          />
        ))}
      </div>

      {proposals.length > 0 && (
        <div className="mt-8 flex justify-end items-center gap-2 sticky bottom-4 bg-background/80 backdrop-blur-sm py-3 px-4 rounded-md border">
          <Button variant="outline" onClick={onCancel} disabled={isBatchSaving}>
            Anuluj
          </Button>
          <Button onClick={handleSaveAll} disabled={!canSaveAll}>
            {isBatchSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {`Zapisz pozostałe (${unsavedCount})`}
          </Button>
        </div>
      )}
    </div>
  );
};

