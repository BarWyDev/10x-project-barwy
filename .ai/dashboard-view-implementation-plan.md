# Plan Implementacji Widoku Dashboard i Widoku Weryfikacji AI

## 1. Przegląd

Widok Dashboard stanowi centrum operacyjne aplikacji 10XCards, umożliwiając użytkownikom:
- Generowanie fiszek za pomocą AI na podstawie wklejonych notatek
- Monitorowanie wykorzystania dziennego limitu AI (100 generacji)
- Przeglądanie, edycję i usuwanie swoich fiszek
- Ręczne tworzenie pojedynczych fiszek
- Rozpoczęcie sesji nauki

Widok Weryfikacji AI umożliwia przegląd, edycję i selekcję wygenerowanych przez AI propozycji fiszek przed ich ostatecznym zapisem w bazie danych.

## 2. Routing Widoku

### Dashboard
- **Ścieżka:** `/` (tylko dla zalogowanych użytkowników)
- **Typ:** Astro page z React components
- **Plik:** `src/pages/index.astro`

### Widok Weryfikacji AI
- **Ścieżka:** `/generate/verify`
- **Typ:** Astro page z React components
- **Plik:** `src/pages/generate/verify.astro`
- **Przekazywanie danych:** Propozycje przekazywane przez navigation state lub sessionStorage

## 3. Struktura Komponentów

```
DashboardPage (src/pages/index.astro)
├── Layout
├── Header (Astro)
│   ├── Logo
│   ├── UserInfo
│   └── LogoutButton
└── DashboardContent (src/components/DashboardContent.tsx - React)
    ├── FlashcardGeneratorSection
    │   ├── FlashcardGenerator (src/components/FlashcardGenerator.tsx)
    │   │   ├── Textarea (Shadcn/ui)
    │   │   ├── CharacterCounter
    │   │   ├── UsageLimitIndicator (src/components/UsageLimitIndicator.tsx)
    │   │   └── Button "Generuj" (Shadcn/ui)
    ├── FlashcardListSection
    │   ├── FlashcardList (src/components/FlashcardList.tsx)
    │   │   ├── Table (Shadcn/ui)
    │   │   ├── FlashcardRow (wiele)
    │   │   │   ├── FlashcardContent
    │   │   │   ├── EditButton
    │   │   │   └── DeleteButton
    │   │   └── Pagination
    │   ├── Button "Rozpocznij naukę"
    │   └── Button "Dodaj nową fiszkę"
    └── ManualFlashcardModal (src/components/ManualFlashcardModal.tsx)
        └── Form
            ├── Input (front_content)
            ├── Textarea (back_content)
            ├── Button "Zapisz"
            └── Button "Anuluj"

VerificationPage (src/pages/generate/verify.astro)
└── VerificationView (src/components/VerificationView.tsx - React)
    ├── Header
    │   ├── Title "Weryfikacja wygenerowanych fiszek"
    │   └── ProposalCounter
    ├── EditableProposalList
    │   └── EditableFlashcardProposal (src/components/EditableFlashcardProposal.tsx - wiele)
    │       ├── Input (front_content)
    │       ├── Textarea (back_content)
    │       ├── ValidationErrors
    │       └── Button "Usuń"
    └── ActionButtons
        ├── Button "Zapisz wszystkie"
        └── Button "Anuluj"
```

## 4. Szczegóły Komponentów

### 4.1. DashboardContent (React Component)

**Opis:**
Główny kontener React dla dashboardu, orkiestrujący wszystkie podkomponenty i zarządzający stanem na wysokim poziomie.

**Główne elementy:**
- Sekcja generowania fiszek (FlashcardGenerator)
- Sekcja listy fiszek (FlashcardList)
- Modal ręcznego tworzenia (ManualFlashcardModal)
- Toast notifications (z Shadcn/ui)

**Obsługiwane interakcje:**
- Montowanie komponentu → pobranie listy fiszek użytkownika
- Sukces generowania → nawigacja do widoku weryfikacji
- Sukces zapisu fiszki → odświeżenie listy
- Usunięcie fiszki → optimistic update + wywołanie API

**Obsługiwana walidacja:**
Brak (delegowana do komponentów dzieci)

**Typy:**
- `FlashcardDTO[]` - lista fiszek użytkownika
- `PaginatedFlashcardsResponse` - odpowiedź API z paginacją
- `UsageInfo` - informacje o limicie AI

**Propsy:**
```typescript
interface DashboardContentProps {
  userId: string;
  initialDeckId: string; // domyślny deck dla użytkownika
}
```

---

### 4.2. FlashcardGenerator (React Component)

**Opis:**
Komponent formularza do generowania fiszek przez AI. Zawiera pole tekstowe (textarea), licznik znaków, wskaźnik wykorzystania limitu oraz przycisk generowania.

**Główne elementy:**
- `Textarea` (Shadcn/ui) - pole do wklejenia notatek
- `CharacterCounter` - licznik znaków (np. "245 / 5000")
- `UsageLimitIndicator` - wizualny progress bar limitu dziennego
- `Button` (Shadcn/ui) - przycisk "Generuj" z loading state

**Obsługiwane interakcje:**
- Zmiana tekstu → walidacja długości, update licznika
- Kliknięcie "Generuj" → walidacja, wywołanie API, pokazanie loading state
- Sukces generowania → nawigacja do `/generate/verify` z propozycjami
- Błąd generowania → wyświetlenie komunikatu błędu, zachowanie tekstu

**Obsługiwana walidacja:**
- Tekst musi mieć minimum 50 znaków (walidacja na onChange i onSubmit)
- Tekst może mieć maksymalnie 5000 znaków (walidacja na onChange)
- Przycisk "Generuj" nieaktywny gdy:
  - Tekst jest niepoprawny (< 50 lub > 5000 znaków)
  - Trwa generowanie (isGenerating = true)
  - Osiągnięto dzienny limit (usageInfo.total_generated_today >= usageInfo.daily_limit)
- Komunikaty walidacji:
  - Poniżej 50 znaków: "Tekst musi zawierać minimum 50 znaków"
  - Powyżej 5000 znaków: "Tekst nie może przekraczać 5000 znaków"
  - Limit osiągnięty: "Osiągnięto dzienny limit generowania. Spróbuj ponownie jutro."

**Typy:**
- `GenerateFlashcardsCommand` - request body dla API
- `GenerateFlashcardsResponse` - response z propozycjami i usage info
- `ErrorResponse` - standardowy format błędu

**Propsy:**
```typescript
interface FlashcardGeneratorProps {
  deckId: string;
  initialUsageInfo?: UsageInfo;
  onGenerateSuccess: (proposals: FlashcardProposal[], usageInfo: UsageInfo) => void;
  onGenerateError: (error: ErrorResponse) => void;
}
```

---

### 4.3. UsageLimitIndicator (React Component)

**Opis:**
Wizualny wskaźnik pokazujący aktualne wykorzystanie dziennego limitu generowania fiszek przez AI. Wyświetlany jako progress bar z tekstowym opisem.

