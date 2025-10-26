# 🧪 Przewodnik Testowania - Pełny Flow z Supabase

## 📋 Przygotowanie

### Krok 1: Upewnij się że serwer działa

```bash
npm run dev
```

### Krok 2: Sprawdź połączenie z Supabase

Upewnij się że masz ustawione w `.env`:
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=xxx
OPENAI_API_KEY=sk-xxx
```

### Krok 3: Uruchom migrację testowego użytkownika

**Opcja A: Supabase CLI**
```bash
supabase db push
```

**Opcja B: Supabase Dashboard**
1. Idź do **SQL Editor**
2. Wykonaj SQL z `supabase/migrations/20251023120000_create_test_user.sql`

### Krok 4: Zweryfikuj że tabele istnieją

Sprawdź w Supabase Dashboard → Table Editor:
- ✅ `decks` (tabela z taliami)
- ✅ `flashcards` (tabela z fiszkami)
- ✅ `auth.users` (test user)

---

## 🚀 Test #1: Pełny Flow - Nowa Talia

### Cel: Przetestować cały proces od zera

1. **Otwórz aplikację**
   ```
   http://localhost:4321/app
   ```

2. **Krok 1: Utwórz nową talię**
   - Kliknij "**+ Nowa talia**"
   - Wprowadź nazwę: `"Biologia - Komórka"`
   - Wprowadź opis: `"Notatki z lekcji o budowie komórki"`
   - Kliknij "**Utwórz talię**"
   
   **✅ Oczekiwany rezultat:**
   - Talia pojawia się na liście z badge "Wybrana"
   - Przechodzisz automatycznie do kroku 2 (Generator)

3. **Krok 2: Wygeneruj fiszki**
   - Wklej przykładowy tekst (min 50 znaków):
   ```
   Mitochondria są organellami błonowymi znajdującymi się w cytoplazmie komórek eukariotycznych. Odpowiadają za produkcję ATP, czyli głównej waluty energetycznej komórki. Proces ten nazywa się fosforylacją oksydacyjną i zachodzi w wewnętrznej błonie mitochondrialnej. Mitochondria posiadają własny DNA, co sugeruje ich endosymbiotyczne pochodzenie.
   ```
   - Kliknij "**Generuj fiszki z AI**"
   - Poczekaj 5-10 sekund
   
   **✅ Oczekiwany rezultat:**
   - Loading state z spinnerem
   - Po zakończeniu: 2-5 wygenerowanych propozycji
   - Usage indicator pokazuje użycie

4. **Krok 3: Weryfikuj i zapisz**
   - Przejrzyj wygenerowane fiszki
   - (Opcjonalnie) Edytuj treść lub usuń niepotrzebne
   - Kliknij "**Zapisz wszystkie (X)**"
   
   **✅ Oczekiwany rezultat:**
   - Loading state "Zapisywanie..."
   - Po zapisie: ekran sukcesu z ✅🎉
   - Lista zapisanych fiszek

5. **Weryfikacja w bazie danych**
   
   **Sprawdź w Supabase Dashboard:**
   
   a) **Tabela `decks`:**
   ```sql
   SELECT * FROM decks WHERE name = 'Biologia - Komórka';
   ```
   Powinieneś zobaczyć:
   - `id`: UUID talii
   - `user_id`: `11111111-1111-1111-1111-111111111111`
   - `name`: `"Biologia - Komórka"`
   - `description`: `"Notatki z lekcji..."`
   - `created_at`: timestamp
   
   b) **Tabela `flashcards`:**
   ```sql
   SELECT * FROM flashcards WHERE deck_id = 'UUID-TALII-Z-POWYZEJ';
   ```
   Powinieneś zobaczyć X fiszek:
   - `id`: UUID każdej fiszki
   - `deck_id`: ID talii
   - `user_id`: `11111111-1111-1111-1111-111111111111`
   - `front_content`: Treść awersu
   - `back_content`: Treść rewersu
   - `ai_generated`: `true`
   - `ai_accepted`: `true` (jeśli nie edytowano) lub `false` (jeśli edytowano)
   - `status`: `new`
   - `created_at`: timestamp

---

## 🚀 Test #2: Istniejąca Talia

### Cel: Dodanie fiszek do istniejącej talii

1. **Odśwież stronę** `/app`

2. **Wybierz istniejącą talię**
   - Powinieneś zobaczyć talię "Biologia - Komórka" z poprzedniego testu
   - Kliknij na kartę talii
   
   **✅ Oczekiwany rezultat:**
   - Talia jest zaznaczona (blue ring)
   - Przechodzisz do generatora
   - Info pokazuje liczbę fiszek w talii

3. **Wygeneruj kolejne fiszki**
   - Użyj innego tekstu (np. o fotosynezie)
   - Zapisz
   
   **✅ Oczekiwany rezultat:**
   - Fiszki dodane do tej samej talii
   - `flashcard_count` zwiększył się

---

## 🚀 Test #3: Edycja Propozycji

### Cel: Przetestować edycję przed zapisem

1. **Wygeneruj fiszki** jak w Test #1

2. **W widoku weryfikacji:**
   - Edytuj treść jednej z fiszek
   - Badge "Edytowano" powinien się pojawić
   - Zapisz
   
3. **Sprawdź w bazie:**
   ```sql
   SELECT front_content, back_content, ai_accepted 
   FROM flashcards 
   WHERE ai_generated = true 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```
   
   **✅ Oczekiwany rezultat:**
   - Edytowana fiszka ma `ai_accepted = false`
   - Nieedytowane fiszki mają `ai_accepted = true`

---

## 🚀 Test #4: Usuwanie Propozycji

### Cel: Przetestować usuwanie przed zapisem

1. **Wygeneruj fiszki** (np. 3 fiszki)

2. **W widoku weryfikacji:**
   - Usuń jedną fiszkę (kliknij ikonę kosza)
   - Licznik powinien zmniejszyć się do 2
   - Zapisz tylko 2 fiszki
   
   **✅ Oczekiwany rezultat:**
   - Tylko 2 fiszki zapisane w bazie
   - Usunięta propozycja NIE jest w bazie

---

## 🚀 Test #5: Walidacja

### Cel: Przetestować walidację błędnych danych

**Test 5a: Tekst za krótki**
1. Wprowadź tekst < 50 znaków
2. Przycisk "Generuj" powinien być disabled
3. Komunikat błędu: "Tekst musi zawierać minimum 50 znaków"

**Test 5b: Pusta nazwa talii**
1. Kliknij "+ Nowa talia"
2. Zostaw pole nazwy puste
3. Kliknij "Utwórz talię"
4. Komunikat błędu: "Nazwa talii jest wymagana"

**Test 5c: Pusta treść fiszki**
1. W weryfikacji, wyczyść całkowicie pole awers/rewers
2. Przycisk "Zapisz wszystkie" powinien być disabled
3. Czerwona ramka wokół pola + komunikat błędu

---

## 🚀 Test #6: Daily Limits

### Cel: Przetestować limity dzienne

1. **Sprawdź usage indicator**
   - Powinien pokazywać X/100 dzisiaj
   
2. **Wygeneruj kilka razy**
   - Za każdym razem licznik powinien rosnąć
   
3. **Sprawdź w bazie:**
   ```sql
   SELECT COUNT(*) as count
   FROM flashcards 
   WHERE user_id = '11111111-1111-1111-1111-111111111111'
   AND ai_generated = true
   AND created_at >= CURRENT_DATE;
   ```
   
   Liczba powinna zgadzać się z usage indicator

---

## 🐛 Debugging - Częste Problemy

### Problem 1: "Supabase client not initialized"

**Przyczyna:** Brak zmiennych środowiskowych

**Rozwiązanie:**
```bash
# Sprawdź .env
cat .env | grep SUPABASE

