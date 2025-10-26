# Plan Testów - 10XCards

## 1. Wprowadzenie i cele testowania

### 1.1. Cel dokumentu
Niniejszy dokument stanowi kompleksowy plan testów dla aplikacji 10XCards - aplikacji webowej do tworzenia i nauki z fiszek edukacyjnych z wykorzystaniem AI. Plan testów określa strategię, zakres, metodologię oraz harmonogram działań testowych mających na celu zapewnienie wysokiej jakości produktu.

### 1.2. Cele testowania
- **Weryfikacja funkcjonalności**: Potwierdzenie, że wszystkie funkcjonalności aplikacji działają zgodnie z wymaganiami
- **Bezpieczeństwo**: Zapewnienie, że dane użytkowników są chronione, a mechanizmy autoryzacji działają prawidłowo
- **Kontrola kosztów**: Weryfikacja poprawnego działania limitów generowania fiszek przez AI
- **Integracje**: Potwierdzenie prawidłowej współpracy z systemami zewnętrznymi (Supabase, OpenAI)
- **Jakość kodu**: Weryfikacja zgodności z najlepszymi praktykami TypeScript i React
- **Doświadczenie użytkownika**: Potwierdzenie, że interfejs jest intuicyjny, responsywny i dostępny

### 1.3. Kluczowe obszary ryzyka
1. **Bezpieczeństwo danych użytkowników** - naruszenie RLS może prowadzić do wycieku danych
2. **Kontrola kosztów AI** - brak limitów może generować wysokie rachunki za API OpenAI
3. **Niezawodność integracji z AI** - timeout'y, błędy API, nieprawidłowe odpowiedzi
4. **Race conditions** - współbieżne wykorzystanie dziennych limitów AI
5. **Wydajność** - wolne zapytania do bazy danych, długie czasy odpowiedzi AI

## 2. Zakres testów

### 2.1. W zakresie testów

#### Moduły funkcjonalne:
- **System uwierzytelniania i autoryzacji**
  - Rejestracja użytkowników
  - Logowanie i wylogowanie
  - Resetowanie hasła
  - Zarządzanie sesją
  - Middleware autoryzacji
  
- **Zarządzanie talią fiszek (Decks)**
  - Tworzenie talii
  - Wyświetlanie listy talii
  - Edycja talii
  - Usuwanie talii
  - Paginacja i sortowanie
  
- **Zarządzanie fiszkami (Flashcards)**
  - Tworzenie pojedynczej fiszki
  - Tworzenie fiszek w trybie batch
  - Wyświetlanie listy fiszek
  - Edycja fiszek
  - Usuwanie fiszek
  - Filtrowanie według statusu i typu
  
- **Generowanie fiszek przez AI**
  - Generowanie propozycji fiszek z tekstu
  - Walidacja tekstu wejściowego (50-5000 znaków)
  - Przetwarzanie odpowiedzi AI
  - Obsługa błędów i timeout'ów
  
- **System limitów użycia AI**
  - Sprawdzanie dziennych limitów
  - Zliczanie wygenerowanych fiszek
  - Resetowanie limitów o północy UTC
  - Obsługa przekroczenia limitu
  
- **Bezpieczeństwo**
  - Row Level Security (RLS) policies
  - Weryfikacja własności zasobów
  - Walidacja danych wejściowych (Zod schemas)
  - Ochrona przed injection attacks

#### Komponenty techniczne:
- API endpoints (Astro)
- Serwisy biznesowe (AIService, DeckService, FlashcardService, UsageService)
- Middleware (sesje, autoryzacja)
- Walidatory (Zod schemas)
- Komponenty React (formularze, widoki)
- Integracje (Supabase, OpenAI API)

### 2.2. Poza zakresem testów
- Testy wydajności obciążeniowe (performance testing) - planowane w kolejnej fazie
- Testy bezpieczeństwa penetracyjne (penetration testing) - audyt zewnętrzny
- Testy kompatybilności z przeglądarkami starszymi niż 2 lata
- Testy aplikacji mobilnych natywnych (projekt dotyczy aplikacji webowej)
- Testy infrastruktury serwerowej i skalowania

## 3. Typy testów do przeprowadzenia

### 3.1. Testy jednostkowe (Unit Tests)
**Cel**: Weryfikacja poprawności działania pojedynczych funkcji, metod i komponentów w izolacji.

**Narzędzie**: Vitest

**Zakres**:
- **Serwisy biznesowe**
  - `AIService.generateFlashcards()` - mockowanie OpenAI API
  - `UsageService.checkAndGetUsage()` - mockowanie Supabase client
  - `UsageService.getNextResetTime()` - testy obliczania czasu
  - `DeckService.verifyDeckOwnership()` - mockowanie zapytań DB
  - `FlashcardService.createFlashcard()` - mockowanie operacji DB
  
- **Walidatory (Zod schemas)**
  - `generateFlashcardsSchema` - walidacja poprawnych i niepoprawnych danych
  - `batchCreateFlashcardsSchema` - limity (1-100 fiszek)
  - `createFlashcardSchema` - limity długości pól
  - `updateFlashcardsSchema` - walidacja częściowych aktualizacji
  - `recordReviewSchema` - walidacja ratingów
  
- **Utility functions**
  - Funkcje pomocnicze do walidacji UUID
  - Funkcje formatowania dat
  - Funkcje transformacji danych

**Kryteria akceptacji**:
- Pokrycie kodu (code coverage) minimum 80% dla serwisów i validatorów
- Wszystkie ścieżki logiczne (happy path i error cases) pokryte testami
- Czas wykonania: maksymalnie 30 sekund dla całego zestawu testów jednostkowych

### 3.2. Testy integracyjne (Integration Tests)
**Cel**: Weryfikacja współpracy komponentów systemu oraz integracji z systemami zewnętrznymi.

**Narzędzie**: Vitest + Supabase Test Client

**Zakres**:
- **Integracja z Supabase**
  - Operacje CRUD na tabelach `decks` i `flashcards`
  - Weryfikacja działania RLS policies
  - Testy transakcji bazodanowych
  - Testy triggerów (np. `updated_at`)
  
- **Integracja API endpoints**
  - `POST /api/flashcards/generate` - end-to-end z mockiem OpenAI
  - `POST /api/flashcards/batch` - tworzenie wielu fiszek
  - `GET /api/flashcards` - paginacja, filtrowanie
  - `GET /api/decks` - paginacja, sortowanie
  - Wszystkie operacje CRUD
  
- **Middleware**
  - Inicjalizacja Supabase client
  - Weryfikacja sesji użytkownika
  - Przekierowania dla chronionych tras
  - Obsługa cookies

**Kryteria akceptacji**:
- Wszystkie główne przepływy biznesowe przetestowane end-to-end
- Testy wykonywane na testowej instancji Supabase
- Automatyczne czyszczenie danych testowych po każdym teście
- Czas wykonania: maksymalnie 2 minuty dla całego zestawu

