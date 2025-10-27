# Naprawa: Przycisk "Zmień talię" w widoku generatora

## Problem

Na stronie `/generate`, po wybraniu talii i kliknięciu przycisku "Zmień talię", użytkownik był automatycznie przenoszony z powrotem do widoku generatora zamiast pozostać w widoku wyboru talii.

**Symptomy:**
- Przycisk "Zmień talię" był widoczny i działał
- API było wywoływane poprawnie
- Widok deck-selection pojawiał się na chwilę
- Natychmiast następował powrót do widoku generator

## Przyczyna

Problem występował w komponencie `DeckSelector.tsx`:
- Po każdym załadowaniu talii, komponent **automatycznie wybierał pierwszą talię**
- Wybór talii powodował wywołanie `onDeckSelected`
- To z kolei zmieniało widok z powrotem na `generator`

```tsx
// Problematyczny kod w DeckSelector.tsx
if (isInitialLoad && !selectedDeckId && fetchedDecks.length > 0) {
  onDeckSelected(fetchedDecks[0]); // ❌ Zawsze wybierało pierwszą talię
}
```

## Rozwiązanie

### 1. Dodano prop `autoSelectFirst` do DeckSelector

```tsx
export interface DeckSelectorProps {
  onDeckSelected: (deck: DeckDTO) => void;
  selectedDeckId?: string;
  autoSelectFirst?: boolean; // Nowy parametr
}
```

### 2. Dodano stan `returningFromGenerator` w FlashcardApp

Stan śledzi, czy użytkownik wraca z widoku generatora:

```tsx
const [returningFromGenerator, setReturningFromGenerator] = useState(false);
```

### 3. Zaktualizowano logikę handleCancel

```tsx
const handleCancel = () => {
  if (currentView === 'generator') {
    setReturningFromGenerator(true); // Oznacz powrót z generatora
    setSelectedDeck(null);
    setCurrentView('deck-selection');
  }
};
```

### 4. Przekazanie flagi do DeckSelector

```tsx
<DeckSelector 
  onDeckSelected={handleDeckSelected}
  selectedDeckId={selectedDeck?.id}
  autoSelectFirst={!returningFromGenerator} // NIE wybieraj automatycznie przy powrocie
/>
```

### 5. Resetowanie flagi przy wyborze talii

```tsx
const handleDeckSelected = (deck: DeckDTO) => {
  setSelectedDeck(deck);
  setReturningFromGenerator(false); // Resetuj flagę
  setCurrentView('generator');
};
```

## Zmodyfikowane pliki

1. **src/components/FlashcardApp.tsx**
   - Dodano stan `returningFromGenerator`
   - Zaktualizowano `handleCancel`, `handleDeckSelected`, `handleStartOver`
   - Przekazano prop `autoSelectFirst` do DeckSelector

2. **src/components/dashboard/DeckSelector.tsx**
   - Dodano prop `autoSelectFirst` do interfejsu
   - Zaktualizowano logikę `loadDecks` aby uwzględniała flagę

## Jak to działa teraz

### Scenariusz 1: Pierwsze wejście na stronę
1. `returningFromGenerator = false`
2. `autoSelectFirst = true`
3. DeckSelector ładuje talie i **automatycznie wybiera pierwszą**
4. Użytkownik przechodzi do widoku generator

### Scenariusz 2: Kliknięcie "Zmień talię"
1. `handleCancel` ustawia `returningFromGenerator = true`
2. Stan zmienia się na `deck-selection`
3. `autoSelectFirst = false`
4. DeckSelector ładuje talie ale **NIE wybiera automatycznie**
5. Użytkownik zostaje w widoku wyboru talii ✅

### Scenariusz 3: Wybór nowej talii
1. Użytkownik klika na talię
2. `handleDeckSelected` ustawia `returningFromGenerator = false`
3. Widok zmienia się na `generator`
4. Flaga zostaje zresetowana dla następnego użycia

## Testowanie

### Test 1: Pierwsze wejście
```
1. Przejdź na http://localhost:3002/generate
2. Pierwsza talia powinna być automatycznie wybrana
3. Powinien pokazać się widok generatora
```

### Test 2: Zmiana talii
```
1. W widoku generatora kliknij "Zmień talię"
2. Powinien pokazać się widok wyboru talii
3. Widok POWINIEN POZOSTAĆ na wyborze talii
4. Lista talii powinna być widoczna
```

### Test 3: Wybór innej talii
```
1. W widoku wyboru talii kliknij na inną talię
2. Powinien pokazać się widok generatora z wybraną talią
3. Informacje o nowej talii powinny być widoczne
```

## Backward Compatibility

Rozwiązanie jest kompatybilne wstecz:
- `autoSelectFirst` ma wartość domyślną `true`
- Inne komponenty używające `DeckSelector` nie muszą być zmieniane
- Zachowanie domyślne (auto-select) pozostaje takie samo

## Status

✅ Naprawione i przetestowane
✅ Kod produkcyjny (usunięto wszystkie debugi)
✅ Kompatybilne wstecz

---

**Data:** 27 października 2025  
**Priorytet:** Średni (UX)  
**Typ:** Bug Fix

