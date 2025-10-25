/**
 * Test Components Page
 * 
 * Demonstrates all implemented dashboard and verification components
 */

import { useState } from 'react';
import { UsageLimitIndicator } from './dashboard/UsageLimitIndicator';
import { CharacterCounter } from './dashboard/CharacterCounter';
import { FlashcardList } from './dashboard/FlashcardList';
import { FlashcardGenerator } from './dashboard/FlashcardGenerator';
import { VerificationView } from './verification/VerificationView';
import type { FlashcardDTO, UsageInfo, FlashcardProposal } from '../types';

export function TestComponents() {
  const [view, setView] = useState<'dashboard' | 'verification'>('dashboard');
  const [proposals, setProposals] = useState<FlashcardProposal[]>([]);

  // Mock data
  const mockUsageInfo: UsageInfo = {
    generated_count: 2,
    total_generated_today: 45,
    daily_limit: 100,
  };

  const mockFlashcards: FlashcardDTO[] = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      user_id: '00000000-0000-0000-0000-000000000000',
      deck_id: '00000000-0000-0000-0000-000000000000',
      front_content: 'Co to są mitochondria?',
      back_content: 'Organelle komórkowe odpowiedzialne za produkcję ATP',
      status: 'new',
      ai_generated: true,
      ai_accepted: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      user_id: '00000000-0000-0000-0000-000000000000',
      deck_id: '00000000-0000-0000-0000-000000000000',
      front_content: 'Jaka jest stolica Polski?',
      back_content: 'Warszawa',
      status: 'new',
      ai_generated: false,
      ai_accepted: null,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const mockPagination = {
    page: 1,
    limit: 20,
    total: 2,
    total_pages: 1,
  };

  const handleGenerateSuccess = (newProposals: FlashcardProposal[], usage: UsageInfo) => {
    console.log('Generated proposals:', newProposals);
    console.log('Usage info:', usage);
    setProposals(newProposals);
    setView('verification');
  };

  const handleSaveSuccess = (flashcards: FlashcardDTO[]) => {
    console.log('Saved flashcards:', flashcards);
    alert(`Zapisano ${flashcards.length} fiszek!`);
    setView('dashboard');
    setProposals([]);
  };

  if (view === 'verification' && proposals.length > 0) {
    return (
      <VerificationView
        deckId="00000000-0000-0000-0000-000000000000"
        initialProposals={proposals}
        onSaveSuccess={handleSaveSuccess}
        onCancel={() => {
          setView('dashboard');
          setProposals([]);
        }}
        demoMode={true}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Section 1: Usage Limit Indicator */}
      <section className="border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-4">1. UsageLimitIndicator</h2>
        <UsageLimitIndicator usageInfo={mockUsageInfo} />
      </section>

      {/* Section 2: Character Counter */}
      <section className="border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-4">2. CharacterCounter</h2>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-gray-600 mb-1">Normalny (20/100):</p>
            <CharacterCounter current={20} max={100} />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Ostrzeżenie (85/100):</p>
            <CharacterCounter current={85} max={100} />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Przekroczony (110/100):</p>
            <CharacterCounter current={110} max={100} />
          </div>
        </div>
      </section>

      {/* Section 3: Flashcard Generator */}
      <section className="border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-4">3. FlashcardGenerator</h2>
        <p className="text-sm text-gray-600 mb-4">
          Wypróbuj generator - wprowadź minimum 50 znaków tekstu i kliknij "Generuj".
          <br />
          <strong>Uwaga:</strong> Wymaga działającego API backendu.
        </p>
        <FlashcardGenerator
          deckId="00000000-0000-0000-0000-000000000000"
          initialUsageInfo={mockUsageInfo}
          onGenerateSuccess={handleGenerateSuccess}
          onGenerateError={(error) => alert('Błąd: ' + error)}
          demoMode={true}
        />
      </section>

      {/* Section 4: Flashcard List */}
      <section className="border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-4">4. FlashcardList</h2>
        <FlashcardList
          flashcards={mockFlashcards}
          pagination={mockPagination}
          isLoading={false}
          onEdit={(flashcard) => {
            console.log('Edit:', flashcard);
            alert(`Edycja fiszki: ${flashcard.front_content}`);
          }}
          onDelete={async (id) => {
            console.log('Delete:', id);
            return new Promise((resolve) => {
              setTimeout(() => {
                alert(`Usunięto fiszkę: ${id}`);
                resolve();
              }, 500);
            });
          }}
          onPageChange={(page) => {
            console.log('Page change:', page);
          }}
        />
      </section>

      {/* Section 5: Empty State */}
      <section className="border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-4">5. FlashcardList - Empty State</h2>
        <FlashcardList
          flashcards={[]}
          pagination={{ page: 1, limit: 20, total: 0, total_pages: 0 }}
          isLoading={false}
          onEdit={() => {}}
          onDelete={async () => {}}
          onPageChange={() => {}}
        />
      </section>

      {/* Section 6: Loading State */}
      <section className="border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-4">6. FlashcardList - Loading State</h2>
        <FlashcardList
          flashcards={[]}
          pagination={{ page: 1, limit: 20, total: 0, total_pages: 0 }}
          isLoading={true}
          onEdit={() => {}}
          onDelete={async () => {}}
          onPageChange={() => {}}
        />
      </section>
    </div>
  );
}