### 3.3. Testy API (API Tests)
**Cel**: Weryfikacja kontraktów API, walidacji request/response, kodów HTTP.

**Narzędzie**: Vitest + Supertest (lub fetch API)

**Zakres**:
- **Kody odpowiedzi HTTP**
  - 200 OK - sukces operacji
  - 201 Created - utworzenie zasobu
  - 400 Bad Request - błędne dane wejściowe
  - 401 Unauthorized - brak autentykacji
  - 403 Forbidden - brak uprawnień
  - 404 Not Found - zasób nie istnieje
  - 429 Too Many Requests - przekroczenie limitu
  - 500 Internal Server Error - błąd serwera
  
- **Walidacja request body**
  - Brakujące wymagane pola
  - Nieprawidłowe typy danych
  - Limity długości pól
  - Nieprawidłowe formaty (UUID, email)
  
- **Walidacja response body**
  - Struktura zgodna z typami TypeScript
  - Obecność wszystkich wymaganych pól
  - Poprawne typy danych w odpowiedzi
  
- **Obsługa błędów**
  - Spójny format odpowiedzi błędów (ErrorResponse)
  - Informacyjne komunikaty błędów
  - Szczegóły błędów walidacji

**Kryteria akceptacji**:
- Wszystkie endpointy API pokryte testami
- Testy pozytywne (happy path) i negatywne (error cases)
- Dokumentacja API zgodna z implementacją

### 3.4. Testy bezpieczeństwa (Security Tests)
**Cel**: Weryfikacja mechanizmów bezpieczeństwa i ochrony danych.

**Zakres**:
- **Row Level Security (RLS)**
  - Użytkownik A nie może odczytać danych użytkownika B
  - Użytkownik nie może modyfikować cudzych talii
  - Użytkownik nie może usuwać cudzych fiszek
  - Weryfikacja wszystkich policies dla tabel `decks` i `flashcards`
  
- **Autoryzacja endpoint'ów**
  - Dostęp do `/app/*` wymaga zalogowania
  - Dostęp do endpoint'ów API wymaga sesji
  - Przekierowania dla niezalogowanych użytkowników
  
- **Walidacja danych wejściowych**
  - Ochrona przed SQL injection (parametryzowane zapytania)
  - Ochrona przed XSS (sanityzacja HTML)
  - Limity długości pól (DoS prevention)
  - Walidacja formatów UUID
  
- **Zarządzanie sesjami**
  - Timeout sesji
  - Poprawne usuwanie sesji przy wylogowaniu
  - Bezpieczne przechowywanie tokenów (httpOnly cookies)

**Kryteria akceptacji**:
- Wszystkie scenariusze naruszenia bezpieczeństwa zakończone błędem 401/403
- Brak możliwości dostępu do cudzych danych
- Wszystkie dane wejściowe walidowane przed przetworzeniem

### 3.5. Testy komponentów React (Component Tests)
**Cel**: Weryfikacja poprawności renderowania i interakcji komponentów UI.

**Narzędzie**: Vitest + React Testing Library

**Zakres**:
- **Formularze uwierzytelniania**
  - `LoginForm` - walidacja pól, wyświetlanie błędów, submit
  - `RegisterForm` - walidacja pól, walidacja potwierdzenia hasła
  - `ForgotPasswordForm` - walidacja email
  - `ResetPasswordForm` - walidacja nowego hasła
  
- **Komponenty dashboard**
  - `FlashcardGenerator` - licznik znaków, walidacja długości tekstu
  - `DeckSelector` - wybór talii, wyświetlanie listy
  - `UsageLimitIndicator` - wyświetlanie limitu i progress bar
  - `FlashcardList` - renderowanie listy, paginacja
  
- **Komponenty weryfikacji**
  - `VerificationView` - wyświetlanie propozycji fiszek
  - `EditableFlashcardProposal` - edycja propozycji, akceptacja/odrzucenie
  
- **Komponenty UI (shadcn/ui)**
  - Podstawowa weryfikacja renderowania
  - Testy dostępności (aria-labels, role)

**Kryteria akceptacji**:
- Wszystkie główne komponenty pokryte testami
- Testy interakcji użytkownika (click, input, submit)
- Testy dostępności (a11y) dla kluczowych komponentów
- Snapshoty dla komponentów UI (opcjonalnie)

### 3.6. Testy End-to-End (E2E Tests)
**Cel**: Weryfikacja pełnych scenariuszy użycia aplikacji w środowisku zbliżonym do produkcyjnego.

**Narzędzie**: Playwright

**Zakres**:
- **Scenariusze rejestracji i logowania**
  - Rejestracja nowego użytkownika
  - Potwierdzenie email (w środowisku testowym)
  - Logowanie z poprawnymi danymi
  - Logowanie z błędnymi danymi
  - Resetowanie hasła
  
- **Scenariusze zarządzania talią**
  - Tworzenie nowej talii
  - Edycja nazwy i opisu talii
  - Usuwanie talii
  - Nawigacja między taliami
  
- **Scenariusze generowania fiszek**
  - Wprowadzenie tekstu i generowanie fiszek przez AI
  - Edycja wygenerowanych propozycji
  - Akceptacja propozycji i zapis do bazy
  - Odrzucenie propozycji
  - Obsługa przekroczenia limitu dziennego
  
- **Scenariusze nauki**
  - Przeglądanie fiszek w talii
  - Oznaczanie fiszek jako nauczone
  - Filtrowanie fiszek według statusu

**Kryteria akceptacji**:
- Minimum 10 kluczowych scenariuszy end-to-end
- Testy wykonywane na środowisku testowym z pełną integracją
- Automatyczne screenshoty w przypadku błędów
- Czas wykonania: maksymalnie 10 minut

### 3.7. Testy wydajnościowe (Performance Tests)
**Cel**: Weryfikacja czasów odpowiedzi i optymalizacji zapytań.