**Główne elementy:**
- `Progress` (Shadcn/ui) - pasek postępu
- `Text` - opis np. "45 / 100 wygenerowanych dzisiaj"
- Zmiana koloru w zależności od wykorzystania:
  - 0-70%: zielony
  - 71-90%: żółty
  - 91-100%: czerwony

**Obsługiwane interakcje:**
Brak (komponent read-only)

**Obsługiwana walidacja:**
Brak

**Typy:**
- `UsageInfo` - informacje o wykorzystaniu limitu

**Propsy:**
```typescript
interface UsageLimitIndicatorProps {
  usageInfo: UsageInfo;
  className?: string;
}
```

---

### 4.4. FlashcardList (React Component)

**Opis:**
Komponent tabeli wyświetlający listę fiszek użytkownika z opcjami edycji i usuwania. Obsługuje paginację i stany puste/ładowania.

**Główne elementy:**
- `Table` (Shadcn/ui) - tabela z nagłówkami:
  - "Awers" (front_content)
  - "Rewers" (back_content)
  - "Utworzono" (created_at)
  - "Metoda" (creation_method: AI/Ręcznie)
  - "Akcje" (przyciski)
- `FlashcardRow` - wiersz dla każdej fiszki
- `Pagination` (Shadcn/ui) - kontrolki paginacji
- `EmptyState` - komunikat gdy brak fiszek ("Nie masz jeszcze żadnych fiszek. Wygeneruj je lub dodaj ręcznie.")
- `LoadingState` - skeleton loader podczas ładowania

**Obsługiwane interakcje:**
- Kliknięcie "Edytuj" → otwarcie modalnego formularza edycji
- Kliknięcie "Usuń" → wyświetlenie dialogu potwierdzenia
- Potwierdzenie usunięcia → optimistic update (natychmiastowe usunięcie z UI) + wywołanie API
- Błąd usunięcia → rollback, wyświetlenie toast z błędem
- Zmiana strony paginacji → pobranie nowych danych

**Obsługiwana walidacja:**
Brak (walidacja w formularzach edycji)

**Typy:**
- `FlashcardDTO[]` - tablica fiszek do wyświetlenia
- `PaginationInfo` - informacje o paginacji

**Propsy:**
```typescript
interface FlashcardListProps {
  flashcards: FlashcardDTO[];
  pagination: PaginationInfo;
  isLoading: boolean;
  onEdit: (flashcard: FlashcardDTO) => void;
  onDelete: (flashcardId: string) => Promise<void>;
  onPageChange: (page: number) => void;
}
```

---

### 4.5. ManualFlashcardModal (React Component)

**Opis:**
Modal z formularzem do ręcznego tworzenia pojedynczej fiszki. Otwierany po kliknięciu przycisku "Dodaj nową fiszkę".

**Główne elementy:**
- `Dialog` (Shadcn/ui) - kontener modalny
- `Form` - formularz z walidacją
  - `Input` - pole "Awers" (front_content)
  - `Textarea` - pole "Rewers" (back_content)
  - `CharacterCounter` - dla obu pól
  - `Button` "Zapisz" - z loading state
  - `Button` "Anuluj"

**Obsługiwane interakcje:**
- Otwarcie modalu → reset formularza, focus na pierwszym polu
- Zmiana wartości pól → walidacja na onChange
- Kliknięcie "Zapisz" → walidacja, wywołanie API, zamknięcie modalu
- Kliknięcie "Anuluj" lub Escape → zamknięcie modalu (z potwierdzeniem jeśli są zmiany)
- Sukces zapisu → toast "Fiszka została dodana", odświeżenie listy
- Błąd zapisu → wyświetlenie błędów walidacji inline

**Obsługiwana walidacja:**
- `front_content`:
  - Wymagane (minimum 1 znak po trim)
  - Maksymalnie 1000 znaków
  - Komunikaty:
    - Puste: "Awers jest wymagany"
    - Za długie: "Awers nie może przekraczać 1000 znaków"
- `back_content`:
  - Wymagane (minimum 1 znak po trim)
  - Maksymalnie 2000 znaków
  - Komunikaty:
    - Puste: "Rewers jest wymagany"
    - Za długi: "Rewers nie może przekraczać 2000 znaków"
- Przycisk "Zapisz" nieaktywny gdy:
  - Formularz jest niepoprawny
  - Trwa zapisywanie (isSaving = true)

**Typy:**
- `CreateFlashcardCommand` - request body dla API
- `FlashcardDTO` - response po utworzeniu
- `ErrorResponse` - błędy API

**Propsy:**
```typescript
interface ManualFlashcardModalProps {
  deckId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (flashcard: FlashcardDTO) => void;
}
```

---

### 4.6. VerificationView (React Component)

**Opis:**
Główny komponent widoku weryfikacji propozycji wygenerowanych przez AI. Pozwala na edycję, usuwanie i ostateczny zapis wybranych fiszek.

**Główne elementy:**
- Header z tytułem i licznikiem propozycji
- Lista `EditableFlashcardProposal` (dla każdej propozycji)
- Przycisk "Zapisz wszystkie" (aktywny tylko gdy są poprawne propozycje)
- Przycisk "Anuluj" (powrót do dashboardu)

**Obsługiwane interakcje:**
- Montowanie komponentu → pobranie propozycji z navigation state/sessionStorage
- Edycja propozycji → update lokalnego stanu
- Usunięcie propozycji → usunięcie z lokalnego stanu
- Kliknięcie "Zapisz wszystkie" → walidacja wszystkich, wywołanie API batch, nawigacja do dashboardu
- Kliknięcie "Anuluj" → potwierdzenie (jeśli są zmiany), nawigacja do dashboardu
- Brak propozycji → automatyczny powrót do dashboardu z komunikatem

**Obsługiwana walidacja:**
- Przed zapisem sprawdzenie czy wszystkie propozycje są poprawne
- Jeśli którakolwiek jest niepoprawna → pokazanie błędów, zablokowanie zapisu
- Minimum 1 propozycja musi pozostać do zapisu

**Typy:**
- `EditableProposal` - propozycja z dodatkowymi polami do zarządzania stanem
- `BatchCreateFlashcardsCommand` - request dla API
- `BatchCreateFlashcardsResponse` - response z zapisanymi fiszkami

**Propsy:**
```typescript
interface VerificationViewProps {
  deckId: string;
  initialProposals: FlashcardProposal[];
  onSaveSuccess: (flashcards: FlashcardDTO[]) => void;
  onCancel: () => void;
}
```

---

### 4.7. EditableFlashcardProposal (React Component)

**Opis:**
Pojedyncza edytowalna propozycja fiszki w widoku weryfikacji. Pozwala na inline edycję zawartości awersu i rewersu oraz usunięcie propozycji.

**Główne elementy:**
- `Card` (Shadcn/ui) - kontener propozycji
- `Input` - pole "Awers" z walidacją
- `Textarea` - pole "Rewers" z walidacją
- `CharacterCounter` - dla obu pól
- `Button` - przycisk "Usuń" (ikona kosza)
- `ValidationErrors` - komunikaty błędów walidacji

**Obsługiwane interakcje:**
- Zmiana wartości → walidacja, callback do rodzica
- Kliknięcie "Usuń" → callback do rodzica (bez potwierdzenia)
- Blur na polu → walidacja i wyświetlenie błędów

