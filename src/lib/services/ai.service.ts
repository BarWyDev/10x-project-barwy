/**
 * AI Service
 * 
 * Handles AI-powered flashcard generation using OpenAI API.
 * Supports generating educational flashcards from provided text.
 */

import { AIGenerationError } from '../errors/api-errors';
import type { FlashcardProposal } from '../../types';

/**
 * OpenAI API configuration
 */
const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const AI_REQUEST_TIMEOUT = 30000; // 30 seconds
const MODEL = 'gpt-4o-mini'; // Cost-effective model for flashcard generation

/**
 * OpenAI Chat Completion message structure
 */
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * OpenAI Chat Completion API response structure
 */
interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Expected JSON structure from AI response
 */
interface FlashcardsResponse {
  flashcards: Array<{
    front_content: string;
    back_content: string;
  }>;
}

export class AIService {
  /**
   * Calls OpenAI Chat Completions API with timeout handling
   * 
   * @param messages - Array of chat messages (system + user prompts)
   * @returns Raw response content from AI
   * @throws {AIGenerationError} If API call fails or times out
   * 
   * Features:
   * - 30-second timeout
   * - JSON response format enforcement
   * - Proper error handling for API failures
   */
  private async callOpenAI(messages: OpenAIMessage[]): Promise<string> {
    // Check if API key is configured
    if (!OPENAI_API_KEY) {
      throw new AIGenerationError('OpenAI API key not configured', {
        reason: 'Missing OPENAI_API_KEY environment variable',
      });
    }

    // Setup abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT);

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages,
          temperature: 0.7, // Balanced creativity
          response_format: { type: 'json_object' }, // Enforce JSON response
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle API errors
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
      }

      const data = await response.json() as OpenAIResponse;
      
      // Validate response structure
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response structure from OpenAI');
      }

      return data.choices[0].message.content;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle abort/timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AIGenerationError('AI generation timed out', {
          reason: 'Service timeout after 30 seconds',
        });
      }
      
      // Handle other errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new AIGenerationError('Failed to generate flashcards', {
        reason: errorMessage,
      });
    }
  }

  /**
   * Generates flashcard proposals from provided text using AI
   * 
   * @param text - Source text to generate flashcards from (50-5000 characters)
   * @returns Array of flashcard proposals
   * @throws {AIGenerationError} If generation fails or returns invalid data
   * 
   * Process:
   * 1. Constructs system prompt with flashcard generation guidelines
   * 2. Calls OpenAI API with text
   * 3. Parses JSON response
   * 4. Validates flashcard structure
   * 5. Returns 2-5 flashcard proposals
   * 
   * Guidelines for AI:
   * - Create 2-5 flashcards depending on content richness
   * - Make questions clear and specific
   * - Keep answers concise but complete
   * - Focus on key concepts and facts
   * - Ensure flashcards are educational and testable
   */
  async generateFlashcards(text: string): Promise<FlashcardProposal[]> {
    // System prompt defines the AI's role and output format
    const systemPrompt = `You are a helpful assistant that creates educational flashcards from provided text. 
Generate flashcards in JSON format with the following structure:
{
  "flashcards": [
    {
      "front_content": "Question or prompt",
      "back_content": "Answer or explanation"
    }
  ]
}

Guidelines:
- Create 2-5 flashcards depending on the content richness
- Make questions clear and specific
- Keep answers concise but complete (1-3 sentences ideal)
- Focus on key concepts and facts that are important to remember
- Ensure flashcards are educational and testable
- Avoid yes/no questions - prefer "What", "How", "Why" questions
- Each flashcard should test a single, distinct concept
- Use proper grammar and punctuation`;

    // User prompt contains the actual text to process
    const userPrompt = `Create flashcards from the following text:\n\n${text}`;

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    // Call OpenAI API
    const responseText = await this.callOpenAI(messages);

    // Parse and validate response
    try {
      const parsed = JSON.parse(responseText) as FlashcardsResponse;
      const flashcards = parsed.flashcards;

      // Validate we got flashcards
      if (!Array.isArray(flashcards) || flashcards.length === 0) {
        throw new AIGenerationError('Could not generate flashcards from the provided text', {
          reason: 'No flashcards generated - text may be too short, unclear, or not suitable',
        });
      }

      // Validate and transform each flashcard
      const proposals: FlashcardProposal[] = flashcards.map((card, index) => {
        // Validate required fields
        if (!card.front_content || !card.back_content) {
          throw new AIGenerationError('Invalid flashcard format from AI', {
            reason: `Flashcard at index ${index} is missing required fields`,
          });
        }

        // Trim whitespace and validate content length
        const frontContent = card.front_content.trim();
        const backContent = card.back_content.trim();

        if (frontContent.length === 0 || backContent.length === 0) {
          throw new AIGenerationError('Invalid flashcard format from AI', {
            reason: `Flashcard at index ${index} has empty content after trimming`,
          });
        }

        // Enforce maximum lengths (from database schema)
        if (frontContent.length > 1000) {
          throw new AIGenerationError('Invalid flashcard format from AI', {
            reason: `Front content at index ${index} exceeds 1000 characters`,
          });
        }

        if (backContent.length > 2000) {
          throw new AIGenerationError('Invalid flashcard format from AI', {
            reason: `Back content at index ${index} exceeds 2000 characters`,
          });
        }

        return {
          front_content: frontContent,
          back_content: backContent,
        };
      });

      return proposals;
    } catch (error) {
      // Re-throw AIGenerationError as-is
      if (error instanceof AIGenerationError) {
        throw error;
      }
      
      // Wrap JSON parsing errors
      throw new AIGenerationError('Failed to parse AI response', {
        reason: 'Invalid JSON format from AI',
      });
    }
  }
}