# Powinno być:
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=xxx
```

### Problem 2: "Deck not found"

**Przyczyna:** User nie istnieje lub RLS policy blokuje

**Rozwiązanie:**
```sql
-- Sprawdź czy test user istnieje
SELECT * FROM auth.users WHERE id = '11111111-1111-1111-1111-111111111111';

-- Sprawdź RLS policies
SELECT * FROM pg_policies WHERE tablename = 'decks';
```

Polityki powinny być `using (true)` i `with check (true)` (allow all)

### Problem 3: "AI generation failed"

**Przyczyna:** Brak OPENAI_API_KEY lub błędny key

**Rozwiązanie:**
```bash
# Sprawdź .env
cat .env | grep OPENAI_API_KEY

# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Problem 4: Fiszki nie zapisują się

**Rozwiązanie:**
1. Otwórz DevTools (F12) → Network
2. Zobacz request do `/api/flashcards/batch`
3. Sprawdź Response - jaki błąd?
4. Zobacz Console - są jakieś błędy JavaScript?

---

## ✅ Checklist Testowania

- [ ] Test #1: Pełny flow z nową talią - **PASSED**
- [ ] Test #2: Dodanie do istniejącej talii - **PASSED**
- [ ] Test #3: Edycja propozycji - **PASSED**
- [ ] Test #4: Usuwanie propozycji - **PASSED**
- [ ] Test #5a: Walidacja tekstu - **PASSED**
- [ ] Test #5b: Walidacja nazwy talii - **PASSED**
- [ ] Test #5c: Walidacja treści fiszki - **PASSED**
- [ ] Test #6: Daily limits tracking - **PASSED**
- [ ] Weryfikacja w bazie: Decks - **PASSED**
- [ ] Weryfikacja w bazie: Flashcards - **PASSED**
- [ ] Weryfikacja: ai_accepted flag - **PASSED**

