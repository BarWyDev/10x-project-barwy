# 🚀 Quick Start - Lokalny Supabase Gotowy!

## ✅ Co Właśnie Zrobiłeś

1. ✅ Uruchomiłeś lokalny Supabase (`supabase start`)
2. ✅ Zaktualizowałeś `.env` z lokalnymi kluczami
3. ✅ Uruchomiłeś wszystkie migracje (`supabase db reset`)
4. ✅ Test user został utworzony

## 🎯 Co Teraz Zrobić?

### Krok 1: Restart Dev Server

**WAŻNE**: Musisz zrestartować serwer dev, żeby załadował nowy `.env`

```bash
# Zatrzymaj aktualny serwer (Ctrl+C)
# Potem uruchom ponownie:
npm run dev
```

### Krok 2: Otwórz Aplikację

```
http://localhost:3000/app
```

### Krok 3: Przetestuj!

1. **Utwórz talię**
   - Kliknij "+ Nowa talia"
   - Nazwa: "Moja pierwsza talia"
   - Kliknij "Utwórz talię"

2. **Wygeneruj fiszki**
   - Wklej tekst (min 50 znaków):
   ```
   Mitochondria są organellami błonowymi znajdującymi się w cytoplazmie komórek eukariotycznych. Odpowiadają za produkcję ATP, czyli głównej waluty energetycznej komórki.
   ```
   - Kliknij "Generuj fiszki z AI"
   - Poczekaj 5-10 sekund

3. **Zapisz do bazy**
   - Przejrzyj propozycje
   - Kliknij "Zapisz wszystkie"
   - 🎉 Sukces!

---

## 📊 Zweryfikuj w Supabase Studio

### Otwórz Supabase Studio

```
http://127.0.0.1:54323
```

### Sprawdź Dane

1. **Table Editor → decks**
   - Powinieneś zobaczyć utworzoną talię

2. **Table Editor → flashcards**
   - Powinieneś zobaczyć wygenerowane fiszki

3. **SQL Editor**
   ```sql
   -- Statystyki
   SELECT 
     (SELECT COUNT(*) FROM decks) as total_decks,
     (SELECT COUNT(*) FROM flashcards) as total_flashcards,
     (SELECT COUNT(*) FROM flashcards WHERE ai_generated = true) as ai_flashcards;
   
   -- Ostatnie fiszki
   SELECT 
     f.id,
     d.name as deck_name,
     f.front_content,
     f.back_content,
     f.ai_generated,
     f.created_at
   FROM flashcards f
   JOIN decks d ON f.deck_id = d.id
   ORDER BY f.created_at DESC
   LIMIT 5;
   ```

---

## 🔧 Twoja Konfiguracja

### .env (Lokalny Supabase)
```env
SUPABASE_URL='http://127.0.0.1:54321'
SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
OPENAI_API_KEY='sk-proj-...'
```

### Test User
```
Email:    test@example.com
Password: password123
User ID:  11111111-1111-1111-1111-111111111111
```

### Supabase Endpoints
- API: http://127.0.0.1:54321
- Studio: http://127.0.0.1:54323
- Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres

---

## ❌ Troubleshooting

### Problem: "Supabase client not initialized"

**Rozwiązanie**: Restart dev server (npm run dev)

### Problem: "AI generation failed"

**Sprawdź**:
1. OPENAI_API_KEY jest poprawny
2. Masz kredyty w OpenAI
3. Zobacz Console (F12) dla szczegółów błędu

### Problem: "Deck not found"

**Sprawdź**:
```sql
-- Czy test user istnieje?
SELECT * FROM auth.users 
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Czy talie są dostępne?
SELECT * FROM decks;
```

### Problem: Fiszki nie zapisują się

**Debugowanie**:
1. Otwórz DevTools (F12) → Network
2. Zobacz request do `/api/flashcards/batch`
3. Sprawdź Response
4. Sprawdź Console dla błędów JavaScript

---

## 📝 Komendy Supabase

```bash
# Status
supabase status

# Reset bazy (wyczyść wszystko i uruchom migracje ponownie)
supabase db reset

# Zatrzymaj Supabase
supabase stop

# Uruchom Supabase
supabase start

# Zobacz logi
supabase logs

# Nowa migracja
supabase migration new nazwa_migracji
```

---

## 🎉 Gotowe!

Wszystko skonfigurowane i działa lokalnie!

**Następny krok**: Restart dev server i testuj `/app`! 🚀


