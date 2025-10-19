# API Endpoint Implementation Plan: Generate Flashcard Proposals

## 1. Przegląd punktu końcowego

Endpoint `POST /api/flashcards/generate` umożliwia użytkownikom generowanie propozycji fiszek z dostarczonego tekstu przy użyciu sztucznej inteligencji (OpenAI/OpenRouter). Endpoint nie tworzy fiszek bezpośrednio w bazie danych - zwraca jedynie propozycje, które użytkownik może przejrzeć, edytować i zaakceptować w osobnym procesie (poprzez endpoint `/api/flashcards/batch`).

**Kluczowe funkcje:**
- Generowanie wielu propozycji fiszek z pojedynczego tekstu źródłowego
- Walidacja przynależności talii do użytkownika
- Kontrola limitów dziennych (100 generacji AI na użytkownika)
- Śledzenie wykorzystania AI dla celów metrycznych i kontroli kosztów

**Powiązane endpointy:**
- `POST /api/flashcards/batch` - do zapisywania zaakceptowanych propozycji
- `GET /api/users/me/limits` - do sprawdzania dostępnych limitów

## 2. Szczegóły żądania

**Metoda HTTP:** `POST`

**Struktura URL:** `/api/flashcards/generate`

**Headers:**
- `Authorization: Bearer {access_token}` (wymagany)
- `Content-Type: application/json` (wymagany)

**Parametry URL:** Brak

**Request Body:**
```typescript
{
  deck_id: string;  // UUID talii, do której będą należeć fiszki
  text: string;     // Tekst źródłowy do generowania fiszek
}
```

**Walidacja Request Body:**
- `deck_id`:
  - Wymagany
  - Typ: string (UUID format)
  - Musi wskazywać na istniejącą talię
  - Użytkownik musi być właścicielem talii
  
- `text`:
  - Wymagany
  - Typ: string
  - Minimalna długość: 50 znaków
  - Maksymalna długość: 5000 znaków
  - Nie może być pustym stringiem po trim()

## 3. Wykorzystywane typy

**Request Types:**
```typescript
// z src/types.ts
GenerateFlashcardsCommand {
  deck_id: string;
  text: string;
}
```

**Response Types:**
```typescript
// z src/types.ts
GenerateFlashcardsResponse {
  proposals: FlashcardProposal[];
  usage: UsageInfo;
}

FlashcardProposal {
  front_content: string;
  back_content: string;
}

UsageInfo {
  generated_count: number;
  total_generated_today: number;
  daily_limit: number;
}
```

**Error Types:**
```typescript
// z src/types.ts
ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: ErrorDetails;
  }
}
```

**Database Types:**
```typescript
// z src/db/database.types.ts
Tables<'decks'> - dla weryfikacji istnienia talii
```

## 4. Szczegóły odpowiedzi

**Success Response (200 OK):**
```json
{
  "proposals": [
    {
      "front_content": "What are mitochondria?",
      "back_content": "Membrane-bound organelles found in eukaryotic cells that produce ATP"
    },
    {
      "front_content": "What is ATP?",
      "back_content": "Adenosine triphosphate - the main energy currency of the cell"
    }
  ],
  "usage": {
    "generated_count": 2,
    "total_generated_today": 45,
    "daily_limit": 100
  }
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "field": "text",
      "reason": "Text must be between 50 and 5000 characters"
    }
  }
}
```

