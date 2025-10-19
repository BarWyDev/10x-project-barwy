# Schemat Bazy Danych PostgreSQL dla 10XCards

Ten dokument przedstawia kompleksowy schemat bazy danych dla projektu 10XCards, zaprojektowany na podstawie dokumentu wymagań produktu (PRD), notatek z sesji planowania oraz analizy stosu technologicznego.

## 1. Lista tabel z ich kolumnami, typami danych i ograniczeniami

### Typy niestandardowe (ENUMs)

**`flashcard_status`**
Typ wyliczeniowy do śledzenia statusu fiszki w systemie powtórek interwałowych.

```sql
CREATE TYPE public.flashcard_status AS ENUM (
    'new',
    'learning',
    'mastered'
);
```

### Tabela `decks`

Przechowuje talie fiszek utworzone przez użytkowników.

| Kolumna     | Typ danych    | Ograniczenia                                  | Opis                                           |
| :---------- | :------------ | :-------------------------------------------- | :--------------------------------------------- |
| `id`        | `uuid`        | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`    | Unikalny identyfikator talii.                  |
| `user_id`   | `uuid`        | `NOT NULL`, `REFERENCES auth.users(id)`       | Identyfikator użytkownika (z Supabase Auth).   |
| `name`      | `text`        | `NOT NULL`, `CHECK (name <> '')`              | Nazwa talii.                                   |
| `description` | `text`        | `NULLABLE`                                    | Opcjonalny opis talii.                         |
| `created_at`  | `timestamptz` | `NOT NULL`, `DEFAULT now()`                   | Czas utworzenia rekordu.                       |
| `updated_at`  | `timestamptz` | `NOT NULL`, `DEFAULT now()`                   | Czas ostatniej aktualizacji rekordu.           |

### Tabela `flashcards`

Przechowuje poszczególne fiszki należące do talii.

| Kolumna         | Typ danych         | Ograniczenia                                    | Opis                                                                   |
| :-------------- | :----------------- | :---------------------------------------------- | :--------------------------------------------------------------------- |
| `id`            | `uuid`             | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`      | Unikalny identyfikator fiszki.                                         |
| `deck_id`       | `uuid`             | `NOT NULL`, `REFERENCES public.decks(id)`       | Identyfikator talii, do której należy fiszka.                          |
| `user_id`       | `uuid`             | `NOT NULL`, `REFERENCES auth.users(id)`         | Zdenormalizowany ID użytkownika dla uproszczenia RLS.                  |
| `front_content` | `text`             | `NOT NULL`, `CHECK (front_content <> '')`       | Treść awersu fiszki.                                                   |
| `back_content`  | `text`             | `NOT NULL`, `CHECK (back_content <> '')`        | Treść rewersu fiszki.                                                  |
| `status`        | `flashcard_status` | `NOT NULL`, `DEFAULT 'new'`                     | Status fiszki w algorytmie powtórek.                                   |
| `ai_generated`  | `boolean`          | `NOT NULL`, `DEFAULT false`                     | Flaga wskazująca, czy fiszka została wygenerowana przez AI.            |
| `ai_accepted`   | `boolean`          | `NULLABLE`                                      | Flaga wskazująca, czy propozycja AI została zaakceptowana (używane do metryk). |
| `created_at`    | `timestamptz`      | `NOT NULL`, `DEFAULT now()`                     | Czas utworzenia rekordu.                                               |
| `updated_at`    | `timestamptz`      | `NOT NULL`, `DEFAULT now()`                     | Czas ostatniej aktualizacji rekordu.                                   |

## 2. Relacje między tabelami

*   **`auth.users` <-> `decks`**: Jeden do wielu (jeden użytkownik może mieć wiele talii).
    *   `decks.user_id` jest kluczem obcym wskazującym na `auth.users.id`.
*   **`decks` <-> `flashcards`**: Jeden do wielu (jedna talia może zawierać wiele fiszek).
    *   `flashcards.deck_id` jest kluczem obcym wskazującym na `decks.id`.
*   **`auth.users` <-> `flashcards`**: Jeden do wielu (jeden użytkownik może mieć wiele fiszek).
    *   `flashcards.user_id` jest zdenormalizowanym kluczem obcym wskazującym na `auth.users.id`, używanym do uproszczenia i optymalizacji polityk RLS.

## 3. Indeksy

W celu poprawy wydajności zapytań, na kluczach obcych zostaną utworzone następujące indeksy:

```sql
-- Indeks dla tabeli decks
CREATE INDEX idx_decks_user_id ON public.decks(user_id);

-- Indeksy dla tabeli flashcards
CREATE INDEX idx_flashcards_deck_id ON public.flashcards(deck_id);
CREATE INDEX idx_flashcards_user_id ON public.flashcards(user_id);
```

## 4. Zasady PostgreSQL (Row-Level Security)

RLS zostanie włączone dla obu tabel, aby zapewnić, że użytkownicy mają dostęp wyłącznie do swoich danych.

### Tabela `decks`

```sql
-- 1. Włączenie RLS dla tabeli decks
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;

-- 2. Polityka SELECT: Użytkownicy mogą odczytywać tylko swoje talie
CREATE POLICY "Allow users to read their own decks"
ON public.decks FOR SELECT
USING (auth.uid() = user_id);

-- 3. Polityka INSERT: Użytkownicy mogą tworzyć talie tylko dla siebie
CREATE POLICY "Allow users to create their own decks"
ON public.decks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Polityka UPDATE: Użytkownicy mogą aktualizować tylko swoje talie
CREATE POLICY "Allow users to update their own decks"
ON public.decks FOR UPDATE
USING (auth.uid() = user_id);

-- 5. Polityka DELETE: Użytkownicy mogą usuwać tylko swoje talie
CREATE POLICY "Allow users to delete their own decks"
ON public.decks FOR DELETE
USING (auth.uid() = user_id);
```

### Tabela `flashcards`

```sql
-- 1. Włączenie RLS dla tabeli flashcards
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- 2. Polityka SELECT: Użytkownicy mogą odczytywać tylko swoje fiszki
CREATE POLICY "Allow users to read their own flashcards"
ON public.flashcards FOR SELECT
USING (auth.uid() = user_id);

-- 3. Polityka INSERT: Użytkownicy mogą tworzyć fiszki tylko dla siebie
CREATE POLICY "Allow users to create their own flashcards"
ON public.flashcards FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Polityka UPDATE: Użytkownicy mogą aktualizować tylko swoje fiszki
CREATE POLICY "Allow users to update their own flashcards"
ON public.flashcards FOR UPDATE
USING (auth.uid() = user_id);

-- 5. Polityka DELETE: Użytkownicy mogą usuwać tylko swoje fiszki
CREATE POLICY "Allow users to delete their own flashcards"
ON public.flashcards FOR DELETE
USING (auth.uid() = user_id);
```

## 5. Wszelkie dodatkowe uwagi lub wyjaśnienia dotyczące decyzji projektowych

*   **Automatyczna aktualizacja `updated_at`**:
    Zostanie utworzona funkcja i trigger w PostgreSQL, aby automatycznie aktualizować pole `updated_at` przy każdej modyfikacji rekordu w tabelach `decks` i `flashcards`.

    ```sql
    -- Funkcja
    CREATE OR REPLACE FUNCTION public.handle_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = now();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Trigger dla decks
    CREATE TRIGGER on_decks_updated
    BEFORE UPDATE ON public.decks
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

    -- Trigger dla flashcards
    CREATE TRIGGER on_flashcards_updated
    BEFORE UPDATE ON public.flashcards
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();
    ```

*   **Denormalizacja `user_id` w `flashcards`**:
    Kolumna `user_id` została celowo dodana do tabeli `flashcards`, mimo że można by ją uzyskać poprzez złączenie z tabelą `decks`. Ta denormalizacja znacząco upraszcza implementację polityk RLS i poprawia wydajność zapytań, eliminując potrzebę dodatkowego złączenia w każdej polityce bezpieczeństwa.

*   **Strategia usuwania danych (nierozwiązane)**:
    Zgodnie z decyzją podjętą na etapie MVP, zrezygnowano z użycia `ON DELETE CASCADE`. Oznacza to, że usunięcie użytkownika z `auth.users` lub talii z `decks` nie spowoduje automatycznego usunięcia powiązanych rekordów (talii lub fiszek). Logika obsługi osieroconych danych (np. blokowanie usunięcia niepustej talii) musi zostać zaimplementowana na poziomie aplikacji.

*   **Klucze podstawowe**:
    Wszystkie klucze podstawowe są typu `UUID`, co jest dobrą praktyką w systemach rozproszonych i ułatwia przyszłą skalowalność.