**Zakres**:
- **Czasy odpowiedzi API**
  - Endpoint generowania fiszek: < 30 sekund (z timeout'em)
  - Endpoint CRUD: < 500ms
  - Endpoint list z paginacją: < 1 sekunda
  
- **Optymalizacja zapytań**
  - Użycie indeksów w zapytaniach
  - Unikanie N+1 queries
  - Efektywne zliczanie przy paginacji
  
- **Renderowanie stron**
  - Time to First Byte (TTFB): < 200ms
  - First Contentful Paint (FCP): < 1.5s
  - Largest Contentful Paint (LCP): < 2.5s

**Kryteria akceptacji**:
- Wszystkie czasy odpowiedzi w określonych limitach
- Brak query N+1 w logach
- Wyniki Lighthouse: Performance > 90

### 3.8. Testy dostępności (Accessibility Tests)
**Cel**: Weryfikacja zgodności z WCAG 2.1 Level AA.

**Narzędzie**: axe-core, Playwright Accessibility Testing

**Zakres**:
- **Struktura HTML**
  - Poprawne użycie znaczników semantycznych
  - Hierarchia nagłówków (h1-h6)
  - Znaczniki landmark (main, nav, footer)
  
- **Formularze**
  - Etykiety powiązane z inputami
  - Komunikaty błędów dostępne dla screen readers
  - Focus management przy walidacji
  
- **Interaktywne elementy**
  - Nawigacja klawiaturą (Tab, Enter, Escape)
  - Focus visible na elementach
  - ARIA attributes (aria-label, aria-describedby)
  
- **Kontrast kolorów**
  - Współczynnik kontrastu minimum 4.5:1 dla tekstu
  - Współczynnik kontrastu minimum 3:1 dla elementów UI

**Kryteria akceptacji**:
- Brak błędów krytycznych w axe-core
- Wszystkie formularze dostępne przez klawiaturę
- Komponenty przetestowane ze screen readerem (NVDA/JAWS)

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1. Generowanie fiszek przez AI

#### TC-AI-001: Generowanie fiszek z poprawnego tekstu
**Priorytet**: Krytyczny  
**Warunki wstępne**: Użytkownik zalogowany, ma dostępne limity AI, wybrał talię  
**Kroki**:
1. Przejdź do widoku generowania fiszek
2. Wybierz talię z listy
3. Wprowadź tekst o długości 200 znaków
4. Kliknij przycisk "Generuj fiszki"
5. Poczekaj na odpowiedź AI (max 30s)

**Oczekiwany rezultat**:
- Wyświetlona lista 2-5 propozycji fiszek
- Każda propozycja ma wypełnione `front_content` i `back_content`
- Wyświetlony komunikat o liczbie wygenerowanych fiszek
- Zaktualizowany licznik dziennych limitów

#### TC-AI-002: Generowanie fiszek z tekstu za krótkim
**Priorytet**: Wysoki  
**Warunki wstępne**: Użytkownik zalogowany  
**Kroki**:
1. Przejdź do widoku generowania fiszek
2. Wprowadź tekst o długości 30 znaków
3. Kliknij przycisk "Generuj fiszki"

**Oczekiwany rezultat**:
- Wyświetlony błąd walidacji: "Tekst musi mieć co najmniej 50 znaków"
- Request nie został wysłany do API
- Licznik znaków pokazuje 30/50

#### TC-AI-003: Przekroczenie dziennego limitu
**Priorytet**: Krytyczny  
**Warunki wstępne**: Użytkownik zalogowany, wykorzystał już 100/100 dziennych generacji  
**Kroki**:
1. Przejdź do widoku generowania fiszek
2. Wprowadź poprawny tekst
3. Kliknij przycisk "Generuj fiszki"

**Oczekiwany rezultat**:
- Wyświetlony błąd: "Osiągnięto dzienny limit generowania (100/100)"
- Informacja o czasie resetu limitu: "Limit odnowi się o północy UTC"
- Request nie został przetworzony przez AI

#### TC-AI-004: Timeout generowania fiszek
**Priorytet**: Wysoki  
**Warunki wstępne**: Użytkownik zalogowany, OpenAI API symuluje wolną odpowiedź  
**Kroki**:
1. Przejdź do widoku generowania fiszek
2. Wprowadź długi tekst (5000 znaków)
3. Kliknij przycisk "Generuj fiszki"
4. Poczekaj 30 sekund

**Oczekiwany rezultat**:
- Po 30 sekundach wyświetlony błąd: "Przekroczono czas generowania"
- Użytkownik może spróbować ponownie
- Limit nie został zmniejszony (generacja się nie powiodła)

#### TC-AI-005: Błąd API OpenAI
**Priorytet**: Wysoki  
**Warunki wstępne**: Użytkownik zalogowany, OpenAI API zwraca błąd 500  
**Kroki**:
1. Przejdź do widoku generowania fiszek
2. Wprowadź poprawny tekst
3. Kliknij przycisk "Generuj fiszki"

**Oczekiwany rezultat**:
- Wyświetlony błąd: "Nie udało się wygenerować fiszek. Spróbuj ponownie."
- Szczegóły błędu zalogowane w konsoli serwera
- Użytkownik może spróbować ponownie

### 4.2. Zarządzanie talią fiszek

#### TC-DECK-001: Tworzenie nowej talii
**Priorytet**: Krytyczny  
**Warunki wstępne**: Użytkownik zalogowany  
**Kroki**:
1. Przejdź do listy talii
2. Kliknij przycisk "Nowa talia"
3. Wprowadź nazwę: "Historia Polski"
4. Wprowadź opis: "Najważniejsze daty i wydarzenia"
5. Kliknij "Zapisz"

**Oczekiwany rezultat**:
- Talia została utworzona w bazie danych
- Talia widoczna na liście talii
- Komunikat sukcesu: "Talia została utworzona"
- `user_id` talii to ID zalogowanego użytkownika

#### TC-DECK-002: Tworzenie talii bez nazwy
**Priorytet**: Średni  
**Warunki wstępne**: Użytkownik zalogowany  
**Kroki**:
1. Przejdź do listy talii
2. Kliknij przycisk "Nowa talia"
3. Pozostaw pole nazwy puste
4. Kliknij "Zapisz"

**Oczekiwany rezultat**:
- Wyświetlony błąd walidacji: "Nazwa jest wymagana"
- Talia nie została utworzona
- Użytkownik pozostaje w formularzu

#### TC-DECK-003: Usuwanie talii z fiszkami
**Priorytet**: Wysoki  
**Warunki wstępne**: Użytkownik zalogowany, ma talię z 5 fiszkami  
**Kroki**:
1. Przejdź do listy talii
2. Wybierz talię do usunięcia
3. Kliknij przycisk "Usuń"
4. Potwierdź usunięcie w dialogu

**Oczekiwany rezultat**:
- Wyświetlone ostrzeżenie: "Talia zawiera 5 fiszek. Czy na pewno chcesz ją usunąć?"
- Po potwierdzeniu talia i wszystkie fiszki usunięte (CASCADE)
- Komunikat sukcesu: "Talia została usunięta"

#### TC-DECK-004: Próba dostępu do cudzej talii
**Priorytet**: Krytyczny (bezpieczeństwo)  
**Warunki wstępne**: Użytkownik A zalogowany, istnieje talia należąca do użytkownika B  
**Kroki**:
1. Użytkownik A próbuje otworzyć talię użytkownika B (np. przez URL)
2. Wykonuje request GET /api/decks/{deck_id_uzytkownika_B}

**Oczekiwany rezultat**:
- Zwrócony błąd 404 Not Found
- Komunikat: "Deck not found or access denied"
- RLS policy zablokowała dostęp do cudzych danych

### 4.3. Batch tworzenie fiszek

#### TC-BATCH-001: Zapis zaakceptowanych propozycji AI
**Priorytet**: Krytyczny  
**Warunki wstępne**: Użytkownik zalogowany, wygenerował 5 propozycji fiszek  
**Kroki**:
1. Na ekranie weryfikacji propozycji zaznacz 3 propozycje do akceptacji
2. Edytuj jedną z propozycji (zmień `back_content`)
3. Kliknij "Zapisz zaakceptowane fiszki"

**Oczekiwany rezultat**:
- 3 fiszki zostały utworzone w bazie danych
- Fiszki mają `ai_generated=true` i `ai_accepted=true`
- Edytowana fiszka ma zmodyfikowaną treść
- Zwiększony licznik `total_generated_today` o 3
- Przekierowanie do widoku talii

#### TC-BATCH-002: Próba zapisu 101 fiszek naraz
**Priorytet**: Średni  
**Warunki wstępne**: Użytkownik zalogowany  
**Kroki**:
1. Wykonaj request POST /api/flashcards/batch z 101 fiszkami w `flashcards` array

**Oczekiwany rezultat**:
- Zwrócony błąd 400 Bad Request
- Komunikat walidacji: "Cannot create more than 100 flashcards at once"
- Żadna fiszka nie została utworzona

#### TC-BATCH-003: Batch z pustym content
**Priorytet**: Średni  
**Warunki wstępne**: Użytkownik zalogowany  
**Kroki**:
1. Wykonaj request POST /api/flashcards/batch
2. Jedna z fiszek ma pusty `front_content`

**Oczekiwany rezultat**:
- Zwrócony błąd 400 Bad Request
- Komunikat walidacji: "Front content is required"
- Żadna fiszka nie została utworzona (transakcja atomowa)

### 4.4. Bezpieczeństwo - Row Level Security

#### TC-RLS-001: Użytkownik nie widzi cudzych talii
**Priorytet**: Krytyczny  
**Warunki wstępne**: Użytkownik A i B zalogowani, każdy ma po 3 talie  
**Kroki**:
1. Zaloguj się jako użytkownik A
2. Wykonaj request GET /api/decks

**Oczekiwany rezultat**:
- Zwrócone tylko 3 talie należące do użytkownika A
- Talie użytkownika B niewidoczne w odpowiedzi
- RLS policy `decks_select` blokuje dostęp do cudzych danych

#### TC-RLS-002: Użytkownik nie może modyfikować cudzych fiszek
**Priorytet**: Krytyczny  
**Warunki wstępne**: Użytkownik A zalogowany, istnieje fiszka należąca do użytkownika B  
**Kroki**:
1. Zaloguj się jako użytkownik A
2. Wykonaj request PATCH /api/flashcards/{flashcard_id_uzytkownika_B}
3. Próba zmiany `front_content`

**Oczekiwany rezultat**:
- Zwrócony błąd 404 Not Found (nie 403, aby nie ujawniać istnienia zasobu)
- Fiszka nie została zmodyfikowana
- RLS policy `flashcards_update` zablokowała operację

#### TC-RLS-003: Użytkownik nie może usunąć cudzych talii
**Priorytet**: Krytyczny  
**Warunki wstępne**: Użytkownik A zalogowany, istnieje talia należąca do użytkownika B  
**Kroki**:
1. Zaloguj się jako użytkownik A
2. Wykonaj request DELETE /api/decks/{deck_id_uzytkownika_B}

**Oczekiwany rezultat**:
- Zwrócony błąd 404 Not Found
- Talia nie została usunięta
- RLS policy `decks_delete` zablokowała operację

### 4.5. Walidacja danych wejściowych

#### TC-VAL-001: Walidacja UUID deck_id
**Priorytet**: Średni  
**Warunki wstępne**: Użytkownik zalogowany  
**Kroki**:
1. Wykonaj request POST /api/flashcards/generate
2. W body podaj `deck_id: "invalid-uuid"`

**Oczekiwany rezultat**:
- Zwrócony błąd 400 Bad Request
- Komunikat: "Invalid deck ID format"
- Zod schema wykrył nieprawidłowy format

#### TC-VAL-002: Walidacja długości front_content
**Priorytet**: Średni  
**Warunki wstępne**: Użytkownik zalogowany  
**Kroki**:
1. Wykonaj request POST /api/flashcards
2. W body podaj `front_content` dłuższy niż 1000 znaków

**Oczekiwany rezultat**:
- Zwrócony błąd 400 Bad Request
- Komunikat: "Front content must not exceed 1000 characters"
- Fiszka nie została utworzona

#### TC-VAL-003: Walidacja rating w review
**Priorytet**: Średni  
**Warunki wstępne**: Użytkownik zalogowany, ma fiszkę do przejrzenia  
**Kroki**:
1. Wykonaj request POST /api/flashcards/{id}/review
2. W body podaj `rating: "invalid"`

**Oczekiwany rezultat**:
- Zwrócony błąd 400 Bad Request
- Komunikat: "Rating must be one of: again, hard, good, easy"
- Review nie został zapisany

## 5. Środowisko testowe

### 5.1. Środowisko deweloperskie (Development)
**Cel**: Testy lokalne podczas rozwoju  
**Konfiguracja**:
- Lokalny serwer Astro (localhost:4321)
- Lokalna instancja Supabase (Supabase CLI)
- Mockowane API OpenAI (bez faktycznych kosztów)
- Dane testowe generowane automatycznie

**Użycie**:
- Testy jednostkowe i integracyjne
- Szybka iteracja i debugging
- Izolacja od innych środowisk

### 5.2. Środowisko testowe (Testing)
**Cel**: Automatyczne testy CI/CD  
**Konfiguracja**:
- Dedykowany projekt Supabase (test environment)
- Mockowane API OpenAI lub test account z limitami
- GitHub Actions runner
- PostgreSQL z pełnym resetem przed każdym testem

**Użycie**:
- Testy integracyjne i E2E w CI/CD
- Weryfikacja Pull Requestów
- Automatyczne sprawdzanie przed merge

### 5.3. Środowisko staging (Staging)
**Cel**: Testy przed wdrożeniem produkcyjnym  
**Konfiguracja**:
- Klon konfiguracji produkcyjnej
- Dedykowana instancja Supabase
- Prawdziwe API OpenAI (konto testowe z limitami)
- Deployment na DigitalOcean / Vercel

**Użycie**:
- Testy manualne przez QA
- Testy akceptacyjne
- Weryfikacja integracji z prawdziwymi API

### 5.4. Dane testowe
**Źródła danych**:
- Fixtures - statyczne dane w plikach JSON/TS
- Seedy - skrypty inicjujące bazę danych testowych użytkowników i talii
- Factories - generatory losowych danych testowych (faker.js)
- Mocks - symulacja odpowiedzi API zewnętrznych

**Dane testowe**:
- 3 użytkowników testowych (A, B, C) z różnymi rolami
- 10 przykładowych talii z różną liczbą fiszek
- 50 przykładowych fiszek o różnych statusach
- Przykładowe teksty do generowania fiszek (różne długości)

## 6. Narzędzia do testowania

### 6.1. Framework testowy
**Vitest** - Szybki framework testowy dla projektów Vite/Astro
- Wsparcie dla TypeScript out-of-the-box
- Kompatybilność z Jest API
- Szybkie wykonywanie testów
- Hot Module Replacement dla testów

**Konfiguracja**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'test/']
    }
  }
});
```

### 6.2. Testy komponentów React
**React Testing Library** - Testowanie komponentów zgodnie z najlepszymi praktykami
- Testowanie z perspektywy użytkownika
- Query'sy semantyczne (getByRole, getByLabelText)
- Wsparcie dla accessibility testing

**Dodatki**:
- `@testing-library/user-event` - symulacja interakcji użytkownika
- `@testing-library/jest-dom` - custom matchers dla DOM

### 6.3. Testy E2E
**Playwright** - Nowoczesny framework do testów end-to-end
- Wsparcie dla wielu przeglądarek (Chromium, Firefox, WebKit)
- Auto-waiting - czekanie na elementy bez sleep()
- Screenshoty i nagrania wideo błędów
- Parallel execution

**Konfiguracja**:
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:4321',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } }
  ]
});
```

