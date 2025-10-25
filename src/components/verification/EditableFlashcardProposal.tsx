/**
 * EditableFlashcardProposal Component
 * 
 * Displays a single AI-generated flashcard proposal with inline editing capabilities.
 * Includes validation, character counters, and delete functionality.
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CharacterCounter } from '../dashboard/CharacterCounter';
import type { EditableProposal } from '@/lib/hooks/useVerification';

export interface EditableFlashcardProposalProps {
  proposal: EditableProposal;
  index: number;
  onChange: (id: string, field: 'front_content' | 'back_content', value: string) => void;
  onDelete: (id: string) => void;
}

const FRONT_MAX = 1000;
const BACK_MAX = 2000;

export function EditableFlashcardProposal({
  proposal,
  index,
  onChange,
  onDelete,
}: EditableFlashcardProposalProps) {
  const handleFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= FRONT_MAX) {
      onChange(proposal.id, 'front_content', value);
    }
  };

  const handleBackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= BACK_MAX) {
      onChange(proposal.id, 'back_content', value);
    }
  };

  const hasErrors = !!(proposal.errors.front_content || proposal.errors.back_content);

  return (
    <Card className={hasErrors ? 'border-red-300' : undefined}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-600">
            Fiszka {index + 1}
          </span>
          {proposal.isEdited && (
            <Badge variant="secondary" className="text-xs">
              Edytowano
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(proposal.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          aria-label="Usuń fiszkę"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Front Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`front-${proposal.id}`} className="text-sm font-medium">
              Awers (przód fiszki)
            </Label>
            <CharacterCounter 
              current={proposal.front_content.length} 
              max={FRONT_MAX} 
            />
          </div>
          <Input
            id={`front-${proposal.id}`}
            value={proposal.front_content}
            onChange={handleFrontChange}
            placeholder="Pytanie lub hasło..."
            className={proposal.errors.front_content ? 'border-red-500' : ''}
            aria-invalid={!!proposal.errors.front_content}
            aria-describedby={
              proposal.errors.front_content ? `front-error-${proposal.id}` : undefined
            }
          />
          {proposal.errors.front_content && (
            <p 
              id={`front-error-${proposal.id}`}
              className="text-xs text-red-600"
            >
              {proposal.errors.front_content}
            </p>
          )}
        </div>

        {/* Back Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`back-${proposal.id}`} className="text-sm font-medium">
              Rewers (tył fiszki)
            </Label>
            <CharacterCounter 
              current={proposal.back_content.length} 
              max={BACK_MAX} 
            />
          </div>
          <Textarea
            id={`back-${proposal.id}`}
            value={proposal.back_content}
            onChange={handleBackChange}
            placeholder="Odpowiedź lub wyjaśnienie..."
            className={`min-h-[100px] resize-y ${
              proposal.errors.back_content ? 'border-red-500' : ''
            }`}
            aria-invalid={!!proposal.errors.back_content}
            aria-describedby={
              proposal.errors.back_content ? `back-error-${proposal.id}` : undefined
            }
          />
          {proposal.errors.back_content && (
            <p 
              id={`back-error-${proposal.id}`}
              className="text-xs text-red-600"
            >
              {proposal.errors.back_content}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