**Obsługiwana walidacja:**
- `front_content`:
  - Wymagane (minimum 1 znak po trim)
  - Maksymalnie 1000 znaków
  - Walidacja na onChange i onBlur
- `back_content`:
  - Wymagane (minimum 1 znak po trim)
  - Maksymalnie 2000 znaków
  - Walidacja na onChange i onBlur
- Wizualna indykacja błędów (czerwona ramka, komunikat pod polem)

**Typy:**
- `EditableProposal` - propozycja z dodatkowymi polami
- `ValidationErrors` - obiekt z błędami walidacji

**Propsy:**
```typescript
interface EditableFlashcardProposalProps {
  proposal: EditableProposal;
  onChange: (id: string, field: 'front_content' | 'back_content', value: string) => void;
  onDelete: (id: string) => void;
}
```

---

## 5. Typy

### 5.1. Typy z `src/types.ts` (istniejące)

```typescript
// Request/Response dla generowania
interface GenerateFlashcardsCommand {
  deck_id: string;
  text: string;
}

interface GenerateFlashcardsResponse {
  proposals: FlashcardProposal[];
  usage: UsageInfo;
}

interface FlashcardProposal {
  front_content: string;
  back_content: string;
}

interface UsageInfo {
  generated_count: number;
  total_generated_today: number;
  daily_limit: number;
}

// Request/Response dla zapisu batch
interface BatchCreateFlashcardsCommand {
  deck_id: string;
  flashcards: FlashcardBatchItem[];
}

interface FlashcardBatchItem {
  front_content: string;
  back_content: string;
  ai_accepted: boolean; // true jeśli zaakceptowano bez edycji, false jeśli edytowano
}

interface BatchCreateFlashcardsResponse {
  created: FlashcardDTO[];
  count: number;
}

// Fiszka z bazy danych
interface FlashcardDTO {
  id: string;
  user_id: string;
  deck_id: string;
  front_content: string;
  back_content: string;
  status: FlashcardStatus;
  creation_method: 'ai' | 'manual';
  ai_accepted: boolean | null;
  created_at: string;
  updated_at: string;
}

// Lista fiszek z paginacją
interface PaginatedFlashcardsResponse {
  data: FlashcardDTO[];
  pagination: PaginationInfo;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// Błędy
interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: ErrorDetails;
  };
}

type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'LIMIT_EXCEEDED'
  | 'AI_GENERATION_FAILED'
  | 'INTERNAL_ERROR';
```

### 5.2. Nowe typy ViewModel (do utworzenia w komponentach)

```typescript
// src/components/VerificationView.tsx
interface EditableProposal {
  id: string; // temporary client-side ID (uuid v4)
  front_content: string;
  back_content: string;
  isEdited: boolean; // czy użytkownik edytował tę propozycję
  errors: {
    front_content?: string;
    back_content?: string;
  };
}

// src/components/FlashcardGenerator.tsx
interface GeneratorFormData {
  text: string;
}

interface GeneratorFormErrors {
  text?: string;
}

// src/components/ManualFlashcardModal.tsx
interface ManualFlashcardFormData {
  front_content: string;
  back_content: string;
}

interface ManualFlashcardFormErrors {
  front_content?: string;
  back_content?: string;
}

// src/lib/hooks/useDashboard.ts
interface DashboardState {
  flashcards: FlashcardDTO[];
  pagination: PaginationInfo;
  isLoading: boolean;
  error: ErrorResponse | null;
}

// src/lib/hooks/useFlashcardGenerator.ts
interface GeneratorState {
  text: string;
  isGenerating: boolean;
  error: ErrorResponse | null;
  usageInfo: UsageInfo | null;
}

// src/lib/hooks/useVerification.ts
interface VerificationState {
  proposals: EditableProposal[];
  isSaving: boolean;
  error: ErrorResponse | null;
}
```

## 6. Zarządzanie Stanem

### 6.1. Struktura zarządzania stanem

Aplikacja wykorzystuje kombinację:
- **React local state** (`useState`) dla prostych stanów komponentów
- **Custom hooks** dla złożonej logiki biznesowej i współdzielonych stanów
- **Astro navigation state** dla przekazywania danych między stronami
- **sessionStorage** jako fallback dla danych weryfikacji

### 6.2. Custom Hooks

#### `useDashboard` (src/lib/hooks/useDashboard.ts)

Zarządza stanem głównego dashboardu: lista fiszek, paginacja, operacje CRUD.

**Zwracany interfejs:**
```typescript
interface UseDashboardReturn {
  // State
  flashcards: FlashcardDTO[];
  pagination: PaginationInfo;
  isLoading: boolean;
  error: ErrorResponse | null;
  
  // Actions
  fetchFlashcards: (page?: number) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  refreshList: () => Promise<void>;
}
```

**Logika:**
- Przy montowaniu: automatyczne pobranie pierwszej strony fiszek
- `deleteFlashcard`: optimistic update (natychmiastowe usunięcie z UI) → wywołanie API → rollback w przypadku błędu
- Cache poprzedniego stanu do rollbacku

**Zależności:**
- API client do wywołań `/api/flashcards`
- Toast notifications dla komunikatów sukcesu/błędu

---

#### `useFlashcardGenerator` (src/lib/hooks/useFlashcardGenerator.ts)

Zarządza procesem generowania fiszek przez AI.

**Zwracany interfejs:**
```typescript
interface UseFlashcardGeneratorReturn {
  // State
  text: string;
  isGenerating: boolean;
  error: ErrorResponse | null;
  usageInfo: UsageInfo | null;
  
  // Actions
  setText: (text: string) => void;
  generateFlashcards: (deckId: string) => Promise<GenerateFlashcardsResponse | null>;
  resetError: () => void;
  
  // Validation
  isValid: boolean;
  validationErrors: GeneratorFormErrors;
}
```

**Logika:**
- Walidacja długości tekstu (50-5000 znaków) na każdej zmianie
- Wywołanie API `/api/flashcards/generate`
- Obsługa stanów ładowania i błędów
- Sprawdzenie limitu przed wywołaniem

---

#### `useVerification` (src/lib/hooks/useVerification.ts)

Zarządza stanem widoku weryfikacji propozycji AI.

**Zwracany interfejs:**
```typescript
interface UseVerificationReturn {
  // State
  proposals: EditableProposal[];
  isSaving: boolean;
  error: ErrorResponse | null;
  
  // Actions
  initializeProposals: (proposals: FlashcardProposal[]) => void;
  updateProposal: (id: string, field: 'front_content' | 'back_content', value: string) => void;
  deleteProposal: (id: string) => void;
  saveAllProposals: (deckId: string) => Promise<BatchCreateFlashcardsResponse | null>;
  
  // Validation
  isValid: boolean;
  hasProposals: boolean;
}
```

**Logika:**
- Konwersja `FlashcardProposal[]` → `EditableProposal[]` (dodanie ID, flag)
- Walidacja każdej propozycji przy edycji
- Przed zapisem: sprawdzenie czy wszystkie propozycje są poprawne
- Wywołanie API `/api/flashcards/batch` z flagą `ai_accepted`

---