**401 Unauthorized:**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**404 Not Found:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Deck not found or access denied"
  }
}
```

**422 Unprocessable Entity:**
```json
{
  "error": {
    "code": "AI_GENERATION_FAILED",
    "message": "Could not generate flashcards from the provided text",
    "details": {
      "reason": "Text may be too short, unclear, or not suitable for flashcard generation"
    }
  }
}
```

**429 Too Many Requests:**
```json
{
  "error": {
    "code": "LIMIT_EXCEEDED",
    "message": "Daily AI generation limit exceeded",
    "details": {
      "daily_limit": 100,
      "used_today": 100,
      "resets_at": "2025-10-20T00:00:00Z"
    }
  }
}
```

**500 Internal Server Error:**
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

## 5. Przepływ danych

### Diagram przepływu:
```
1. Request → Middleware (Auth) → Astro Endpoint Handler
2. Walidacja Zod (deck_id, text)
3. Deck Service: Weryfikacja istnienia i własności talii
4. Usage Service: Sprawdzenie limitów dziennych
5. AI Service: Generowanie propozycji fiszek (OpenAI/OpenRouter API)
6. Usage Service: Inkrementacja licznika dziennego
7. Response z proposals + usage info
```

### Szczegółowy przepływ:

**Krok 1: Uwierzytelnienie**
- Middleware Astro weryfikuje token JWT
- Pobiera `user_id` z `context.locals.supabase.auth.getUser()`
- Ustawia `userId` w `context.locals`

**Krok 2: Walidacja danych wejściowych**
- Parsowanie body requestu
- Walidacja schematem Zod
- Sprawdzenie formatu UUID dla `deck_id`
- Walidacja długości `text` (50-5000 znaków)

**Krok 3: Weryfikacja talii**
- Wywołanie `DeckService.getDeckById(deck_id, user_id)`
- Wykorzystanie RLS do weryfikacji własności
- Zwrócenie 404 jeśli talia nie istnieje lub nie należy do użytkownika

**Krok 4: Sprawdzenie limitów**
- Wywołanie `UsageService.checkDailyLimit(user_id)`
- Zapytanie do Supabase: COUNT fiszek z `ai_generated=true` utworzonych dzisiaj przez użytkownika
- Jeśli count >= 100, zwróć 429 z informacją o limicie

**Krok 5: Generowanie AI**
- Wywołanie `AIService.generateFlashcards(text)`
- Request do OpenAI/OpenRouter API z promptem
- Parsowanie odpowiedzi JSON do tablicy `FlashcardProposal[]`
- Obsługa błędów API (timeouts, rate limits, invalid responses)

**Krok 6: Aktualizacja statystyk**
- `UsageService.incrementDailyUsage(user_id, generated_count)`
- Może być cached w pamięci lub zapisany w osobnej tabeli statystyk

**Krok 7: Zwrot odpowiedzi**
- Konstrukcja `GenerateFlashcardsResponse`
- Zwrot 200 z proposals i usage info

### Interakcje z zewnętrznymi serwisami:

**Supabase:**
- Weryfikacja JWT token
- Sprawdzenie istnienia i własności talii (via RLS)
- Liczenie dziennych generacji AI

**OpenAI/OpenRouter API:**
- POST request z tekstem źródłowym
- Otrzymanie JSON z propozycjami fiszek
- Obsługa limitów API i błędów

## 6. Względy bezpieczeństwa

### Uwierzytelnienie
- **Mechanizm**: JWT Bearer token z Supabase Auth
- **Implementacja**: Middleware Astro (`src/middleware/index.ts`)
- **Walidacja**: `supabase.auth.getUser()` dla każdego requestu
- **Błąd**: 401 Unauthorized przy braku lub nieprawidłowym tokenie

### Autoryzacja
- **Zasada**: Użytkownik może generować fiszki tylko dla swoich talii
- **Implementacja**: RLS policies na tabeli `decks`
- **Weryfikacja**: Query do Supabase z user_id automatycznie filtruje wyniki
- **Błąd**: 404 Not Found jeśli talia nie istnieje lub nie należy do użytkownika (nie ujawniamy, czy talia istnieje)

### Walidacja danych wejściowych
- **Schemat Zod**:
```typescript
const generateFlashcardsSchema = z.object({
  deck_id: z.string().uuid("Invalid deck ID format"),
  text: z.string()
    .trim()
    .min(50, "Text must be at least 50 characters long")
    .max(5000, "Text must not exceed 5000 characters")
});
```

### Rate Limiting
- **Limit dzienny**: 100 generacji AI na użytkownika
- **Resetowanie**: O północy UTC
- **Tracking**: COUNT query w Supabase dla fiszek z `ai_generated=true`
- **Odpowiedź**: 429 Too Many Requests przy przekroczeniu

### Kontrola kosztów
- **Maksymalna długość tekstu**: 5000 znaków (zapobiega nadmiernym kosztom API)
- **Limit dzienny**: Ogranicza całkowite koszty AI na użytkownika
- **Monitoring**: Śledzenie `generated_count` w każdej odpowiedzi

### Sanityzacja
- **Input**: Trim whitespace, walidacja długości
- **Output**: AI response parsowany i walidowany przed zwróceniem
- **XSS Prevention**: React automatycznie escapuje output (dla przyszłego UI)

### Ochrona przed nadużyciami
- **Text length limits**: Zapobiega spamowi długimi tekstami
- **Daily limits**: Zapobiega nadmiernemu wykorzystaniu AI
- **Deck ownership**: Zapobiega generowaniu fiszek dla cudzych talii

## 7. Obsługa błędów

### Tabela błędów

| Scenariusz | HTTP Code | Error Code | Message | Details |
|------------|-----------|------------|---------|---------|
| Brak tokenu auth | 401 | UNAUTHORIZED | Authentication required | - |
| Nieprawidłowy token | 401 | UNAUTHORIZED | Invalid or expired token | - |
| Nieprawidłowy format UUID | 400 | VALIDATION_ERROR | Invalid request data | field, reason |
| Tekst za krótki (< 50) | 400 | VALIDATION_ERROR | Invalid request data | field: "text", reason: "..." |
| Tekst za długi (> 5000) | 400 | VALIDATION_ERROR | Invalid request data | field: "text", reason: "..." |
| Talia nie istnieje | 404 | NOT_FOUND | Deck not found or access denied | - |
| Brak dostępu do talii | 404 | NOT_FOUND | Deck not found or access denied | - |
| Limit dzienny przekroczony | 429 | LIMIT_EXCEEDED | Daily AI generation limit exceeded | daily_limit, used_today, resets_at |
| AI API timeout | 422 | AI_GENERATION_FAILED | Could not generate flashcards | reason: "Service timeout" |
| AI API error | 422 | AI_GENERATION_FAILED | Could not generate flashcards | reason: "..." |
| AI zwróciło pustą odpowiedź | 422 | AI_GENERATION_FAILED | Could not generate flashcards | reason: "No flashcards generated" |
| Błąd połączenia z Supabase | 500 | INTERNAL_ERROR | An unexpected error occurred | - |
| Nieoczekiwany błąd | 500 | INTERNAL_ERROR | An unexpected error occurred | - |

### Strategia obsługi błędów

**1. Try-Catch na poziomie endpointu:**
```typescript
try {
  // Walidacja, business logic
} catch (error) {
  // Mapowanie błędów na odpowiednie response
}
```

**2. Custom Error Classes:**
```typescript
class ValidationError extends Error { code = 'VALIDATION_ERROR'; statusCode = 400 }
class UnauthorizedError extends Error { code = 'UNAUTHORIZED'; statusCode = 401 }
class NotFoundError extends Error { code = 'NOT_FOUND'; statusCode = 404 }
class LimitExceededError extends Error { code = 'LIMIT_EXCEEDED'; statusCode = 429 }
class AIGenerationError extends Error { code = 'AI_GENERATION_FAILED'; statusCode = 422 }
```

**3. Error Response Helper:**
```typescript
function createErrorResponse(error: Error): Response {
  // Mapowanie Error na ErrorResponse format
  // Zwrot Response z odpowiednim status code
}
```

**4. Logging:**
- Console.error dla 500 errors
- Opcjonalnie: Sentry/LogRocket dla production monitoring
- NIE logować wrażliwych danych (tokens, user data)

**5. User-friendly messages:**
- 4xx errors: Jasne komunikaty co użytkownik może poprawić
- 5xx errors: Ogólne komunikaty, szczegóły tylko w logach

## 8. Rozważania dotyczące wydajności

### Potencjalne wąskie gardła

**1. AI API Latency (największe wąskie gardło)**
- **Problem**: Generowanie fiszek przez OpenAI może trwać 2-10 sekund
- **Mitigacja**: 
  - Pokazanie loading state w UI
  - Timeout po 30 sekundach
  - Rozważenie async/webhook pattern dla future optimization

**2. Supabase Query dla limitów**
- **Problem**: COUNT query dla każdego requestu
- **Mitigacja**:
  - Cache w Redis/memory (ważność 1 godzina)
  - Periodyczne odświeżanie cache
  - Indexed query (created_at + user_id + ai_generated)

**3. Deck ownership verification**
- **Problem**: Dodatkowy query przed generowaniem
- **Mitigacja**:
  - RLS automatycznie filtruje, więc query jest szybki
  - Index na user_id w tabeli decks

### Strategie optymalizacji

**Caching:**
```typescript
// Cache dla daily usage count
const cacheKey = `usage:${userId}:${currentDate}`;
const cachedCount = await cache.get(cacheKey);
if (cachedCount) return cachedCount;

