/**
 * FlashcardApp - Main Application Component
 *
 * Manages the full flashcard creation flow:
 * 1. Deck selection/creation
 * 2. AI generation
 * 3. Verification
 * 4. Database save
 *
 * Refactored to use:
 * - FlashcardFlowContext for state management
 * - Eliminates prop drilling
 */

import { DeckSelector } from "./dashboard/DeckSelector";
import { FlashcardGenerator } from "./dashboard/FlashcardGenerator";
import { VerificationView } from "./verification/VerificationView";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { FlashcardFlowProvider, useFlashcardFlow } from "@/contexts/FlashcardFlowContext";
import { getFlashcardPlural } from "@/lib/utils/formatting";

/**
 * Main App Content (uses context)
 */
function FlashcardAppContent() {
  const {
    currentView,
    selectedDeck,
    proposals,
    usageInfo,
    createdFlashcards,
    returningFromGenerator,
    selectDeck,
    generateSuccess,
    generateError,
    saveSuccess,
    cancel,
    startOver,
    generateMore,
  } = useFlashcardFlow();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          <Step
            number={1}
            title="Wybierz talię"
            active={currentView === "deck-selection"}
            completed={currentView !== "deck-selection"}
          />
          <Divider completed={currentView !== "deck-selection"} />
          <Step
            number={2}
            title="Wygeneruj fiszki"
            active={currentView === "generator"}
            completed={currentView === "verification" || currentView === "success"}
          />
          <Divider completed={currentView === "verification" || currentView === "success"} />
          <Step
            number={3}
            title="Weryfikuj i zapisz"
            active={currentView === "verification"}
            completed={currentView === "success"}
          />
        </div>
      </div>

      {/* Main Content */}
      {currentView === "deck-selection" && (
        <DeckSelector
          key={selectedDeck?.id || "no-deck"}
          onDeckSelected={selectDeck}
          selectedDeckId={selectedDeck?.id}
          autoSelectFirst={!returningFromGenerator}
        />
      )}

      {currentView === "generator" && selectedDeck && (
        <div className="space-y-6">
          {/* Selected Deck Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedDeck.name}</h3>
                  {selectedDeck.description && <p className="text-sm text-gray-600">{selectedDeck.description}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedDeck.flashcard_count} {getFlashcardPlural(selectedDeck.flashcard_count)} w talii
                  </p>
                </div>
                <Button variant="outline" onClick={cancel}>
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
                onGenerateSuccess={generateSuccess}
                onGenerateError={generateError}
                demoMode={false}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {currentView === "verification" && selectedDeck && (
        <VerificationView
          deckId={selectedDeck.id}
          initialProposals={proposals}
          onSaveSuccess={() => saveSuccess([])}
          onCancel={cancel}
          demoMode={false}
        />
      )}

      {currentView === "success" && selectedDeck && (
        <div className="space-y-6">
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-900 mb-2">Sukces!</h2>
              <p className="text-lg text-green-800 mb-4">
                Zapisano {createdFlashcards?.length || 0} {getFlashcardPlural(createdFlashcards?.length || 0)} do talii
                &ldquo;{selectedDeck.name}&rdquo;
              </p>
              <p className="text-sm text-gray-600 mb-6">Wszystkie fiszki zostały pomyślnie zapisane w bazie danych</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg">
                  <a href="/app">Zobacz moje fiszki</a>
                </Button>
                <Button variant="outline" onClick={generateMore}>
                  Wygeneruj więcej
                </Button>
                <Button variant="outline" onClick={startOver}>
                  Zmień talię
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          {/* Created Flashcards Preview */}
          {createdFlashcards && createdFlashcards.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Zapisane fiszki:</h3>
                <div className="space-y-3">
                  {createdFlashcards.map((flashcard, index) => (
                    <div key={flashcard.id} className="p-4 border rounded-lg bg-gray-50">
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
          )}
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
      <div
        className={`
        w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
        ${completed ? "bg-green-500 text-white" : ""}
        ${active ? "bg-blue-500 text-white" : ""}
        ${!active && !completed ? "bg-gray-200 text-gray-500" : ""}
      `}
      >
        {completed ? "✓" : number}
      </div>
      <span className={`text-sm font-medium ${active ? "text-gray-900" : "text-gray-500"}`}>{title}</span>
    </div>
  );
}

function Divider({ completed }: { completed: boolean }) {
  return <div className={`h-0.5 w-16 ${completed ? "bg-green-500" : "bg-gray-200"}`} />;
}

/**
 * Main FlashcardApp Component (with Provider)
 */
export function FlashcardApp() {
  return (
    <FlashcardFlowProvider>
      <FlashcardAppContent />
    </FlashcardFlowProvider>
  );
}