#### `useManualFlashcard` (src/lib/hooks/useManualFlashcard.ts)

Zarządza stanem modalnego formularza ręcznego tworzenia fiszki.

**Zwracany interfejs:**
```typescript
interface UseManualFlashcardReturn {
  // State
  formData: ManualFlashcardFormData;
  isOpen: boolean;
  isSaving: boolean;
  errors: ManualFlashcardFormErrors;
  
  // Actions
  openModal: () => void;
  closeModal: () => void;
  updateField: (field: 'front_content' | 'back_content', value: string) => void;
  saveFlashcard: (deckId: string) => Promise<FlashcardDTO | null>;
  
  // Validation
  isValid: boolean;
}
```

**Logika:**
- Walidacja pól (front: 1-1000, back: 1-2000 znaków)
- Reset formularza przy zamykaniu modalu
- Wywołanie API `/api/flashcards` (endpoint dla pojedynczej fiszki)

---

### 6.3. Przepływ danych między Dashboard a Verification

**Opcja 1: Astro Navigation State (preferowana)**
```typescript
// Dashboard - przekazanie propozycji
navigate('/generate/verify', {
  state: {
    proposals: response.proposals,
    deckId: deckId,
    usageInfo: response.usage
  }
});

// Verification - odczyt propozycji
const { state } = Astro.location;
const proposals = state?.proposals || [];
```

**Opcja 2: SessionStorage (fallback)**
```typescript
// Dashboard - zapis
sessionStorage.setItem('verification_proposals', JSON.stringify({
  proposals: response.proposals,
  deckId: deckId,
  timestamp: Date.now()
}));

// Verification - odczyt
const data = sessionStorage.getItem('verification_proposals');
const { proposals } = JSON.parse(data);
```

**Decyzja:** Użyć Astro navigation state jako primary, sessionStorage jako fallback na wypadek refresh strony.

---

## 7. Integracja API

### 7.1. POST /api/flashcards/generate

**Endpoint:** `POST /api/flashcards/generate`

**Request:**
```typescript
// Type: GenerateFlashcardsCommand
{
  "deck_id": "550e8400-e29b-41d4-a716-446655440000",
  "text": "Mitochondria are organelles..."
}
```

**Success Response (200):**
```typescript
// Type: GenerateFlashcardsResponse
{
  "proposals": [
    {
      "front_content": "What are mitochondria?",
      "back_content": "Organelles that produce ATP"
    }
  ],
  "usage": {
    "generated_count": 1,
    "total_generated_today": 45,
    "daily_limit": 100
  }
}
```

**Error Responses:**
- `400 Bad Request`: Niepoprawna walidacja (tekst za krótki/długi)
  ```typescript
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Text must be at least 50 characters long",
      "details": {
        "field": "text",
        "reason": "Text must be at least 50 characters long"
      }
    }
  }
  ```

- `401 Unauthorized`: Brak lub niepoprawny token
- `404 Not Found`: Deck nie istnieje
- `422 Unprocessable Entity`: AI nie mogło wygenerować fiszek
  ```typescript
  {
    "error": {
      "code": "AI_GENERATION_FAILED",
      "message": "Could not generate flashcards from provided text"
    }
  }
  ```

- `429 Too Many Requests`: Przekroczono limit dzienny
  ```typescript
  {
    "error": {
      "code": "LIMIT_EXCEEDED",
      "message": "Daily generation limit exceeded",
      "details": {
        "used_today": 100,
        "daily_limit": 100
      }
    }
  }
  ```

**Wywołanie w kodzie:**
```typescript
// src/lib/api/flashcards.api.ts
export async function generateFlashcards(
  command: GenerateFlashcardsCommand
): Promise<GenerateFlashcardsResponse> {
  const response = await fetch('/api/flashcards/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json();
    throw new APIError(errorData);
  }

  return response.json();
}
```

---

### 7.2. POST /api/flashcards/batch

**Endpoint:** `POST /api/flashcards/batch` (do utworzenia)

**Request:**
```typescript
// Type: BatchCreateFlashcardsCommand
{
  "deck_id": "550e8400-e29b-41d4-a716-446655440000",
  "flashcards": [
    {
      "front_content": "What are mitochondria?",
      "back_content": "Organelles that produce ATP",
      "ai_accepted": true // nie edytowano
    },
    {
      "front_content": "What is ATP?",
      "back_content": "Adenosine triphosphate - energy currency",
      "ai_accepted": false // użytkownik edytował
    }
  ]
}
```

**Success Response (201):**
```typescript
// Type: BatchCreateFlashcardsResponse
{
  "created": [
    {
      "id": "...",
      "front_content": "What are mitochondria?",
      "back_content": "Organelles that produce ATP",
      "creation_method": "ai",
      "ai_accepted": true,
      // ... inne pola FlashcardDTO
    },
    // ...
  ],
  "count": 2
}
```

**Error Responses:**
- `400 Bad Request`: Walidacja nie przeszła
- `401 Unauthorized`: Brak autentykacji
- `404 Not Found`: Deck nie istnieje

---

### 7.3. POST /api/flashcards (manual creation)

**Endpoint:** `POST /api/flashcards` (do utworzenia)

**Request:**
```typescript
// Type: CreateFlashcardCommand
{
  "deck_id": "550e8400-e29b-41d4-a716-446655440000",
  "front_content": "What is photosynthesis?",
  "back_content": "Process by which plants convert light into energy"
}
```

**Success Response (201):**
```typescript
// Type: FlashcardDTO
{
  "id": "...",
  "front_content": "What is photosynthesis?",
  "back_content": "Process by which plants convert light into energy",
  "creation_method": "manual",
  "ai_accepted": null,
  // ... inne pola
}
```

---

### 7.4. GET /api/flashcards

**Endpoint:** `GET /api/flashcards?page=1&limit=20` (zakładany)

**Query Parameters:**
- `page`: numer strony (default: 1)
- `limit`: liczba elementów na stronę (default: 20)
- `deck_id`: opcjonalnie filtrowanie po deck