---

## 📊 Co Sprawdzić w Supabase Dashboard

### 1. Table Editor → decks
- Sprawdź czy talie się tworzą
- Sprawdź user_id (powinien być test user)
- Sprawdź timestamps

### 2. Table Editor → flashcards
- Sprawdź czy fiszki się zapisują
- Sprawdź deck_id (powzięcie z taliami)
- Sprawdź ai_generated = true
- Sprawdź ai_accepted (true/false)
- Sprawdź status = 'new'

### 3. SQL Editor - Custom Queries
```sql
-- Statystyki użytkownika
SELECT 
  (SELECT COUNT(*) FROM decks WHERE user_id = '11111111-1111-1111-1111-111111111111') as total_decks,
  (SELECT COUNT(*) FROM flashcards WHERE user_id = '11111111-1111-1111-1111-111111111111') as total_flashcards,
  (SELECT COUNT(*) FROM flashcards WHERE user_id = '11111111-1111-1111-1111-111111111111' AND ai_generated = true) as ai_generated_flashcards;

-- Ostatnie 10 fiszek
SELECT 
  f.id,
  d.name as deck_name,
  f.front_content,
  f.ai_generated,
  f.ai_accepted,
  f.created_at
FROM flashcards f
JOIN decks d ON f.deck_id = d.id
WHERE f.user_id = '11111111-1111-1111-1111-111111111111'
ORDER BY f.created_at DESC
LIMIT 10;
```

---

## 🎯 Sukces!

Jeśli wszystkie testy przeszły ✅, Twoja aplikacja:
- ✅ Łączy się z Supabase
- ✅ Tworzy talie w bazie
- ✅ Generuje fiszki przez AI
- ✅ Zapisuje fiszki do bazy
- ✅ Trackuje usage limits
- ✅ Waliduje dane
- ✅ Obsługuje błędy

**Aplikacja jest gotowa do użycia!** 🚀