### 6.4. Mockowanie
**vitest/mock** - Mockowanie modułów i funkcji
- Mockowanie Supabase client
- Mockowanie OpenAI API
- Spy functions do weryfikacji wywołań

**MSW (Mock Service Worker)** - Mockowanie HTTP requests
- Przechwytywanie i mockowanie fetch/axios
- Definicja handlers dla endpoint'ów
- Wsparcie dla testów integracyjnych

### 6.5. Code Coverage
**V8 Coverage** - Natywny provider coverage dla Vitest
- Raportowanie pokrycia kodu
- HTML reports dla wizualizacji
- Integracja z CI/CD

**Minimum thresholds**:
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

### 6.6. Linting i formatowanie
**ESLint** - Statyczna analiza kodu
- Wykrywanie błędów przed testami
- Egzekwowanie standardów kodowania
- Sprawdzanie accessibility (eslint-plugin-jsx-a11y)

**TypeScript Compiler** - Sprawdzanie typów
- Weryfikacja poprawności typów przed testami
- Wykrywanie błędów typowania w czasie kompilacji

### 6.7. Narzędzia CI/CD
**GitHub Actions** - Automatyzacja testów
- Uruchamianie testów przy każdym push
- Weryfikacja Pull Requestów
- Deployment do staging po przejściu testów