**Success Response (200):**
```typescript
// Type: PaginatedFlashcardsResponse
{
  "data": [
    // FlashcardDTO[]
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

---

### 7.5. DELETE /api/flashcards/:id

**Endpoint:** `DELETE /api/flashcards/{id}` (zakładany)

**Success Response (204):** No Content

**Error Responses:**
- `401 Unauthorized`
- `404 Not Found`: Fiszka nie istnieje lub nie należy do użytkownika

---

## 8. Interakcje Użytkownika

### 8.1. Generowanie fiszek przez AI

**Kroki:**
1. Użytkownik wkleja lub wpisuje notatki do textarea (minimum 50 znaków)
2. System waliduje długość na bieżąco, pokazuje licznik znaków
3. Gdy tekst jest poprawny i limit AI nie został przekroczony, przycisk "Generuj" staje się aktywny
4. Użytkownik klika "Generuj"
5. System:
   - Pokazuje loading spinner na przycisku
   - Wyłącza textarea i przycisk
   - Wywołuje `POST /api/flashcards/generate`
6. W przypadku sukcesu:
   - System aktualizuje `UsageInfo`
   - Nawiguje do `/generate/verify` z propozycjami w state
7. W przypadku błędu:
   - Pokazuje komunikat błędu nad formularzem
   - Pozostawia tekst w textarea
   - Przywraca interaktywność formularza

**Szczególne przypadki:**
- **Limit osiągnięty:** Przycisk nieaktywny, komunikat "Osiągnięto dzienny limit. Spróbuj ponownie jutro o 00:00."
- **Błąd 422 (AI failed):** "Nie udało się wygenerować fiszek z tego tekstu. Spróbuj z innym fragmentem."
- **Błąd sieci:** "Problem z połączeniem. Sprawdź internet i spróbuj ponownie."

---

### 8.2. Weryfikacja i edycja propozycji AI

**Kroki:**
1. Użytkownik jest na stronie `/generate/verify` z propozycjami
2. System wyświetla wszystkie propozycje jako edytowalne karty
3. Użytkownik może:
   - **Edytować** awers lub rewers dowolnej propozycji (inline, bez zapisywania)
   - **Usunąć** niepotrzebną propozycję (kliknięcie ikony kosza)
4. System na bieżąco waliduje każdą propozycję:
   - Czerwona ramka i komunikat błędu dla niepoprawnych pól
   - Oznaczenie propozycji jako "edytowana" (do flagi `ai_accepted`)
5. Użytkownik klika "Zapisz wszystkie":
   - System waliduje wszystkie propozycje
   - Jeśli wszystkie OK: wywołuje `POST /api/flashcards/batch`
   - Pokazuje loading na przycisku
6. W przypadku sukcesu:
   - Toast: "Zapisano X fiszek"
   - Nawigacja do `/` (dashboard)
   - Dashboard odświeża listę fiszek
7. W przypadku błędu:
   - Toast z komunikatem błędu
   - Pozostanie na stronie weryfikacji
   - Możliwość ponowienia

**Szczególne przypadki:**
- **Wszystkie propozycje usunięte:** Przycisk "Zapisz wszystkie" nieaktywny, komunikat "Musisz zostawić przynajmniej jedną fiszkę"
- **Propozycje niepoprawne:** Przycisk "Zapisz wszystkie" nieaktywny, komunikat "Popraw błędy przed zapisaniem"
- **Kliknięcie "Anuluj":** Jeśli są zmiany → dialog potwierdzenia, następnie nawigacja do `/`

---

### 8.3. Ręczne tworzenie fiszki

**Kroki:**
1. Użytkownik klika przycisk "Dodaj nową fiszkę" na dashboardzie
2. System otwiera modal z formularzem
3. Focus automatycznie ustawiony na polu "Awers"
4. Użytkownik wypełnia "Awers" i "Rewers"
5. System waliduje na bieżąco (onBlur), pokazuje liczniki znaków
6. Użytkownik klika "Zapisz":
   - System waliduje wszystkie pola
   - Jeśli błędy: pokazuje je inline, nie zamyka modala
   - Jeśli OK: wywołuje `POST /api/flashcards`
7. W przypadku sukcesu:
   - Toast: "Fiszka została dodana"
   - Zamknięcie modala
   - Odświeżenie listy fiszek (nowa fiszka widoczna)
8. W przypadku błędu:
   - Pozostawienie modala otwartego
   - Pokazanie błędów walidacji z API

**Szczególne przypadki:**
- **Kliknięcie "Anuluj" lub Escape:** Jeśli są zmiany → dialog potwierdzenia "Chcesz odrzucić zmiany?"
- **Kliknięcie poza modalem:** Analogicznie do "Anuluj"

---

### 8.4. Usuwanie fiszki

**Kroki:**
1. Użytkownik klika ikonę kosza przy fiszce w liście
2. System pokazuje dialog potwierdzenia: "Czy na pewno chcesz usunąć tę fiszkę?"
3. Użytkownik klika "Usuń":
   - **Optimistic update:** Fiszka natychmiast znika z listy
   - System wywołuje `DELETE /api/flashcards/:id`
4. W przypadku sukcesu:
   - Toast: "Fiszka została usunięta"
   - Fiszka pozostaje usunięta z listy
5. W przypadku błędu:
   - **Rollback:** Fiszka wraca na listę w to samo miejsce
   - Toast: "Nie udało się usunąć fiszki. Spróbuj ponownie."

---

### 8.5. Nawigacja między stronami

**Dashboard → Weryfikacja:**
- Po kliknięciu "Generuj" i sukcesie API
- Przekazanie propozycji przez navigation state

**Weryfikacja → Dashboard:**
- Po kliknięciu "Zapisz wszystkie" i sukcesie
- Po kliknięciu "Anuluj"
- Automatycznie jeśli brak propozycji

---

## 9. Warunki i Walidacja

### 9.1. Warunki przed wywołaniem API

#### POST /api/flashcards/generate
**Komponent:** `FlashcardGenerator`

**Warunki:**
1. Użytkownik musi być zalogowany (sprawdzane przez middleware Astro)
2. `deck_id` musi być poprawnym UUID (przekazane z props)
3. `text` musi mieć 50-5000 znaków (po trim)
4. Użytkownik nie może przekroczyć dziennego limitu (100 generacji)

**Weryfikacja na poziomie komponentu:**
```typescript
// Walidacja długości tekstu
const validateText = (text: string): string | null => {
  const trimmed = text.trim();
  if (trimmed.length < 50) {
    return 'Tekst musi zawierać minimum 50 znaków';
  }
  if (trimmed.length > 5000) {
    return 'Tekst nie może przekraczać 5000 znaków';
  }
  return null;
};

// Sprawdzenie limitu
const canGenerate = usageInfo 
  ? usageInfo.total_generated_today < usageInfo.daily_limit 
  : true;

// Wyłączenie przycisku
const isButtonDisabled = 
  !!validateText(text) || 
  isGenerating || 
  !canGenerate;
```

---

#### POST /api/flashcards/batch
**Komponent:** `VerificationView`

**Warunki:**
1. Użytkownik musi być zalogowany
2. `deck_id` musi być poprawnym UUID
3. Tablica `flashcards` musi mieć 1-100 elementów
4. Każda fiszka:
   - `front_content`: 1-1000 znaków (po trim)
   - `back_content`: 1-2000 znaków (po trim)
   - `ai_accepted`: boolean (true jeśli niemodyfikowana)

**Weryfikacja na poziomie komponentu:**
```typescript
// Walidacja pojedynczej propozycji
const validateProposal = (proposal: EditableProposal): boolean => {
  const frontTrimmed = proposal.front_content.trim();
  const backTrimmed = proposal.back_content.trim();
  
  return (
    frontTrimmed.length >= 1 && 
    frontTrimmed.length <= 1000 &&
    backTrimmed.length >= 1 && 
    backTrimmed.length <= 2000
  );
};

// Walidacja wszystkich propozycji
const allProposalsValid = proposals.every(validateProposal);
const hasProposals = proposals.length > 0 && proposals.length <= 100;

