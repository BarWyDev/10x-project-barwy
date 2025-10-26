# 🔍 Jak Sprawdzić Dane w Supabase Studio

## 🚀 Quick Start

### Krok 1: Otwórz Supabase Studio

```
http://127.0.0.1:54323
```

---

## 📊 Sprawdź Swoje Talie

### Krok 2: Table Editor → `decks`

1. W menu po lewej stronie kliknij **"Table Editor"**
2. Wybierz tabelę **`decks`**
3. Zobaczysz listę wszystkich swoich talii

**Co zobaczysz:**
```
┌──────────────────────────────────┬──────────────────────────────────┬─────────────────────┬────────────────┬─────────────────────┐
│ id (UUID)                        │ user_id                          │ name                │ description    │ created_at          │
├──────────────────────────────────┼──────────────────────────────────┼─────────────────────┼────────────────┼─────────────────────┤
│ abc123...                        │ 11111111-1111-1111-1111-111...  │ Moja pierwsza talia │ Test talia     │ 2025-10-23 17:15:00 │
└──────────────────────────────────┴──────────────────────────────────┴─────────────────────┴────────────────┴─────────────────────┘
```

**Kolumny:**
- **`id`** - Unikalny ID talii
- **`user_id`** - ID użytkownika (twój test user: `11111111...`)
- **`name`** - Nazwa talii
- **`description`** - Opis talii
- **`created_at`** - Kiedy utworzono

---

## 🎴 Sprawdź Swoje Fiszki

### Krok 3: Table Editor → `flashcards`

1. W Table Editor wybierz tabelę **`flashcards`**
2. Zobaczysz listę wszystkich wygenerowanych fiszek

**Co zobaczysz:**
```
┌────────────┬────────────┬─────────────────────────────┬─────────────────────────────┬──────────┬──────────────┬─────────────┐
│ id         │ deck_id    │ front_content               │ back_content                │ status   │ ai_generated │ ai_accepted │
├────────────┼────────────┼─────────────────────────────┼─────────────────────────────┼──────────┼──────────────┼─────────────┤
│ def456...  │ abc123...  │ Co to są mitochondria?      │ Organelle odpowiedzialne... │ new      │ true         │ true        │
│ ghi789...  │ abc123...  │ Czym jest ATP?              │ Adenozynotrójfosforan...    │ new      │ true         │ false       │
└────────────┴────────────┴─────────────────────────────┴─────────────────────────────┴──────────┴──────────────┴─────────────┘
```

**Ważne kolumny:**
- **`id`** - Unikalny ID fiszki
- **`deck_id`** - ID talii (musi być takie samo jak w tabeli `decks`)
- **`front_content`** - Pytanie (awers)
- **`back_content`** - Odpowiedź (rewers)
- **`status`** - Status fiszki (`new`, `learning`, `review`, `relearning`)
- **`ai_generated`** - Czy wygenerowana przez AI? (`true` / `false`)
- **`ai_accepted`** - Czy zaakceptowana bez edycji? (`true` = nie edytowano, `false` = edytowano)
- **`user_id`** - ID użytkownika
- **`created_at`** - Kiedy utworzono

---

## 🔎 Zaawansowane: SQL Queries

### Krok 4: SQL Editor (Opcjonalnie)

1. W menu po lewej kliknij **"SQL Editor"**
2. Wpisz zapytanie
3. Kliknij **"Run"** (Ctrl+Enter)

### 📊 Przydatne Zapytania

#### 1. Pokaż wszystkie moje talie z liczbą fiszek

```sql
SELECT 
  d.id,
  d.name,
  d.description,
  COUNT(f.id) as flashcard_count,
  d.created_at
FROM decks d
LEFT JOIN flashcards f ON d.deck_id = f.id
WHERE d.user_id = '11111111-1111-1111-1111-111111111111'
GROUP BY d.id
ORDER BY d.created_at DESC;
```

#### 2. Pokaż ostatnie 10 fiszek

```sql
SELECT 
  f.id,
  d.name as deck_name,
  f.front_content,
  f.back_content,
  f.ai_generated,
  f.ai_accepted,
  f.created_at
FROM flashcards f
JOIN decks d ON f.deck_id = d.id
WHERE f.user_id = '11111111-1111-1111-1111-111111111111'
ORDER BY f.created_at DESC
LIMIT 10;
```

#### 3. Statystyki - ile mam czego?

```sql
SELECT 
  (SELECT COUNT(*) FROM decks WHERE user_id = '11111111-1111-1111-1111-111111111111') as total_decks,
  (SELECT COUNT(*) FROM flashcards WHERE user_id = '11111111-1111-1111-1111-111111111111') as total_flashcards,
  (SELECT COUNT(*) FROM flashcards WHERE user_id = '11111111-1111-1111-1111-111111111111' AND ai_generated = true) as ai_flashcards,
  (SELECT COUNT(*) FROM flashcards WHERE user_id = '11111111-1111-1111-1111-111111111111' AND ai_accepted = true) as accepted_without_edit;
```

#### 4. Fiszki z konkretnej talii

```sql
SELECT 
  front_content,
  back_content,
  ai_accepted,
  created_at
FROM flashcards
WHERE deck_id = 'WKLEJ-TUTAJ-ID-TALII'
ORDER BY created_at DESC;
```

---

## 💡 Pro Tips

### Filtrowanie w Table Editor

W Table Editor możesz:
- **Sortować** - kliknij nagłówek kolumny
- **Filtrować** - użyj ikony filtra
- **Szukać** - użyj Ctrl+F

### Edycja Danych

Możesz edytować dane bezpośrednio:
1. Kliknij na komórkę
2. Edytuj
3. Naciśnij Enter
4. Potwierdź zmiany

### Export Danych

1. W Table Editor kliknij **"Export"**
2. Wybierz format (CSV, JSON)
3. Pobierz plik

---

## 🎯 Quick Check - Co Powinieneś Zobaczyć?

Po wygenerowaniu i zapisaniu fiszek:

✅ **W tabeli `decks`:**
- 1+ talia z twoją nazwą
- `user_id` = `11111111-1111-1111-1111-111111111111`

✅ **W tabeli `flashcards`:**
- X fiszek (np. 2-5)
- `deck_id` pasuje do ID talii
- `user_id` = `11111111-1111-1111-1111-111111111111`
- `ai_generated` = `true`
- `ai_accepted` = `true` lub `false` (zależnie czy edytowałeś)
- `status` = `new`
- `front_content` i `back_content` wypełnione

---

## 🆘 Nie Widzisz Danych?

### Sprawdź:

1. **Czy talia została utworzona?**
   - Sprawdź w UI czy widzisz "Sukces!" screen

2. **Czy Console nie pokazuje błędów?**
   - Otwórz DevTools (F12) → Console
   - Szukaj czerwonych błędów

3. **Czy użytkownik jest poprawny?**
   ```sql
   SELECT * FROM auth.users 
   WHERE id = '11111111-1111-1111-1111-111111111111';
   ```
   Powinien zwrócić 1 wiersz

4. **Odśwież Table Editor**
   - Kliknij przycisk odświeżania w Table Editor

---

## 🎉 Gotowe!

Teraz wiesz jak sprawdzić wszystkie swoje dane w Supabase Studio!

**Najszybsza metoda:**
```
1. http://127.0.0.1:54323
2. Table Editor → decks (talie)
3. Table Editor → flashcards (fiszki)
4. Gotowe! 🚀
```