**Przykładowy workflow**:
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
```

### 6.8. Monitoring i reporting
**Allure** (opcjonalnie) - Zaawansowane raportowanie testów
- Wizualne raporty testów
- Historia wykonań
- Kategoryzacja błędów

## 7. Harmonogram testów

### 7.1. Faza 1: Setup środowiska i infrastruktury (Tydzień 1)
**Czas trwania**: 5 dni roboczych  
**Odpowiedzialny**: Tech Lead + QA Engineer

**Zadania**:
- [ ] Instalacja i konfiguracja Vitest
- [ ] Instalacja React Testing Library
- [ ] Instalacja i konfiguracja Playwright
- [ ] Setup środowiska testowego Supabase
- [ ] Konfiguracja mocków dla OpenAI API
- [ ] Utworzenie fixtures i seed data
- [ ] Konfiguracja GitHub Actions workflow
- [ ] Setup code coverage reporting

**Kryteria ukończenia**:
- Przykładowy test jednostkowy przechodzi
- Przykładowy test E2E przechodzi
- CI/CD pipeline uruchamia testy automatycznie

### 7.2. Faza 2: Testy jednostkowe (Tydzień 2-3)
**Czas trwania**: 10 dni roboczych  
**Odpowiedzialny**: Developers + QA Engineer

**Zadania**:
- [ ] Testy validatorów (Zod schemas) - 2 dni
- [ ] Testy AIService - 3 dni
- [ ] Testy UsageService - 2 dni
- [ ] Testy DeckService i FlashcardService - 2 dni
- [ ] Testy utility functions - 1 dzień
- [ ] Code review testów jednostkowych - 1 dzień

**Metryki sukcesu**:
- Minimum 100 testów jednostkowych
- Code coverage > 80%
- Wszystkie testy przechodzą (green)

### 7.3. Faza 3: Testy integracyjne i API (Tydzień 4-5)
**Czas trwania**: 10 dni roboczych  
**Odpowiedzialny**: QA Engineer + Backend Developer

**Zadania**:
- [ ] Testy API endpoints (CRUD) - 3 dni
- [ ] Testy endpoint'ów generowania AI - 2 dni
- [ ] Testy batch operations - 2 dni
- [ ] Testy middleware i sesji - 2 dni
- [ ] Testy integracji z Supabase - 2 dni
- [ ] Code review testów integracyjnych - 1 dzień

**Metryki sukcesu**:
- Minimum 50 testów integracyjnych
- Wszystkie endpointy API pokryte testami
- Wszystkie testy przechodzą

### 7.4. Faza 4: Testy bezpieczeństwa (Tydzień 6)
**Czas trwania**: 5 dni roboczych  
**Odpowiedzialny**: Security Engineer + QA Engineer

**Zadania**:
- [ ] Testy RLS policies - 2 dni
- [ ] Testy autoryzacji endpoint'ów - 1 dzień
- [ ] Testy walidacji danych wejściowych - 1 dzień
- [ ] Testy zarządzania sesjami - 1 dzień
- [ ] Security audit i dokumentacja - 1 dzień

**Metryki sukcesu**:
- Wszystkie scenariusze bezpieczeństwa pokryte
- Brak krytycznych luk bezpieczeństwa
- Dokumentacja zagrożeń i mitygacji

### 7.5. Faza 5: Testy komponentów React (Tydzień 7)
**Czas trwania**: 5 dni roboczych  
**Odpowiedzialny**: Frontend Developer + QA Engineer

**Zadania**:
- [ ] Testy formularzy auth - 2 dni
- [ ] Testy komponentów dashboard - 2 dni
- [ ] Testy komponentów weryfikacji - 1 dzień
- [ ] Testy accessibility - 1 dzień
- [ ] Code review testów komponentów - 1 dzień

**Metryki sukcesu**:
- Wszystkie główne komponenty pokryte testami
- Brak błędów accessibility w axe-core
- Minimum 40 testów komponentów

### 7.6. Faza 6: Testy E2E (Tydzień 8)
**Czas trwania**: 5 dni roboczych  
**Odpowiedzialny**: QA Engineer

**Zadania**:
- [ ] Scenariusze rejestracji i logowania - 1 dzień
- [ ] Scenariusze zarządzania talią - 1 dzień
- [ ] Scenariusze generowania fiszek - 2 dni
- [ ] Scenariusze nauki i review - 1 dzień
- [ ] Stabilizacja testów i retry logic - 1 dzień

**Metryki sukcesu**:
- Minimum 15 scenariuszy E2E
- Testy stabilne (< 5% flakiness)
- Wykonanie pełnego zestawu < 10 minut

### 7.7. Faza 7: Testy wydajnościowe i dostępności (Tydzień 9)
**Czas trwania**: 5 dni roboczych  
**Odpowiedzialny**: Performance Engineer + QA Engineer

**Zadania**:
- [ ] Testy czasów odpowiedzi API - 2 dni
- [ ] Optymalizacja zapytań do bazy - 1 dzień
- [ ] Testy Lighthouse - 1 dzień
- [ ] Testy dostępności (a11y) - 1 dzień
- [ ] Dokumentacja wyników - 1 dzień

**Metryki sukcesu**:
- Wszystkie czasy odpowiedzi w limitach
- Lighthouse Performance > 90
- WCAG 2.1 Level AA compliance

### 7.8. Faza 8: Testy regresyjne i finalizacja (Tydzień 10)
**Czas trwania**: 5 dni roboczych  
**Odpowiedzialny**: Cały zespół

**Zadania**:
- [ ] Pełny regres wszystkich funkcjonalności - 2 dni
- [ ] Testy akceptacyjne na staging - 2 dni
- [ ] Finalizacja dokumentacji - 1 dzień
- [ ] Prezentacja wyników stakeholderom - 1 dzień

**Metryki sukcesu**:
- Wszystkie testy przechodzą
- Brak krytycznych i wysokich defektów
- Dokumentacja kompletna

### 7.9. Harmonogram utrzymaniowy (po MVP)
**Częstotliwość**: Ciągłe

**Działania**:
- **Dziennie**: Automatyczne uruchamianie testów w CI/CD
- **Przed każdym release**: Pełny regres E2E na staging
- **Co tydzień**: Code review nowych testów
- **Co miesiąc**: Przegląd pokrycia kodu i aktualizacja testów
- **Co kwartał**: Audyt bezpieczeństwa i testy penetracyjne

## 8. Kryteria akceptacji testów

### 8.1. Kryteria wejścia (Entry Criteria)
Warunki, które muszą być spełnione przed rozpoczęciem testów:

- [ ] Środowisko testowe jest skonfigurowane i dostępne
- [ ] Kod aplikacji przeszedł code review
- [ ] Brak krytycznych błędów w linterze (ESLint)
- [ ] TypeScript kompiluje się bez błędów
- [ ] Dane testowe są przygotowane (fixtures, seedy)
- [ ] Dokumentacja API jest aktualna
- [ ] Mockowanie API zewnętrznych jest skonfigurowane

### 8.2. Kryteria wyjścia (Exit Criteria)
Warunki, które muszą być spełnione przed zamknięciem fazy testowej:

- [ ] Wszystkie zaplanowane testy zostały wykonane
- [ ] **Code coverage minimum 80%** dla serwisów i validatorów
- [ ] **Brak defektów krytycznych** (blocker)
- [ ] **Maksymalnie 5 defektów wysokiego priorytetu**, z planem naprawy
- [ ] Wszystkie testy bezpieczeństwa przeszły pomyślnie
- [ ] Testy E2E są stabilne (< 5% flakiness)
- [ ] Testy wydajnościowe w określonych limitach
- [ ] Dokumentacja testów jest kompletna
- [ ] Raport testów został zaakceptowany przez Product Ownera

### 8.3. Kryteria akceptacji funkcjonalności

#### Generowanie fiszek przez AI
- [ ] Generowanie działa dla tekstu 50-5000 znaków
- [ ] Zwracane są 2-5 propozycji fiszek
- [ ] Limit dzienny (100) jest respektowany
- [ ] Timeout po 30 sekundach działa poprawnie
- [ ] Błędy API są obsługiwane i raportowane użytkownikowi
- [ ] Licznik limitów jest aktualizowany w czasie rzeczywistym

#### Zarządzanie talią
- [ ] Użytkownik może utworzyć, edytować, usunąć talię
- [ ] Walidacja nazwy (niepusta) działa
- [ ] Usunięcie talii usuwa wszystkie fiszki (CASCADE)
- [ ] Lista talii wspiera paginację i sortowanie
- [ ] Użytkownik widzi tylko swoje talie (RLS)

#### Zarządzanie fiszkami
- [ ] Użytkownik może utworzyć fiszkę ręcznie
- [ ] Batch tworzenie fiszek (do 100 naraz) działa
- [ ] Filtrowanie według statusu i typu (ai_generated) działa
- [ ] Edycja i usuwanie fiszek działa poprawnie
- [ ] Użytkownik widzi tylko swoje fiszki (RLS)

#### Bezpieczeństwo
- [ ] Wszystkie RLS policies działają prawidłowo
- [ ] Brak możliwości dostępu do cudzych danych
- [ ] Walidacja wszystkich danych wejściowych
- [ ] Sesje są bezpiecznie zarządzane
- [ ] Przekierowania dla chronionych tras działają

### 8.4. Definicja priorytetów defektów

**Krytyczny (Blocker)**:
- Aplikacja się nie uruchamia
- Utrata danych użytkownika
- Naruszenie bezpieczeństwa (dostęp do cudzych danych)
- Brak możliwości logowania/rejestracji

**Wysoki (High)**:
- Główna funkcjonalność nie działa (generowanie AI, tworzenie talii)
- Przekroczenie limitu nie jest blokowane
- Błąd powoduje utratę niezapisanych danych
- Istotny problem z wydajnością (> 2x oczekiwany czas)

**Średni (Medium)**:
- Nieprawidłowe komunikaty błędów
- Drobne problemy z UI/UX
- Brak walidacji dla mniej krytycznych pól
- Problemy z responsywnością na niektórych urządzeniach

**Niski (Low)**:
- Literówki w tekstach
- Drobne problemy z wyglądem
- Brakująca lub niepełna dokumentacja
- Sugestie ulepszeń

### 8.5. Metryki jakości

**Code Coverage**:
- Target: 80% dla serwisów
- Minimum: 70% globalnie
- 100% dla krytycznych ścieżek (bezpieczeństwo, limity AI)

**Test Success Rate**:
- Target: 100% testów przechodzi
- Maksymalny flakiness: 5% dla testów E2E

**Defect Density**:
- Target: < 1 defekt krytyczny/wysoki na 1000 linii kodu
- Monitoring: raportowanie tygodniowe

**Performance Metrics**:
- API Response Time: < 500ms (CRUD), < 30s (AI generation)
- Page Load Time: < 2s (FCP), < 2.5s (LCP)
- Lighthouse Score: > 90 (Performance)

## 9. Role i odpowiedzialności w procesie testowania

### 9.1. Tech Lead
**Odpowiedzialności**:
- Nadzór nad całością procesu testowego
- Decyzje architektoniczne dotyczące testów
- Przegląd i akceptacja strategii testowania
- Alokacja zasobów i rozwiązywanie konfliktów
- Komunikacja z management'em o statusie testów

**Zaangażowanie**: 10% czasu (advisory, reviews)

### 9.2. QA Engineer
**Odpowiedzialności**:
- Opracowanie i utrzymanie planu testów
- Implementacja testów integracyjnych i E2E
- Wykonywanie testów manualnych (exploratory)
- Zarządzanie środowiskiem testowym
- Raportowanie defektów i tracking
- Tworzenie raportów z testów
- Koordynacja działań testowych w zespole

**Zaangażowanie**: 100% czasu

### 9.3. Backend Developer
**Odpowiedzialności**:
- Implementacja testów jednostkowych dla serwisów
- Implementacja testów integracyjnych dla API
- Wsparcie w setupie mocków dla Supabase i OpenAI
- Naprawa defektów backendowych
- Code review testów backendowych
- Optymalizacja wydajności zapytań

**Zaangażowanie**: 30% czasu (w fazie testowej)

### 9.4. Frontend Developer
**Odpowiedzialności**:
- Implementacja testów komponentów React
- Implementacja testów accessibility
- Naprawa defektów frontendowych
- Code review testów frontendowych
- Optymalizacja wydajności renderowania

**Zaangażowanie**: 30% czasu (w fazie testowej)

### 9.5. Security Engineer (konsultant)
**Odpowiedzialności**:
- Przegląd i weryfikacja testów bezpieczeństwa
- Audyt RLS policies
- Testy penetracyjne (opcjonalnie)
- Rekomendacje dotyczące bezpieczeństwa
- Dokumentacja zagrożeń i mitygacji

**Zaangażowanie**: 10% czasu (konsultacje, audyt)

### 9.6. Product Owner
**Odpowiedzialności**:
- Definicja kryteriów akceptacji funkcjonalności
- Priorytetyzacja defektów
- Akceptacja wyników testów
- Decyzje go/no-go dla release
- Komunikacja z biznesem

**Zaangażowanie**: 5% czasu (reviews, akceptacje)

### 9.7. DevOps Engineer
**Odpowiedzialności**:
- Konfiguracja CI/CD pipeline dla testów
- Setup środowisk testowych (staging)
- Monitoring wykonania testów w CI/CD
- Deployment aplikacji do środowisk testowych
- Automatyzacja procesów testowych

**Zaangażowanie**: 15% czasu (setup, utrzymanie)

### 9.8. Macierz RACI

| Zadanie | Tech Lead | QA | Backend | Frontend | Security | PO | DevOps |
|---------|-----------|----|---------|-----------|-----------|----|--------|
| Plan testów | A | R | C | C | C | I | I |
| Testy jednostkowe | C | C | R | R | I | I | I |
| Testy integracyjne | C | R | R | I | I | I | C |
| Testy E2E | C | R | I | I | I | I | C |
| Testy bezpieczeństwa | A | R | C | C | R | I | I |
| Setup środowiska | C | C | I | I | I | I | R |
| Raportowanie błędów | I | R | I | I | I | C | I |
| Naprawa defektów | A | I | R | R | C | C | I |
| Akceptacja testów | A | C | I | I | I | R | I |

**Legenda**: R = Responsible (wykonuje), A = Accountable (odpowiedzialny), C = Consulted (konsultowany), I = Informed (informowany)

## 10. Procedury raportowania błędów

### 10.1. Narzędzie do trackingu
**GitHub Issues** - wykorzystanie wbudowanego systemu zgłoszeń

**Konfiguracja**:
- Labels: `bug`, `critical`, `high`, `medium`, `low`, `security`, `performance`
- Milestones: Wersje release'owe (MVP, v1.1, v1.2)
- Projects: Kanban board dla zarządzania defektami
- Templates: Szablon zgłoszenia błędu

### 10.2. Szablon zgłoszenia błędu

```markdown
## Tytuł błędu
[Krótki, opisowy tytuł problemu]