const canSave = allProposalsValid && hasProposals && !isSaving;
```

---

#### POST /api/flashcards (manual)
**Komponent:** `ManualFlashcardModal`

**Warunki:**
1. Użytkownik musi być zalogowany
2. `deck_id` musi być poprawnym UUID
3. `front_content`: 1-1000 znaków (po trim)
4. `back_content`: 1-2000 znaków (po trim)

**Weryfikacja na poziomie komponentu:**
```typescript
// Walidacja formularza
const validateForm = (data: ManualFlashcardFormData): ManualFlashcardFormErrors => {
  const errors: ManualFlashcardFormErrors = {};
  
  const frontTrimmed = data.front_content.trim();
  if (frontTrimmed.length === 0) {
    errors.front_content = 'Awers jest wymagany';
  } else if (frontTrimmed.length > 1000) {
    errors.front_content = 'Awers nie może przekraczać 1000 znaków';
  }
  
  const backTrimmed = data.back_content.trim();
  if (backTrimmed.length === 0) {
    errors.back_content = 'Rewers jest wymagany';
  } else if (backTrimmed.length > 2000) {
    errors.back_content = 'Rewers nie może przekraczać 2000 znaków';
  }
  
  return errors;
};

const isValid = Object.keys(validateForm(formData)).length === 0;
const canSubmit = isValid && !isSaving;
```

---

### 9.2. Wpływ warunków na UI

| Warunek | Komponent | Efekt na UI |
|---------|-----------|-------------|
| Tekst < 50 znaków | FlashcardGenerator | Przycisk "Generuj" disabled, komunikat błędu |
| Tekst > 5000 znaków | FlashcardGenerator | Przycisk "Generuj" disabled, komunikat błędu, blokada wpisywania |
| Limit AI osiągnięty | FlashcardGenerator | Przycisk "Generuj" disabled, komunikat o limicie |
| Trwa generowanie | FlashcardGenerator | Przycisk "Generuj" disabled + spinner, textarea disabled |
| Brak propozycji | VerificationView | Automatyczny powrót do dashboardu, komunikat |
| Propozycja niepoprawna | EditableFlashcardProposal | Czerwona ramka, komunikat błędu pod polem |
| Wszystkie propozycje niepoprawne | VerificationView | Przycisk "Zapisz wszystkie" disabled |
| Trwa zapisywanie | VerificationView | Przycisk "Zapisz wszystkie" disabled + spinner |
| Formularz niepoprawny | ManualFlashcardModal | Przycisk "Zapisz" disabled, błędy inline |
| Trwa zapisywanie | ManualFlashcardModal | Przycisk "Zapisz" disabled + spinner, pola disabled |

---

## 10. Obsługa Błędów

### 10.1. Typy błędów i ich obsługa

#### 10.1.1. Błędy walidacji (400 Bad Request)

**Przyczyna:** Niepoprawne dane wejściowe

**Gdzie może wystąpić:**
- POST /api/flashcards/generate (tekst za krótki/długi)
- POST /api/flashcards/batch (niepoprawne propozycje)
- POST /api/flashcards (niepoprawny formularz)

**Obsługa:**
```typescript
if (error.code === 'VALIDATION_ERROR') {
  // Wyświetl błąd inline w formularzu
  setFieldError(error.details.field, error.details.reason);
  // Pozostaw formularz otwarty, nie czyść danych
}
```

**UI:**
- Komunikat błędu pod niepoprawnym polem
- Czerwona ramka wokół pola
- Przycisk submit pozostaje aktywny (możliwość poprawy i retry)

---

#### 10.1.2. Błędy autentykacji (401 Unauthorized)

**Przyczyna:** Brak lub niepoprawny token JWT

**Gdzie może wystąpić:** Wszystkie endpointy API

**Obsługa:**
```typescript
if (error.code === 'UNAUTHORIZED') {
  // Pokaż toast
  toast.error('Sesja wygasła. Zaloguj się ponownie.');
  // Przekieruj do logowania po 2 sekundach
  setTimeout(() => {
    window.location.href = '/login';
  }, 2000);
}
```

**UI:**
- Toast z komunikatem
- Automatyczne przekierowanie do `/login`

---

#### 10.1.3. Błędy not found (404 Not Found)

**Przyczyna:** Deck nie istnieje lub nie należy do użytkownika

**Gdzie może wystąpić:**
- POST /api/flashcards/generate
- DELETE /api/flashcards/:id

**Obsługa:**
```typescript
if (error.code === 'NOT_FOUND') {
  toast.error('Nie znaleziono zasobu. Odśwież stronę.');
  // Opcjonalnie: odśwież listę/stronę po 2 sekundach
}
```

**UI:**
- Toast z komunikatem
- Dla usuwania: przywróć fiszkę na listę (rollback)

---

#### 10.1.4. Błędy generowania AI (422 Unprocessable Entity)

**Przyczyna:** AI nie mogło wygenerować fiszek z podanego tekstu

**Gdzie może wystąpić:** POST /api/flashcards/generate

**Obsługa:**
```typescript
if (error.code === 'AI_GENERATION_FAILED') {
  setError('Nie udało się wygenerować fiszek z tego tekstu. Spróbuj z innym fragmentem lub zmień sformułowanie.');
  // Pozostaw tekst w textarea
  // Przywróć możliwość retry
}
```

**UI:**
- Alert z komunikatem nad formularzem (Alert z Shadcn/ui, typ "destructive")
- Tekst pozostaje w textarea
- Przycisk "Generuj" aktywny (możliwość retry po edycji)
- Opcjonalnie: sugestie ("Spróbuj: dodać więcej kontekstu, użyć pełnych zdań, etc.")

---

#### 10.1.5. Błędy przekroczenia limitu (429 Too Many Requests)

**Przyczyna:** Użytkownik przekroczył dzienny limit 100 generacji

**Gdzie może wystąpić:** POST /api/flashcards/generate

**Obsługa:**
```typescript
if (error.code === 'LIMIT_EXCEEDED') {
  const resetTime = new Date();
  resetTime.setHours(24, 0, 0, 0); // Północ następnego dnia
  
  setError(`Osiągnięto dzienny limit generowania (${error.details.daily_limit}). Spróbuj ponownie jutro o 00:00.`);
  // Wyłącz przycisk generowania
}
```

**UI:**
- Alert z komunikatem i czasem resetu
- Przycisk "Generuj" disabled
- UsageLimitIndicator pokazuje 100/100 (czerwony)
- Opcjonalnie: timer odliczający czas do resetu

---

#### 10.1.6. Błędy sieciowe

**Przyczyna:** Brak połączenia z internetem, timeout

**Gdzie może wystąpić:** Wszystkie wywołania API

**Obsługa:**
```typescript
try {
  // API call
} catch (error) {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    toast.error('Problem z połączeniem. Sprawdź internet i spróbuj ponownie.');
    // Nie czyść formularza, pozwól na retry
  }
}
```

**UI:**
- Toast z komunikatem
- Formularz pozostaje wypełniony
- Możliwość natychmiastowego retry

---

#### 10.1.7. Błędy serwera (500 Internal Server Error)

**Przyczyna:** Nieoczekiwany błąd po stronie serwera

**Gdzie może wystąpić:** Wszystkie endpointy API

**Obsługa:**
```typescript
if (error.code === 'INTERNAL_ERROR') {
  toast.error('Wystąpił błąd serwera. Spróbuj ponownie za chwilę.');
  // Log do zewnętrznego systemu (np. Sentry) w przyszłości
}
```

**UI:**
- Toast z ogólnym komunikatem
- Formularz pozostaje wypełniony
- Możliwość retry

---

### 10.2. Strategia komunikatów błędów

**Zasady:**
1. **Jasność:** Komunikaty zrozumiałe dla użytkownika nietechnicznego
2. **Akcjonalność:** Komunikat mówi, co użytkownik może zrobić
3. **Kontekst:** Komunikat wyświetlany blisko miejsca problemu
4. **Nie-intruzywność:** Toast dla błędów globalnych, inline dla walidacji

**Przykłady dobrych komunikatów:**
- ✅ "Tekst musi zawierać minimum 50 znaków (obecnie: 23)"
- ✅ "Nie udało się wygenerować fiszek. Spróbuj z innym fragmentem tekstu."
- ✅ "Osiągnięto dzienny limit. Spróbuj ponownie jutro o 00:00."

**Przykłady złych komunikatów:**
- ❌ "Error: VALIDATION_ERROR"
- ❌ "Request failed with status code 422"
- ❌ "Something went wrong"

---

### 10.3. Mechanizm rollback (optimistic updates)

**Zastosowanie:** Usuwanie fiszek z listy

**Implementacja:**
```typescript
const deleteFlashcard = async (id: string) => {
  // 1. Zapisz kopię fiszki
  const flashcardToDelete = flashcards.find(f => f.id === id);
  if (!flashcardToDelete) return;
  
  // 2. Optimistic update - usuń z UI
  setFlashcards(prev => prev.filter(f => f.id !== id));
  
  try {
    // 3. Wywołaj API
    await apiClient.deleteFlashcard(id);
    
    // 4. Sukces - pokaż toast
    toast.success('Fiszka została usunięta');
    
  } catch (error) {
    // 5. Błąd - rollback
    setFlashcards(prev => {
      // Wstaw z powrotem w odpowiednie miejsce
      const index = prev.findIndex(f => f.created_at > flashcardToDelete.created_at);
      if (index === -1) return [...prev, flashcardToDelete];
      return [...prev.slice(0, index), flashcardToDelete, ...prev.slice(index)];
    });
    
    // 6. Pokaż błąd
    toast.error('Nie udało się usunąć fiszki. Spróbuj ponownie.');
  }
};
```

---

## 11. Kroki Implementacji

### Faza 1: Przygotowanie infrastruktury (1-2h)

#### Krok 1.1: Utworzenie struktury katalogów
```
src/
├── components/
│   ├── dashboard/
│   │   ├── DashboardContent.tsx
│   │   ├── FlashcardGenerator.tsx
│   │   ├── UsageLimitIndicator.tsx
│   │   ├── FlashcardList.tsx
│   │   └── ManualFlashcardModal.tsx
│   └── verification/
│       ├── VerificationView.tsx
│       └── EditableFlashcardProposal.tsx
├── lib/
│   ├── hooks/
│   │   ├── useDashboard.ts
│   │   ├── useFlashcardGenerator.ts
│   │   ├── useVerification.ts
│   │   └── useManualFlashcard.ts
│   ├── api/
│   │   └── flashcards.api.ts
│   └── utils/
│       ├── validation.ts
│       └── storage.ts
└── pages/
    ├── index.astro
    └── generate/
        └── verify.astro
