# Debug: Błąd 400 przy zapisie fiszek

## Możliwe przyczyny błędu 400:

### 1. ❌ Puste pola po trim()
**Problem**: Jeśli `front_content` lub `back_content` zawiera tylko białe znaki (spacje), po `.trim()` zostanie pusty string.

**Schema Zod**:
```typescript
front_content: z.string()
  .trim()           // ⚠️ Najpierw trim
  .min(1, '...')    // Potem sprawdza czy > 0 znaków
```

**Rozwiązanie**: 
- Sprawdź czy wszystkie propozycje mają treść
- W komponencie `EditableFlashcardProposal` dodaj walidację przed zapisem

### 2. ❌ Brak pola `ai_accepted`
**Problem**: Schema wymaga `ai_accepted: boolean`

**Sprawdź w useVerification.ts**:
```typescript
flashcards: proposals.map(proposal => ({
  front_content: proposal.front_content.trim(),
  back_content: proposal.back_content.trim(),
  ai_accepted: !proposal.isEdited,  // ✅ To musi być boolean
}))
```

### 3. ❌ Nieprawidłowy format `deck_id`
**Problem**: `deck_id` musi być prawidłowym UUID

**Sprawdź**:
- Czy `deckId` przekazany do `VerificationView` jest poprawnym UUID?
- W demo mode używany jest `"test-deck"` (nieprawidłowy UUID)

### 4. ❌ Pusta tablica fiszek
**Problem**: Schema wymaga minimum 1 fiszki
```typescript
.min(1, 'At least one flashcard is required')
```

---

## 🔍 Jak zdiagnozować?

### Krok 1: Otwórz DevTools w przeglądarce
- Naciśnij `F12`
- Przejdź do zakładki **Network**
- Przejdź do zakładki **Console**

### Krok 2: Spróbuj zapisać fiszki
- Kliknij "Zapisz wszystkie"
- Zobacz request w zakładce Network

### Krok 3: Sprawdź szczegóły błędu

#### W zakładce Network:
1. Znajdź request `batch` lub `batch-demo`
2. Kliknij na niego
3. Zobacz **Request Payload** - co wysyłasz
4. Zobacz **Response** - jaki jest szczegółowy błąd

#### Przykładowa response 400:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "field": "flashcards.0.front_content",
      "reason": "Front content is required"
    }
  }
}
```

**`details.field`** powie Ci dokładnie, które pole jest problematyczne!

---

## 🛠️ Szybkie Rozwiązania

### Problem 1: Demo mode z nieprawidłowym UUID

**W `TestComponents.tsx`** zmień:
```typescript
// Zamiast:
deckId="test-deck"

// Użyj prawidłowego UUID:
deckId="00000000-0000-0000-0000-000000000000"
```

### Problem 2: Walidacja przed zapisem

Dodaj debug log w `useVerification.ts`:

```typescript
// W saveAllProposals, przed wywołaniem API:
console.log('Sending to API:', {
  deck_id: deckId,
  flashcards: proposals.map(proposal => ({
    front_content: proposal.front_content.trim(),
    back_content: proposal.back_content.trim(),
    ai_accepted: !proposal.isEdited,
  })),
});
```

### Problem 3: Sprawdź czy wszystkie pola są wypełnione

W `useVerification.ts` przed zapisem:

```typescript
// Dodaj walidację przed wywołaniem API:
const allValid = proposals.every(proposal => {
  const front = proposal.front_content.trim();
  const back = proposal.back_content.trim();
  
  console.log(`Proposal ${proposal.id}:`, {
    front_length: front.length,
    back_length: back.length,
    front_valid: front.length >= 1 && front.length <= 1000,
    back_valid: back.length >= 1 && back.length <= 2000,
  });
  
  return front.length >= 1 && back.length >= 1;
});

if (!allValid) {
  console.error('Some proposals have invalid content!');
  // ...
}
```

---

## 🐛 Najprawdopodobniejsza przyczyna

### ➡️ Demo mode używa nieprawidłowego UUID

W `TestComponents.tsx` i `generate/index.astro` używany jest:
```typescript
deckId="test-deck"  // ❌ To NIE jest UUID!
```

**Zod schema wymaga**:
```typescript
deck_id: z.string().uuid('Invalid deck ID format')
```

### ✅ Rozwiązanie:

Użyj dummy UUID dla demo:
```typescript
deckId="00000000-0000-0000-0000-000000000000"
```

---

## 📝 Co zrobić teraz?

1. **Otwórz DevTools** i sprawdź dokładny błąd w Response
2. **Skopiuj tutaj** treść błędu z pola `error.details`
3. **Sprawdź Console** czy są jakieś błędy JavaScript

Wtedy będę mógł dokładnie wskazać problem i go naprawić! 🔧