## Priorytet
- [ ] Krytyczny (Blocker)
- [ ] Wysoki (High)
- [ ] Średni (Medium)
- [ ] Niski (Low)

## Środowisko
- **Wersja aplikacji**: v1.0.0
- **Środowisko**: Development / Staging / Production
- **Przeglądarka**: Chrome 120 / Firefox 121 / Safari 17
- **System operacyjny**: Windows 11 / macOS 14 / Ubuntu 22.04
- **Użytkownik testowy**: test-user-a@example.com

## Opis problemu
[Jasny i zwięzły opis tego, co nie działa]

## Kroki reprodukcji
1. Przejdź do strony logowania
2. Wprowadź dane: email@example.com / password123
3. Kliknij przycisk "Zaloguj"
4. Obserwuj błąd...

## Oczekiwane zachowanie
[Co powinno się stać według specyfikacji]

## Faktyczne zachowanie
[Co faktycznie się dzieje]

## Screenshoty / Logi
[Załącz screenshoty interfejsu, logi konsoli, logi serwera]

## Dodatkowy kontekst
- Czy błąd jest powtarzalny: Zawsze / Czasami / Raz
- Ostatnia działająca wersja: v0.9.0
- Powiązane issues: #123, #456
- Request ID: abc-123-def-456 (dla błędów API)