```

#### Krok 1.2: Utworzenie API client
- Plik: `src/lib/api/flashcards.api.ts`
- Funkcje:
  - `generateFlashcards(command: GenerateFlashcardsCommand)`
  - `batchCreateFlashcards(command: BatchCreateFlashcardsCommand)`
  - `createFlashcard(command: CreateFlashcardCommand)`
  - `getFlashcards(params: ListFlashcardsParams)`
  - `deleteFlashcard(id: string)`
- Obsługa błędów (throw APIError)
- Automatyczne dodawanie auth headers

#### Krok 1.3: Utworzenie utility functions
- Plik: `src/lib/utils/validation.ts`
  - `validateTextLength(text: string, min: number, max: number)`
  - `validateFlashcardContent(front: string, back: string)`
- Plik: `src/lib/utils/storage.ts`
  - `saveVerificationData(data)`
  - `loadVerificationData()`
  - `clearVerificationData()`

---

### Faza 2: Komponenty podstawowe (3-4h)

#### Krok 2.1: UsageLimitIndicator
1. Utworzyć komponent React
2. Props: `usageInfo: UsageInfo`
3. Użyć komponentu `Progress` z Shadcn/ui
4. Logika koloru (zielony/żółty/czerwony)
5. Testy wizualne z różnymi wartościami

#### Krok 2.2: CharacterCounter (helper component)
1. Komponent pomocniczy do wielokrotnego użycia
2. Props: `current: number, max: number`
3. Style: zmiana koloru gdy blisko limitu
4. Użycie w textarea wszystkich formularzy

#### Krok 2.3: FlashcardList (podstawowa wersja)
1. Utworzyć komponent React
2. Props zgodne z interfejsem (sekcja 4.4)
3. Użyć `Table` z Shadcn/ui
4. Implementacja:
   - Renderowanie wierszy
   - Empty state (gdy brak fiszek)
   - Loading state (skeleton z Shadcn/ui)
   - Pagination (opcjonalnie na razie hardcoded)
5. Podpięcie callbacków (onDelete, onEdit - console.log na razie)

---

### Faza 3: Generator fiszek i hook (4-5h)

#### Krok 3.1: useFlashcardGenerator hook
1. Utworzyć plik `src/lib/hooks/useFlashcardGenerator.ts`
2. Implementacja state management:
   - `text`, `isGenerating`, `error`, `usageInfo`
3. Implementacja funkcji:
   - `setText` z walidacją
   - `generateFlashcards` z wywołaniem API
   - `resetError`
4. Walidacja zgodna z sekcją 9.1
5. Obsługa błędów zgodnie z sekcją 10

#### Krok 3.2: FlashcardGenerator component
1. Utworzyć komponent React
2. Użycie hooka `useFlashcardGenerator`
3. UI:
   - `Textarea` z Shadcn/ui
   - `CharacterCounter`
   - `UsageLimitIndicator`
   - `Button` "Generuj"
4. Implementacja walidacji i wyłączania przycisku
5. Komunikaty błędów (Alert z Shadcn/ui)
6. Po sukcesie: callback `onGenerateSuccess`

#### Krok 3.3: Integracja API
1. Implementacja `generateFlashcards` w API client
2. Testy wywołania z różnymi danymi
3. Obsługa wszystkich typów błędów (sekcja 10.1)

---

### Faza 4: Widok weryfikacji (4-5h)

#### Krok 4.1: EditableFlashcardProposal component
1. Utworzyć komponent React
2. Props zgodne z sekcją 4.7
3. UI:
   - `Card` z Shadcn/ui
   - `Input` dla front_content
   - `Textarea` dla back_content
   - `CharacterCounter` dla obu pól
   - `Button` (ikona) do usunięcia
4. Walidacja inline
5. Wyświetlanie błędów walidacji

#### Krok 4.2: useVerification hook
1. Utworzyć plik `src/lib/hooks/useVerification.ts`
2. Implementacja state:
   - `proposals: EditableProposal[]`
   - `isSaving`, `error`
3. Implementacja funkcji:
   - `initializeProposals` - konwersja FlashcardProposal[] → EditableProposal[]
   - `updateProposal` - aktualizacja lokalnego stanu
   - `deleteProposal` - usunięcie z lokalnego stanu
   - `saveAllProposals` - walidacja + wywołanie API batch
4. Flagi `ai_accepted` (true jeśli isEdited=false)

#### Krok 4.3: VerificationView component
1. Utworzyć komponent React
2. Użycie hooka `useVerification`
3. UI:
   - Header z licznikiem propozycji
   - Lista `EditableFlashcardProposal`
   - Przyciski akcji
4. Walidacja przed zapisem
5. Obsługa błędów
6. Po sukcesie: callback `onSaveSuccess` lub nawigacja

#### Krok 4.4: Strona verify.astro
1. Utworzyć plik `src/pages/generate/verify.astro`
2. Odczyt danych z navigation state / sessionStorage
3. Renderowanie `VerificationView`
4. Middleware: sprawdzenie autentykacji

---

### Faza 5: Ręczne tworzenie fiszki (2-3h)

#### Krok 5.1: useManualFlashcard hook
1. Utworzyć plik `src/lib/hooks/useManualFlashcard.ts`
2. Implementacja state: `formData`, `isOpen`, `isSaving`, `errors`
3. Implementacja funkcji:
   - `openModal`, `closeModal`
   - `updateField` z walidacją
   - `saveFlashcard` - wywołanie API

#### Krok 5.2: ManualFlashcardModal component
1. Utworzyć komponent React
2. Użycie hooka `useManualFlashcard`
3. UI:
   - `Dialog` z Shadcn/ui
   - Formularz z polami
   - Walidacja inline
4. Obsługa zamknięcia (z potwierdzeniem jeśli są zmiany)
5. Po sukcesie: callback do odświeżenia listy

---

### Faza 6: Integracja dashboardu (3-4h)

#### Krok 6.1: useDashboard hook
1. Utworzyć plik `src/lib/hooks/useDashboard.ts`
2. Implementacja state: `flashcards`, `pagination`, `isLoading`, `error`
3. Implementacja funkcji:
   - `fetchFlashcards` - GET /api/flashcards
   - `deleteFlashcard` - optimistic update + rollback
   - `refreshList`
4. Auto-fetch przy montowaniu

#### Krok 6.2: DashboardContent component
1. Utworzyć komponent React
2. Użycie wszystkich hooków:
   - `useDashboard`
   - Stan dla modalu ręcznego tworzenia
3. Integracja wszystkich subkomponentów:
   - `FlashcardGenerator`
   - `FlashcardList`
   - `ManualFlashcardModal`
4. Obsługa callbacków:
   - onGenerateSuccess → nawigacja do verify
   - onDelete → wywołanie `deleteFlashcard` z hooka
   - onManualCreate → odświeżenie listy
5. Toast notifications (Shadcn/ui)

#### Krok 6.3: Strona index.astro
1. Middleware: sprawdzenie autentykacji
2. Pobranie initialnego `deckId` (dla MVP: domyślny deck użytkownika)
3. Renderowanie `DashboardContent`
4. Layout z Header (logo, user info, logout)

---

### Faza 7: Nawigacja i przepływ danych (2h)

#### Krok 7.1: Implementacja przekazywania danych
1. Dashboard → Verification:
   - Użycie Astro navigation state
   - Fallback: sessionStorage
2. Verification → Dashboard:
   - Po zapisie: przekierowanie + event/callback
   - Refresh listy po powrocie

#### Krok 7.2: Ochrona routingu
1. Middleware autentykacji (jeśli nie istnieje)
2. Verificati page: sprawdzenie czy są propozycje
3. Redirect do dashboard jeśli brak danych

---

### Faza 8: Doskonalenie UX (2-3h)

#### Krok 8.1: Loading states
1. Skeletony w FlashcardList
2. Spinnery w przyciskach podczas operacji
3. Wyłączanie formularzy podczas operacji

#### Krok 8.2: Empty states
1. Dashboard: "Brak fiszek" + CTA do tworzenia
2. Verification: automatyczne przekierowanie

#### Krok 8.3: Accessibility
1. Aria labels dla wszystkich interaktywnych elementów
2. Focus management (otwieranie modali, nawigacja)
3. Keyboard shortcuts (opcjonalnie: Escape, Enter)
4. Testowanie z czytnikiem ekranu

#### Krok 8.4: Responsywność
1. Mobile-first design
2. Testowanie na różnych rozmiarach ekranu
3. Touch-friendly (przyciski min 44x44px)

---

### Faza 9: Testy i bugfixing (2-3h)

#### Krok 9.1: Testy manualne
1. Happy path:
   - Generowanie → weryfikacja → zapis
   - Ręczne tworzenie
   - Usuwanie (z rollbackiem)
2. Edge cases:
   - Limit AI osiągnięty
   - Błędy walidacji
   - Błędy sieci (symulacja offline)
   - Propozycje puste/niepoprawne
3. User Stories:
   - Weryfikacja wszystkich kryteriów akceptacji (US-004, US-005, US-006, US-008)

#### Krok 9.2: Testy dostępności
1. Nawigacja klawiaturą przez wszystkie widoki
2. Screen reader testing
3. Color contrast (WCAG AA)

#### Krok 9.3: Bugfixing
1. Lista znalezionych bugów
2. Priorytetyzacja
3. Fixing

---

### Faza 10: Optymalizacja i deployment (1-2h)

#### Krok 10.1: Optymalizacja
1. Code splitting (lazy loading komponentów)
2. Memoizacja kosztownych obliczeń
3. Debouncing walidacji w real-time

#### Krok 10.2: Dokumentacja
1. README dla komponentów
2. JSDoc dla publicznych funkcji
3. Przykłady użycia hooków

#### Krok 10.3: Deployment
1. Build lokalny i sprawdzenie błędów
2. Deploy na staging
3. Final testing
4. Deploy na production

---

### Suma czasowa
- Faza 1: 1-2h
- Faza 2: 3-4h
- Faza 3: 4-5h
- Faza 4: 4-5h
- Faza 5: 2-3h
- Faza 6: 3-4h
- Faza 7: 2h
- Faza 8: 2-3h
- Faza 9: 2-3h
- Faza 10: 1-2h

**Łącznie: 24-33h** (3-4 dni pracy dla jednego programisty frontendowego)

---

## Podsumowanie

Plan implementacji został zaprojektowany z myślą o:
1. **Modularności:** Każdy komponent jest niezależny i reużywalny
2. **Type safety:** Pełne typowanie TypeScript dla wszystkich danych
3. **UX:** Optimistic updates, loading states, jasne komunikaty błędów
4. **Dostępności:** ARIA labels, keyboard navigation, screen reader support
5. **Skalowalności:** Custom hooks pozwalają na łatwą rozbudowę funkcjonalności

Implementacja powinna przebiegać fazami, z testowaniem po każdej fazie. Wszystkie komponenty są zgodne z PRD, User Stories i dostępnym API.