// Query database
const count = await queryDatabase();
await cache.set(cacheKey, count, { ttl: 3600 }); // 1h TTL
```

**Database Indexes:**
```sql
-- Już istniejące (z db-plan.md)
CREATE INDEX idx_flashcards_user_id ON public.flashcards(user_id);

-- Dodatkowe dla performance
CREATE INDEX idx_flashcards_user_ai_created 
ON public.flashcards(user_id, ai_generated, created_at)
WHERE ai_generated = true;
```

**API Timeouts:**
```typescript
const AI_REQUEST_TIMEOUT = 30000; // 30 seconds
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT);

const response = await fetch(AI_API_URL, {
  signal: controller.signal,
  // ...
});
```

**Connection Pooling:**
- Supabase client automatycznie zarządza poolingiem
- Reuse klienta zamiast tworzenia nowego dla każdego requestu

### Monitoring

**Metryki do śledzenia:**
- Czas odpowiedzi AI API (p50, p95, p99)
- Liczba requestów 429 (limit exceeded)
- Liczba błędów 422 (AI generation failed)
- Liczba requestów na użytkownika
- Success rate propozycji AI

**Alerting:**
- Alert gdy AI API latency > 15s (p95)
- Alert gdy error rate > 5%
- Alert gdy daily limit hit rate > 20% użytkowników

## 9. Etapy wdrożenia

### Krok 1: Przygotowanie struktury plików
```
src/
  pages/
    api/
      flashcards/
        generate.ts          (NEW)
  lib/
    services/
      ai.service.ts          (NEW)
      usage.service.ts       (NEW)
      deck.service.ts        (NEW)
    validation/
      flashcard.schemas.ts   (NEW)
    errors/
      api-errors.ts          (NEW)
