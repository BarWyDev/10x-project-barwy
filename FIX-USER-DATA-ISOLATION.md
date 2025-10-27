# Naprawa Izolacji Danych Użytkowników

## Problem

Każdy użytkownik mógł widzieć wszystkie talie i karty w systemie, nie tylko swoje własne. To był **krytyczny problem bezpieczeństwa** spowodowany przez:

1. **Wyłączone polityki RLS (Row Level Security)** - polityki w bazie danych były ustawione na `using (true)`, co pozwalało wszystkim użytkownikom na dostęp do wszystkich danych
2. **Hardcoded TEST_USER_ID** - API endpoints używały stałego ID testowego użytkownika zamiast ID zalogowanego użytkownika
3. **Brak filtrowania po user_id** - niektóre endpointy nie filtrowały danych według ID użytkownika

## Rozwiązanie

### 1. Nowa Migracja RLS (✅ Zastosowana)

Utworzono nową migrację `supabase/migrations/20251027120000_fix_rls_policies.sql`, która:

- **Usuwa permisywne polityki** które pozwalały na wszystko
- **Tworzy właściwe polityki RLS** dla tabel `decks` i `flashcards`:
  - `SELECT` - użytkownik widzi tylko swoje dane
  - `INSERT` - użytkownik może tworzyć tylko swoje dane
  - `UPDATE` - użytkownik może aktualizować tylko swoje dane
  - `DELETE` - użytkownik może usuwać tylko swoje dane

Wszystkie polityki używają `auth.uid() = user_id` aby zapewnić izolację danych.

### 2. Zaktualizowane API Endpoints

Wszystkie endpointy zostały zaktualizowane aby:

1. **Sprawdzać autentykację** - zwracają błąd 401 jeśli użytkownik nie jest zalogowany
2. **Używać `locals.user.id`** zamiast hardcoded `TEST_USER_ID`
3. **Filtrować dane po user_id** w zapytaniach do bazy

#### Zmodyfikowane pliki:

**API Endpoints:**
- `src/pages/api/decks/index.ts` - GET teraz filtruje po user_id, POST używa user_id z sesji
- `src/pages/api/decks/[id].ts` - DELETE używa user_id z sesji
- `src/pages/api/flashcards/index.ts` - POST używa user_id z sesji
- `src/pages/api/flashcards/[id].ts` - PATCH i DELETE używają user_id z sesji
- `src/pages/api/flashcards/generate.ts` - używa user_id z sesji
- `src/pages/api/flashcards/batch.ts` - używa user_id z sesji

**Strony Astro:**
- `src/pages/app/index.astro` - używa `user.id` z `Astro.locals.user`
- `src/pages/app/decks.astro` - używa `user.id` z `Astro.locals.user`

### 3. Warstwy Bezpieczeństwa

System teraz ma **wielowarstwową ochronę**:

1. **Middleware** - sprawdza autentykację i przekierowuje niezalogowanych użytkowników
2. **API Endpoints** - sprawdzają `locals.user` i zwracają 401 jeśli brak autentykacji
3. **RLS Policies** - baza danych automatycznie filtruje dane według `auth.uid()`
4. **Serwisy** - zawsze przyjmują i używają `userId` w zapytaniach

## Testy

Aby zweryfikować poprawność:

### 1. Sprawdzenie polityk RLS w Supabase Studio

Otwórz http://127.0.0.1:54323 i sprawdź:
- Table Editor → decks → RLS Policies
- Table Editor → flashcards → RLS Policies

Powinieneś zobaczyć polityki:
- "Users can view their own decks/flashcards"
- "Users can create their own decks/flashcards"
- "Users can update their own decks/flashcards"
- "Users can delete their own decks/flashcards"

### 2. Testy funkcjonalne

1. **Utwórz dwóch użytkowników:**
   ```
   Użytkownik A: test1@example.com
   Użytkownik B: test2@example.com
   ```

2. **Jako użytkownik A:**
   - Utwórz talię "Talia A"
   - Dodaj kilka fiszek

3. **Jako użytkownik B:**
   - Utwórz talię "Talia B"
   - Dodaj kilka fiszek

4. **Weryfikacja:**
   - Użytkownik A powinien widzieć tylko "Talia A" i swoje fiszki
   - Użytkownik B powinien widzieć tylko "Talia B" i swoje fiszki
   - Próba dostępu do `/app?deck={uuid_talii_B}` przez użytkownika A powinna zakończyć się błędem

### 3. Testy API

```bash
# Zaloguj się jako użytkownik A i zapisz token
# GET /api/decks - powinien zwrócić tylko talie użytkownika A

# Zaloguj się jako użytkownik B i zapisz token  
# GET /api/decks - powinien zwrócić tylko talie użytkownika B

# Próba dostępu do talii użytkownika A tokenem użytkownika B
# DELETE /api/decks/{uuid_talii_A} - powinien zwrócić 404 lub błąd
```

## Migracja Danych

### Istniejące dane

Jeśli w bazie są już dane z różnych użytkowników:

1. **Sprawdź dane w Supabase Studio:**
   ```sql
   SELECT user_id, COUNT(*) as count 
   FROM decks 
   GROUP BY user_id;
   
   SELECT user_id, COUNT(*) as count 
   FROM flashcards 
   GROUP BY user_id;
   ```

2. **Jeśli znajdziesz dane testowe z TEST_USER_ID:**
   ```sql
   -- Usuń dane testowe (OPCJONALNIE)
   DELETE FROM flashcards WHERE user_id = '11111111-1111-1111-1111-111111111111';
   DELETE FROM decks WHERE user_id = '11111111-1111-1111-1111-111111111111';
   ```

## Wdrożenie na Produkcję

Jeśli używasz zdalnej instancji Supabase:

```bash
# 1. Połącz się z projektem zdalnym
npx supabase link --project-ref YOUR_PROJECT_REF

# 2. Zastosuj migrację
npx supabase db push

# 3. Zweryfikuj w Supabase Dashboard
# Przejdź do Table Editor → RLS Policies i sprawdź polityki
```

## Status: ✅ Kompletne

Wszystkie zmiany zostały zastosowane:
- ✅ Utworzona nowa migracja RLS z poprawnymi politykami
- ✅ Zaktualizowane wszystkie API endpoints (6 plików)
- ✅ Zaktualizowane strony Astro (2 pliki)
- ✅ Migracja zastosowana do lokalnej bazy danych
- ✅ Brak błędów lintingu

## Bezpieczeństwo

System jest teraz bezpieczny dzięki:

1. **Defense in Depth** - wielowarstwowa ochrona (middleware, API, RLS)
2. **Principle of Least Privilege** - użytkownicy mają dostęp tylko do swoich danych
3. **Fail-Safe Defaults** - brak dostępu jeśli nie jesteś autentykowany
4. **Complete Mediation** - każde żądanie jest sprawdzane

## Następne Kroki

Opcjonalne ulepszenia (nie są konieczne, ale mogą być przydatne):

1. **Testy E2E** - dodaj testy Playwright sprawdzające izolację danych między użytkownikami
2. **Audyt logów** - dodaj logowanie wszystkich operacji na danych (kto, kiedy, co)
3. **Rate limiting** - ogranicz liczbę żądań API per użytkownik
4. **RBAC** - dodaj role (admin, user, premium) jeśli potrzebujesz różnych poziomów dostępu

---

**Data:** 27 października 2025  
**Status:** Naprawione i przetestowane lokalnie  
**Priorytet:** ⚠️ KRYTYCZNY (BEZPIECZEŃSTWO)

