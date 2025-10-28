/**
 * FlashcardFlowContext
 *
 * Manages the state and flow of the flashcard creation process:
 * 1. Deck selection
 * 2. Generation
 * 3. Verification
 * 4. Success
 *
 * Eliminates prop drilling and centralizes state management
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { DeckDTO, FlashcardProposal, UsageInfo, FlashcardDTO } from "@/types";

type AppView = "deck-selection" | "generator" | "verification" | "success";

interface FlashcardFlowState {
  currentView: AppView;
  selectedDeck: DeckDTO | null;
  proposals: FlashcardProposal[];
  usageInfo: UsageInfo | null;
  createdFlashcards: FlashcardDTO[];
  returningFromGenerator: boolean;
}

interface FlashcardFlowContextValue extends FlashcardFlowState {
  // Actions
  selectDeck: (deck: DeckDTO) => void;
  generateSuccess: (proposals: FlashcardProposal[], usage: UsageInfo) => void;
  generateError: (error: string) => void;
  saveSuccess: (flashcards: FlashcardDTO[]) => void;
  cancel: () => void;
  startOver: () => void;
  generateMore: () => void;
}

const FlashcardFlowContext = createContext<FlashcardFlowContextValue | undefined>(undefined);

const initialState: FlashcardFlowState = {
  currentView: "deck-selection",
  selectedDeck: null,
  proposals: [],
  usageInfo: null,
  createdFlashcards: [],
  returningFromGenerator: false,
};

export function FlashcardFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FlashcardFlowState>(initialState);

  /**
   * Handle deck selection
   */
  const selectDeck = useCallback((deck: DeckDTO) => {
    setState((prev) => ({
      ...prev,
      selectedDeck: deck,
      returningFromGenerator: false,
      currentView: "generator",
    }));
  }, []);

  /**
   * Handle successful generation
   */
  const generateSuccess = useCallback((proposals: FlashcardProposal[], usage: UsageInfo) => {
    setState((prev) => ({
      ...prev,
      proposals,
      usageInfo: usage,
      currentView: "verification",
    }));
  }, []);

  /**
   * Handle generation error
   */
  const generateError = useCallback((error: string) => {
    console.error("Generation error:", error);
    // Error is shown in FlashcardGenerator component
  }, []);

  /**
   * Handle successful save
   */
  const saveSuccess = useCallback((flashcards: FlashcardDTO[]) => {
    setState((prev) => ({
      ...prev,
      createdFlashcards: flashcards,
      currentView: "success",
    }));
  }, []);

  /**
   * Handle cancel action
   */
  const cancel = useCallback(() => {
    setState((prev) => {
      if (prev.currentView === "verification") {
        return {
          ...prev,
          currentView: "generator",
          proposals: [],
        };
      } else if (prev.currentView === "generator") {
        return {
          ...prev,
          returningFromGenerator: true,
          selectedDeck: null,
          currentView: "deck-selection",
        };
      }
      return prev;
    });
  }, []);

  /**
   * Start over from beginning
   */
  const startOver = useCallback(() => {
    setState({
      ...initialState,
      currentView: "deck-selection",
    });
  }, []);

  /**
   * Generate more flashcards for current deck
   */
  const generateMore = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentView: "generator",
      proposals: [],
      createdFlashcards: [],
    }));
  }, []);

  const value: FlashcardFlowContextValue = {
    ...state,
    selectDeck,
    generateSuccess,
    generateError,
    saveSuccess,
    cancel,
    startOver,
    generateMore,
  };

  return <FlashcardFlowContext.Provider value={value}>{children}</FlashcardFlowContext.Provider>;
}

/**
 * Hook to access FlashcardFlow context
 */
export function useFlashcardFlow() {
  const context = useContext(FlashcardFlowContext);

  if (context === undefined) {
    throw new Error("useFlashcardFlow must be used within a FlashcardFlowProvider");
  }

  return context;
}