```

### Krok 2: Utworzenie custom error classes
**Plik:** `src/lib/errors/api-errors.ts`

```typescript
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = 'Authentication required') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class NotFoundError extends APIError {
  constructor(message: string) {
    super(404, 'NOT_FOUND', message);
  }
}

export class LimitExceededError extends APIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(429, 'LIMIT_EXCEEDED', message, details);
  }
}

export class AIGenerationError extends APIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(422, 'AI_GENERATION_FAILED', message, details);
  }
}
```

### Krok 3: Utworzenie Zod schemas
**Plik:** `src/lib/validation/flashcard.schemas.ts`

```typescript
import { z } from 'zod';

export const generateFlashcardsSchema = z.object({
  deck_id: z.string().uuid('Invalid deck ID format'),
  text: z
    .string()
    .trim()
    .min(50, 'Text must be at least 50 characters long')
    .max(5000, 'Text must not exceed 5000 characters'),
});

export type GenerateFlashcardsInput = z.infer<typeof generateFlashcardsSchema>;
```

### Krok 4: Implementacja Deck Service
**Plik:** `src/lib/services/deck.service.ts`

```typescript
import type { SupabaseClient } from '../db/supabase.client';
import { NotFoundError } from '../errors/api-errors';

export class DeckService {
  constructor(private supabase: SupabaseClient) {}

  async verifyDeckOwnership(deckId: string, userId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('decks')
      .select('id')
      .eq('id', deckId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundError('Deck not found or access denied');
    }
  }
}
```

### Krok 5: Implementacja Usage Service
**Plik:** `src/lib/services/usage.service.ts`

```typescript
import type { SupabaseClient } from '../db/supabase.client';
import { LimitExceededError } from '../errors/api-errors';
import type { UsageInfo } from '../../types';

const DAILY_LIMIT = 100;

export class UsageService {
  constructor(private supabase: SupabaseClient) {}

  async checkAndGetUsage(userId: string): Promise<{ canGenerate: boolean; usageInfo: Omit<UsageInfo, 'generated_count'> }> {
    const today = new Date().toISOString().split('T')[0];
    const startOfDay = `${today}T00:00:00Z`;
    const endOfDay = `${today}T23:59:59Z`;

    const { count, error } = await this.supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('ai_generated', true)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);

    if (error) {
      throw new Error('Failed to check usage limits');
    }

    const totalGeneratedToday = count || 0;
    const canGenerate = totalGeneratedToday < DAILY_LIMIT;

