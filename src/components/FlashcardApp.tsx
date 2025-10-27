/**
 * FlashcardApp - Main Application Component
 * 
 * Manages the full flashcard creation flow:
 * 1. Deck selection/creation
 * 2. AI generation
 * 3. Verification
 * 4. Database save
 */

import { useState } from 'react';
import { DeckSelector } from './dashboard/DeckSelector';
import { FlashcardGenerator } from './dashboard/FlashcardGenerator';
import { VerificationView } from './verification/VerificationView';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import type { DeckDTO, FlashcardProposal, UsageInfo, FlashcardDTO } from '../types';

type AppView = 'deck-selection' | 'generator' | 'verification' | 'success';

export function FlashcardApp() {
  const [currentView, setCurrentView] = useState<AppView>('deck-selection');
  const [selectedDeck, setSelectedDeck] = useState<DeckDTO | null>(null);
  const [proposals, setProposals] = useState<FlashcardProposal[]>([]);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [createdFlashcards, setCreatedFlashcards] = useState<FlashcardDTO[]>([]);

  const handleDeckSelected = (deck: DeckDTO) => {
    setSelectedDeck(deck);
    setCurrentView('generator');
  };

  const handleGenerateSuccess = (newProposals: FlashcardProposal[], usage: UsageInfo) => {
    setProposals(newProposals);
    setUsageInfo(usage);
    setCurrentView('verification');
  };

  const handleGenerateError = (error: string) => {
    console.error('Generation error:', error);
    // Error is already shown in FlashcardGenerator component
  };

  const handleSaveSuccess = (flashcards: FlashcardDTO[]) => {
    setCreatedFlashcards(flashcards);
    setCurrentView('success');
  };

  const handleCancel = () => {
    if (currentView === 'verification') {
      setCurrentView('generator');
      setProposals([]);
    } else if (currentView === 'generator') {
      // Return to deck selection and clear selected deck
      setSelectedDeck(null);
      setCurrentView('deck-selection');
    }
  };

  const handleStartOver = () => {
    setCurrentView('deck-selection');
    setSelectedDeck(null);
    setProposals([]);
    setCreatedFlashcards([]);
  };

  const handleGenerateMore = () => {
    setCurrentView('generator');
    setProposals([]);
    setCreatedFlashcards([]);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          <Step 
            number={1} 
            title="Wybierz talię" 
            active={currentView === 'deck-selection'}
            completed={currentView !== 'deck-selection'}
          />
          <Divider completed={currentView !== 'deck-selection'} />
          <Step 
            number={2} 
            title="Wygeneruj fiszki" 
            active={currentView === 'generator'}
            completed={currentView === 'verification' || currentView === 'success'}
          />
          <Divider completed={currentView === 'verification' || currentView === 'success'} />
          <Step 
            number={3} 
            title="Weryfikuj i zapisz" 
            active={currentView === 'verification'}
            completed={currentView === 'success'}
          />
        </div>
      </div>

      {/* Main Content */}
      {currentView === 'deck-selection' && (
        <DeckSelector 
          key={selectedDeck?.id || 'no-deck'} // Force remount when deck changes
          onDeckSelected={handleDeckSelected}
          selectedDeckId={selectedDeck?.id}
        />
      )}

      {currentView === 'generator' && selectedDeck && (
        <div className="space-y-6">
          {/* Selected Deck Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedDeck.name}</h3>
                  {selectedDeck.description && (
                    <p className="text-sm text-gray-600">{selectedDeck.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedDeck.flashcard_count} fiszek w talii
                  </p>
                </div>
                <Button variant="outline" onClick={handleCancel}>
                  Zmień talię
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generator */}
          <Card>
            <CardContent className="pt-6">
              <FlashcardGenerator
                deckId={selectedDeck.id}
                initialUsageInfo={usageInfo || undefined}
                onGenerateSuccess={handleGenerateSuccess}
                onGenerateError={handleGenerateError}
                demoMode={false}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {currentView === 'verification' && selectedDeck && (
        <VerificationView
          deckId={selectedDeck.id}
          initialProposals={proposals}
          onSaveSuccess={handleSaveSuccess}
          onCancel={handleCancel}
          demoMode={false}
        />
      )}

      {currentView === 'success' && selectedDeck && (
        <div className="space-y-6">
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-900 mb-2">
                Sukces!
              </h2>
              <p className="text-lg text-green-800 mb-4">
                Zapisano {createdFlashcards.length} fiszek do talii "{selectedDeck.name}"
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Wszystkie fiszki zostały pomyślnie zapisane w bazie danych Supabase
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={handleGenerateMore}>
                  Wygeneruj więcej fiszek
                </Button>
                <Button variant="outline" onClick={handleStartOver}>
                  Wróć do wyboru talii
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          {/* Created Flashcards Preview */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Zapisane fiszki:</h3>
              <div className="space-y-3">
                {createdFlashcards.map((flashcard, index) => (
                  <div 
                    key={flashcard.id} 
                    className="p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <div className="flex-1 space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-500">Awers:</span>
                          <p className="text-sm font-medium text-gray-900">{flashcard.front_content}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500">Rewers:</span>
                          <p className="text-sm text-gray-700">{flashcard.back_content}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Helper Components
interface StepProps {
  number: number;
  title: string;
  active: boolean;
  completed: boolean;
}

function Step({ number, title, active, completed }: StepProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
        ${completed ? 'bg-green-500 text-white' : ''}
        ${active ? 'bg-blue-500 text-white' : ''}
        ${!active && !completed ? 'bg-gray-200 text-gray-500' : ''}
      `}>
        {completed ? '✓' : number}
      </div>
      <span className={`text-sm font-medium ${active ? 'text-gray-900' : 'text-gray-500'}`}>
        {title}
      </span>
    </div>
  );
}

function Divider({ completed }: { completed: boolean }) {
  return (
    <div className={`h-0.5 w-16 ${completed ? 'bg-green-500' : 'bg-gray-200'}`} />
  );
}