## Testy
- [ ] Test jednostkowy dodany
- [ ] Test integracyjny dodany
- [ ] Test E2E dodany
- [ ] Regresja przetestowana
```

### 10.3. Workflow obsługi błędów

#### Krok 1: Zgłoszenie (Reporting)
**Odpowiedzialny**: QA Engineer, Developer, User

**Akcje**:
1. Utworzenie issue w GitHub Issues według szablonu
2. Przypisanie odpowiednich labels (priorytet, typ)
3. Przypisanie do milestonu (wersji)
4. Powiadomienie zespołu (Slack/Discord)

**SLA**:
- Krytyczne: natychmiastowe zgłoszenie + eskalacja
- Wysokie: w ciągu 2 godzin od wykrycia
- Średnie/Niskie: w ciągu 24 godzin

#### Krok 2: Triażowanie (Triage)
**Odpowiedzialny**: Tech Lead + QA Engineer

**Akcje**:
1. Weryfikacja priorytetu
2. Przypisanie do odpowiedzialnego developera
3. Ocena wpływu na użytkowników
4. Decyzja go/no-go dla release (jeśli krytyczne)

**SLA**:
- Krytyczne: w ciągu 1 godziny
- Wysokie: w ciągu 4 godzin
- Średnie: w ciągu 24 godzin
- Niskie: w ciągu 48 godzin

#### Krok 3: Analiza (Investigation)
**Odpowiedzialny**: Przypisany Developer

**Akcje**:
1. Reprodukcja błędu w środowisku deweloperskim
2. Analiza root cause (logs, debugging)
3. Oszacowanie czasu naprawy
4. Aktualizacja issue z wynikami analizy

**SLA**:
- Krytyczne: w ciągu 2 godzin
- Wysokie: w ciągu 8 godzin
- Średnie: w ciągu 48 godzin

#### Krok 4: Naprawa (Fix)
**Odpowiedzialny**: Przypisany Developer

**Akcje**:
1. Implementacja poprawki
2. Dodanie testu regresyjnego (unit/integration/E2E)
3. Code review
4. Merge do branch'a deweloperskiego
5. Aktualizacja issue ze statusem "Fixed"

**SLA**:
- Krytyczne: w ciągu 4 godzin (hotfix)
- Wysokie: w ciągu 24 godzin
- Średnie: w ciągu 72 godzin
- Niskie: w kolejnym sprincie

#### Krok 5: Weryfikacja (Verification)
**Odpowiedzialny**: QA Engineer

**Akcje**:
1. Weryfikacja poprawki w środowisku testowym/staging
2. Wykonanie testu regresyjnego
3. Sprawdzenie czy nie wprowadzono nowych bugów
4. Aktualizacja issue ze statusem "Verified" lub "Reopened"

**SLA**:
- Krytyczne: w ciągu 1 godziny od deploy
- Wysokie: w ciągu 4 godzin
- Średnie: w ciągu 24 godzin

#### Krok 6: Zamknięcie (Closure)
**Odpowiedzialny**: QA Engineer / Tech Lead

**Akcje**:
1. Zamknięcie issue
2. Dodanie informacji o wersji, w której naprawiono
3. Aktualizacja dokumentacji (jeśli potrzebne)
4. Komunikacja do użytkowników (jeśli publiczny bug)

### 10.4. Eskalacja krytycznych błędów

**Kryteria eskalacji**:
- Błąd krytyczny (blocker) wykryty na produkcji
- Naruszenie bezpieczeństwa danych
- Utrata danych użytkowników
- Całkowita niedostępność aplikacji

**Procedura**:
1. **Natychmiastowe powiadomienie**: Slack/Discord @ Tech Lead, @ PO
2. **Emergency meeting**: Zebranie zespołu w ciągu 30 minut
3. **Decyzja**: Hotfix vs Rollback vs Maintenance mode
4. **Komunikacja**: Informacja dla użytkowników o problemie
5. **Postmortem**: Analiza przyczyn i działania zapobiegawcze (w ciągu 24h)

### 10.5. Raportowanie okresowe

#### Dzienny Raport Testowy (Daily Test Report)
**Odbiorcy**: Tech Lead, Zespół deweloperski  
**Częstotliwość**: Codziennie (w godzinach pracy)

**Zawartość**:
- Status wykonania testów (% completion)
- Liczba testów: passed / failed / skipped
- Nowe defekty (liczba i priorytety)
- Defekty naprawione i zweryfikowane
- Blokery i ryzyka

#### Tygodniowy Raport QA (Weekly QA Report)
**Odbiorcy**: Tech Lead, Product Owner, Management  
**Częstotliwość**: Piątek EOD

**Zawartość**:
- Podsumowanie tygodnia testowego
- Statystyki testów (total, pass rate, coverage)
- Lista defektów otwartych (breakdown by priority)
- Defekty naprawione w tygodniu
- Plan na kolejny tydzień
- Ryzyka i rekomendacje

#### Raport Przed Release (Pre-Release Test Report)
**Odbiorcy**: Tech Lead, Product Owner, Management  
**Timing**: 2 dni przed planowanym release

**Zawartość**:
- Status wszystkich typów testów
- Code coverage metrics
- Lista wszystkich defektów (otwartych i naprawionych)
- Go/No-Go rekomendacja
- Ryzyka związane z release
- Plan rollback (jeśli potrzebny)
- Checklist akceptacji release

### 10.6. Metryki i KPI

**Monitorowane metryki**:
- **Defect Discovery Rate**: Liczba nowych defektów dziennie/tygodniowo
- **Defect Resolution Time**: Średni czas od zgłoszenia do naprawy (per priority)
- **Test Pass Rate**: % testów przechodzących
- **Code Coverage**: % pokrycia kodu testami
- **Flakiness Rate**: % testów niestabilnych (E2E)
- **Critical Defects in Production**: Liczba krytycznych błędów na produkcji

**Target KPI**:
- Test Pass Rate: > 95%
- Code Coverage: > 80%
- Flakiness Rate: < 5%
- Critical Defects in Production: 0 per release
- Defect Resolution Time (Critical): < 4h
- Defect Resolution Time (High): < 24h

---

## Załączniki

### A. Checklist przed rozpoczęciem testów
- [ ] Środowisko testowe skonfigurowane
- [ ] Dane testowe przygotowane
- [ ] Mockowanie API zewnętrznych działa
- [ ] CI/CD pipeline skonfigurowany
- [ ] Zespół zapoznany z planem testów
- [ ] Narzędzia zainstalowane i działające

### B. Checklist przed release
- [ ] Wszystkie testy jednostkowe przechodzą (100%)
- [ ] Wszystkie testy integracyjne przechodzą (100%)
- [ ] Wszystkie testy E2E przechodzą (> 95%)
- [ ] Code coverage > 80%
- [ ] Brak defektów krytycznych
- [ ] Defekty wysokie zaadresowane lub zaakceptowane przez PO
- [ ] Testy bezpieczeństwa przeszły pomyślnie
- [ ] Testy wydajnościowe w limitach
- [ ] Dokumentacja zaktualizowana
- [ ] Raport testowy zaakceptowany
- [ ] Plan rollback przygotowany

### C. Przykładowe scenariusze testowe - Quick Reference

| ID | Nazwa | Priorytet | Typ |
|----|-------|-----------|-----|
| TC-AI-001 | Generowanie fiszek z poprawnego tekstu | Krytyczny | E2E |
| TC-AI-003 | Przekroczenie dziennego limitu | Krytyczny | Integration |
| TC-DECK-001 | Tworzenie nowej talii | Krytyczny | E2E |
| TC-DECK-004 | Próba dostępu do cudzej talii | Krytyczny | Security |
| TC-BATCH-001 | Zapis zaakceptowanych propozycji | Krytyczny | Integration |
| TC-RLS-001 | Użytkownik nie widzi cudzych talii | Krytyczny | Security |
| TC-RLS-002 | Brak możliwości modyfikacji cudzych fiszek | Krytyczny | Security |

### D. Kontakty zespołu
*[Do uzupełnienia w trakcie projektu]*

---

**Wersja dokumentu**: 1.0  
**Data utworzenia**: 2025-10-26  
**Autor**: QA Team - 10XCards  
**Status**: Draft - Oczekuje na akceptację