    return {
      canGenerate,
      usageInfo: {
        total_generated_today: totalGeneratedToday,
        daily_limit: DAILY_LIMIT,
      },
    };
  }

  getNextResetTime(): string {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow.toISOString();
  }
}
```

### Krok 6: Implementacja AI Service
**Plik:** `src/lib/services/ai.service.ts`

```typescript
import { AIGenerationError } from '../errors/api-errors';
import type { FlashcardProposal } from '../../types';

const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const AI_REQUEST_TIMEOUT = 30000; // 30 seconds

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AIService {
  private async callOpenAI(messages: OpenAIMessage[]): Promise<string> {
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
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new AIGenerationError('AI generation timed out', {
          reason: 'Service timeout',
        });
      }
      
      throw new AIGenerationError('Failed to generate flashcards', {
        reason: error.message,
      });
    }
  }

  async generateFlashcards(text: string): Promise<FlashcardProposal[]> {
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
- Keep answers concise but complete
- Focus on key concepts and facts
- Ensure flashcards are educational and testable`;

    const userPrompt = `Create flashcards from the following text:\n\n${text}`;

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const responseText = await this.callOpenAI(messages);

    try {
      const parsed = JSON.parse(responseText);
      const flashcards = parsed.flashcards;

      if (!Array.isArray(flashcards) || flashcards.length === 0) {
        throw new AIGenerationError('Could not generate flashcards from the provided text', {
          reason: 'No flashcards generated',
        });
      }

      // Validate structure
      const proposals: FlashcardProposal[] = flashcards.map((card: any) => {
        if (!card.front_content || !card.back_content) {
          throw new AIGenerationError('Invalid flashcard format from AI', {
            reason: 'Missing required fields',
          });
        }
        return {
          front_content: card.front_content.trim(),
          back_content: card.back_content.trim(),
        };
      });

      return proposals;
    } catch (error) {
      if (error instanceof AIGenerationError) {
        throw error;
      }
      throw new AIGenerationError('Failed to parse AI response', {
        reason: 'Invalid JSON format',
      });
    }
  }
}
```

### Krok 7: Utworzenie API endpoint handler
**Plik:** `src/pages/api/flashcards/generate.ts`

```typescript
import type { APIRoute } from 'astro';
import { generateFlashcardsSchema } from '../../../lib/validation/flashcard.schemas';
import { DeckService } from '../../../lib/services/deck.service';
import { UsageService } from '../../../lib/services/usage.service';
import { AIService } from '../../../lib/services/ai.service';
import { APIError, UnauthorizedError, ValidationError, LimitExceededError } from '../../../lib/errors/api-errors';
import type { GenerateFlashcardsResponse, ErrorResponse } from '../../../types';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // 1. Authentication check
    const supabase = locals.supabase;
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new UnauthorizedError();
    }

    const userId = user.id;

    // 2. Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError('Invalid JSON in request body');
    }

    const validationResult = generateFlashcardsSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      throw new ValidationError('Invalid request data', {
        field: firstError.path.join('.'),
        reason: firstError.message,
      });
    }

    const { deck_id, text } = validationResult.data;

    // 3. Verify deck ownership
    const deckService = new DeckService(supabase);
    await deckService.verifyDeckOwnership(deck_id, userId);

    // 4. Check daily usage limits
    const usageService = new UsageService(supabase);
    const { canGenerate, usageInfo } = await usageService.checkAndGetUsage(userId);

    if (!canGenerate) {
      throw new LimitExceededError('Daily AI generation limit exceeded', {
        daily_limit: usageInfo.daily_limit,
        used_today: usageInfo.total_generated_today,
        resets_at: usageService.getNextResetTime(),
      });
    }

    // 5. Generate flashcards using AI
    const aiService = new AIService();
    const proposals = await aiService.generateFlashcards(text);

    // 6. Prepare response
    const response: GenerateFlashcardsResponse = {
      proposals,
      usage: {
        generated_count: proposals.length,
        total_generated_today: usageInfo.total_generated_today,
        daily_limit: usageInfo.daily_limit,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    // Error handling
    if (error instanceof APIError) {
      const errorResponse: ErrorResponse = {
        error: {
          code: error.code as any,
          message: error.message,
          details: error.details,
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: error.statusCode,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Unexpected errors
    console.error('Unexpected error in generate endpoint:', error);
    
    const errorResponse: ErrorResponse = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
```

### Krok 8: Dodanie zmiennych środowiskowych
**Plik:** `src/env.d.ts`

Dodaj do interfejsu:
```typescript
interface ImportMetaEnv {
  readonly OPENAI_API_KEY: string;
  // ... existing vars
}
```

**Plik:** `.env` (local development)
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Krok 9: Utworzenie indeksu dla wydajności
**Plik:** `supabase/migrations/YYYYMMDDHHMMSS_add_flashcards_usage_index.sql`

```sql
-- Index dla optymalizacji query sprawdzającego daily usage
CREATE INDEX IF NOT EXISTS idx_flashcards_user_ai_created 
ON public.flashcards(user_id, ai_generated, created_at)
WHERE ai_generated = true;
```

### Krok 10: Testy manualne

**Test 1: Pomyślne generowanie**
```bash
curl -X POST http://localhost:4321/api/flashcards/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deck_id": "valid-deck-uuid",
    "text": "Mitochondria are membrane-bound organelles found in the cytoplasm of all eukaryotic cells. They are responsible for producing adenosine triphosphate (ATP), the main energy currency of the cell."
  }'
```

**Test 2: Walidacja - tekst za krótki**
```bash
curl -X POST http://localhost:4321/api/flashcards/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deck_id": "valid-deck-uuid",
    "text": "Short text"
  }'
# Expected: 400 VALIDATION_ERROR
```

**Test 3: Unauthorized**
```bash
curl -X POST http://localhost:4321/api/flashcards/generate \
  -H "Content-Type: application/json" \
  -d '{
    "deck_id": "valid-deck-uuid",
    "text": "Long enough text for validation..."
  }'
# Expected: 401 UNAUTHORIZED
```

**Test 4: Deck not found**
```bash
curl -X POST http://localhost:4321/api/flashcards/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deck_id": "00000000-0000-0000-0000-000000000000",
    "text": "Long enough text for validation..."
  }'
# Expected: 404 NOT_FOUND
```

**Test 5: Daily limit exceeded**
```bash
# Run this 101 times
for i in {1..101}; do
  curl -X POST http://localhost:4321/api/flashcards/generate \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "deck_id": "valid-deck-uuid",
      "text": "Different text each time to avoid caching..."
    }'
done
# Expected: 101st request returns 429 LIMIT_EXCEEDED
```

### Krok 11: Dokumentacja API
Zaktualizuj `.ai/api-plan.md` z:
- Przykładami requestów/responses
- Notami o limitach
- Przykładami error responses

### Krok 12: Monitoring i logging
Dodaj monitoring dla:
- AI API response times
- Error rates
- Daily limit hit rates
- Cost tracking

**Opcjonalnie - future enhancement:**
```typescript
// src/lib/services/monitoring.service.ts
export class MonitoringService {
  trackAIRequest(duration: number, success: boolean) {
    // Log to monitoring service
  }
  
  trackLimitExceeded(userId: string) {
    // Track users hitting limits
  }
}
```

## 10. Checklist przed produkcją

- [ ] Wszystkie zmienne środowiskowe ustawione w production
- [ ] OpenAI API key zabezpieczony i rotowany regularnie
- [ ] Indeksy bazy danych utworzone i przetestowane
- [ ] Error handling przetestowany dla wszystkich scenariuszy
- [ ] Rate limiting działa poprawnie
- [ ] Monitoring i alerting skonfigurowane
- [ ] Dokumentacja API zaktualizowana
- [ ] Testy manualne przeprowadzone
- [ ] Security review przeprowadzony
- [ ] Cost estimates dla AI API obliczone
- [ ] Backup strategy dla failure scenarios

## 11. Przyszłe ulepszenia

1. **Async Processing**: Przenieść generowanie AI na background job dla lepszego UX
2. **Caching**: Redis cache dla daily usage counts
3. **Batch Processing**: Wsparcie dla wielu tekstów w jednym requeście
4. **Quality Metrics**: Tracking acceptance rate propozycji AI
5. **Model Selection**: Możliwość wyboru modelu AI przez użytkownika
6. **Prompt Engineering**: A/B testing różnych promptów dla lepszej jakości
7. **Webhooks**: Notyfikacje gdy generowanie się zakończy (dla async)
8. **Advanced Limits**: Różne limity dla różnych tier użytkowników

