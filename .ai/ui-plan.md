# Architektura UI dla 10XCards

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika 10XCards została zaprojektowana z myślą o prostocie i szybkości, koncentrując się na kluczowym przepływie pracy użytkownika: od generowania fiszek za pomocą AI, przez ich weryfikację, aż po proces nauki oparty na powtórkach interwałowych. Struktura jest minimalistyczna, aby uniknąć rozpraszania i maksymalnie uprościć nawigację.

Aplikacja składa się z dwóch głównych obszarów:
1.  **Strefa publiczna:** Dostępna dla niezalogowanych użytkowników, obejmująca jedynie widoki logowania i rejestracji.
2.  **Strefa prywatna:** Dostępna po zalogowaniu, z głównym panelem jako centrum nawigacyjnym, z którego dostępne są wszystkie kluczowe funkcje: tworzenie fiszek, zarządzanie nimi oraz rozpoczynanie sesji nauki.

Projekt celowo unika skomplikowanych struktur, takich jak zagnieżdżone menu czy wiele poziomów nawigacji, co jest zgodne z zakresem MVP. Główny nacisk położono na płynne przejścia między kluczowymi zadaniami użytkownika.

## 2. Lista widoków

### Widok Logowania (Login View)
- **Ścieżka:** `/login`
- **Główny cel:** Umożliwienie powracającym użytkownikom bezpiecznego dostępu do ich kont.
- **Kluczowe informacje do wyświetlenia:** Formularz logowania z polami na e-mail i hasło, komunikatami o błędach oraz link do widoku rejestracji.
- **Kluczowe komponenty widoku:**
    - `LoginForm`: Komponent formularza.
    - `Input`: Pola na e-mail i hasło.
    - `Button`: Przycisk "Zaloguj się".
    - `Link`: Przekierowanie do strony rejestracji.
- **UX, dostępność i względy bezpieczeństwa:**
    - **UX:** Błędy walidacji wyświetlane są inline. Błędy logowania (np. nieprawidłowe dane) komunikowane są za pomocą globalnego komunikatu "toast".
    - **Dostępność:** Pełna obsługa nawigacji za pomocą klawiatury, semantyczne tagi HTML i etykiety `aria` dla pól formularza.
    - **Bezpieczeństwo:** Komunikacja z API odbywa się wyłącznie przez HTTPS.

### Widok Rejestracji (Register View)
- **Ścieżka:** `/register`
- **Główny cel:** Umożliwienie nowym użytkownikom szybkiego i łatwego stworzenia konta.
- **Kluczowe informacje do wyświetlenia:** Formularz rejestracji, wymagania dotyczące hasła, komunikaty o błędach (np. zajęty e-mail), link do widoku logowania.
- **Kluczowe komponenty widoku:**
    - `RegisterForm`: Komponent formularza.
    - `Input`: Pola na e-mail i hasło.
    - `Button`: Przycisk "Zarejestruj się".
    - `Link`: Przekierowanie do strony logowania.
- **UX, dostępność i względy bezpieczeństwa:**
    - **UX:** Informacje zwrotne w czasie rzeczywistym dotyczące walidacji (np. format e-mail, siła hasła).
    - **Dostępność:** Analogicznie do widoku logowania.
    - **Bezpieczeństwo:** Analogicznie do widoku logowania.

### Główny Panel (Dashboard)
- **Ścieżka:** `/` (dla zalogowanych użytkowników)
- **Główny cel:** Stanowi centrum operacyjne aplikacji, umożliwiając dostęp do wszystkich kluczowych funkcji z jednego miejsca.
- **Kluczowe informacje do wyświetlenia:**
    - Sekcja generowania fiszek na podstawie tekstu.
    - Aktualny stan wykorzystania limitu AI.
    - Lista istniejących fiszek użytkownika (z paginacją lub przewijaniem).
    - Punkt wejścia do sesji nauki.
- **Kluczowe komponenty widoku:**
    - `FlashcardGenerator`: Pole `Textarea` na notatki i przycisk "Generuj".
    - `UsageLimitIndicator`: Wizualny wskaźnik pozostałego dziennego limitu generowania.
    - `FlashcardList`: Tabela lub siatka kart z listą fiszek, zawierająca opcje edycji i usuwania.
    - `Button`: Przycisk "Rozpocznij naukę".
    - `Button`: Przycisk "Dodaj nową fiszkę" (otwierający modal).
- **UX, dostępność i względy bezpieczeństwa:**
    - **UX:** Zastosowanie "optimistic UI" przy usuwaniu fiszek dla natychmiastowej informacji zwrotnej. Wyraźny stan ładowania podczas generowania fiszek i pobierania danych. Obsługa stanu pustego (gdy użytkownik nie ma jeszcze fiszek).
    - **Dostępność:** Tabela z poprawnymi nagłówkami (`<th>`, `scope`), przyciski z czytelnymi etykietami.
    - **Bezpieczeństwo:** Wszystkie operacje wymagają uwierzytelnienia.

### Widok Weryfikacji Fiszki AI (AI Verification View)
- **Ścieżka:** `/generate/verify` (może być zaimplementowany jako strona lub jako modal na pełnym ekranie)
- **Główny cel:** Umożliwienie użytkownikowi przeglądu, edycji i selekcji fiszek wygenerowanych przez AI przed ich ostatecznym zapisaniem.
- **Kluczowe informacje do wyświetlenia:** Lista proponowanych par awers/rewers.
- **Kluczowe komponenty widoku:**
    - `EditableFlashcardProposal`: Komponent reprezentujący pojedynczą propozycję fiszki z polami do edycji i przyciskiem do usunięcia.
    - `Button`: Przyciski akcji globalnych: "Zapisz zaznaczone" i "Odrzuć wszystko".
- **UX, dostępność i względy bezpieczeństwa:**
    - **UX:** Edycja "inline" bez przeładowywania strony. Możliwość łatwego odrzucenia niepoprawnych propozycji.
    - **Dostępność:** Zarządzanie focusem podczas przechodzenia między polami edycji.
    - **Bezpieczeństwo:** Dane przesyłane do zapisu są ponownie walidowane po stronie serwera.

### Widok Sesji Nauki (Learning Session View)
- **Ścieżka:** `/learn`
- **Główny cel:** Przeprowadzenie użytkownika przez sesję powtórkową w sposób wolny od rozpraszaczy.
- **Kluczowe informacje do wyświetlenia:**
    - Treść awersu/rewersu aktualnej fiszki.
    - Licznik postępu w sesji (np. "Fiszka 5 z 20").
- **Kluczowe komponenty widoku:**
    - `FlashcardDisplay`: Komponent wyświetlający fiszkę z animacją odwracania.
    - `RatingButtons`: Zestaw przycisków do oceny ("Trudne", "Dobre", "Łatwe").
    - `ProgressBar`: Wizualny wskaźnik postępu sesji.
- **UX, dostępność i względy bezpieczeństwa:**
    - **UX:** Minimalistyczny interfejs. Płynne i szybkie przejścia między kolejnymi fiszkami.
    - **Dostępność:** Obsługa za pomocą klawiatury (np. spacja do odwrócenia karty, klawisze 1-3 do oceny).
    - **Bezpieczeństwo:** Operacje ograniczone do pobierania fiszek i wysyłania ocen.

### Widok Podsumowania Sesji Nauki (Session Summary View)
- **Ścieżka:** `/learn/summary`
- **Główny cel:** Poinformowanie użytkownika o zakończeniu sesji i przedstawienie prostego podsumowania.
- **Kluczowe informacje do wyświetlenia:** Liczba powtórzonych fiszek.
- **Kluczowe komponenty widoku:**
    - `SummaryPanel`: Komponent z tekstem podsumowania.
    - `Button`: Przycisk "Wróć do panelu głównego".
- **UX, dostępność i względy bezpieczeństwa:**
    - **UX:** Jasny i motywujący komunikat na zakończenie sesji.
    - **Dostępność:** Prosty, czytelny widok.
    - **Bezpieczeństwo:** Brak operacji na wrażliwych danych.

## 3. Mapa podróży użytkownika

Główny przepływ pracy ("happy path") dla nowego użytkownika:
1.  **Rejestracja (`/register`):** Użytkownik tworzy konto i jest automatycznie logowany.
2.  **Przekierowanie do Panelu Głównego (`/`):** Użytkownik ląduje na głównym panelu, gdzie widzi zachętę do stworzenia pierwszych fiszek.
3.  **Generowanie fiszek (`/`):** Użytkownik wkleja notatki do komponentu `FlashcardGenerator` i klika "Generuj".
4.  **Weryfikacja (`/generate/verify`):** System wyświetla listę propozycji. Użytkownik poprawia treść kilku z nich i usuwa jedną, która mu nie odpowiada.
5.  **Zapis (`/generate/verify` -> `/`):** Użytkownik klika "Zapisz". Aplikacja zapisuje fiszki i przekierowuje go z powrotem do panelu głównego, gdzie nowo utworzone pozycje są już widoczne na liście.
6.  **Rozpoczęcie nauki (`/` -> `/learn`):** Po stworzeniu kilku fiszek, użytkownik klika "Rozpocznij naukę". Aplikacja przenosi go do widoku sesji.
7.  **Sesja nauki (`/learn`):** Użytkownik przechodzi przez kilka fiszek, odwracając je i oceniając swoją wiedzę.
8.  **Zakończenie sesji (`/learn` -> `/learn/summary`):** Po ostatniej fiszce, system automatycznie wyświetla ekran podsumowania.
9.  **Powrót (`/learn/summary` -> `/`):** Użytkownik wraca do panelu głównego.

## 4. Układ i struktura nawigacji

- **Układ globalny:** Aplikacja wykorzystuje stały, globalny nagłówek dla zalogowanych użytkowników, który jest widoczny we wszystkich widokach z wyjątkiem Sesji Nauki (aby zapewnić tryb skupienia).
- **Nagłówek (Header):**
    - **Logo:** Klikalne logo aplikacji, zawsze prowadzące do Głównego Panelu (`/`).
    - **Informacje o użytkowniku:** Wyświetlanie adresu e-mail zalogowanego użytkownika.
    - **Przycisk "Wyloguj":** Umożliwia bezpieczne zakończenie sesji.
- **Brak menu bocznego/stopki:** Zgodnie z założeniami MVP, nawigacja jest uproszczona do minimum. Wszystkie kluczowe akcje są dostępne z poziomu Głównego Panelu.

## 5. Kluczowe komponenty

Poniżej znajduje się lista kluczowych, reużywalnych komponentów, które będą stanowić podstawę interfejsu:
- **`Flashcard`:** Komponent reprezentujący pojedynczą fiszkę w różnych kontekstach (na liście, w edycji, w sesji nauki).
- **`Form` (Logowanie/Rejestracja/Edycja):** Generyczne komponenty formularzy zbudowane w oparciu o bibliotekę komponentów (Shadcn/ui), obsługujące walidację i stany ładowania.
- **`Modal`:** Komponent okna dialogowego używany do akcji takich jak ręczne dodawanie fiszki czy potwierdzenie usunięcia.
- **`DataTable`:** Komponent tabeli używany do wyświetlania listy fiszek, wyposażony w funkcje sortowania i paginacji.
- **`Toast`:** Globalny system powiadomień do informowania o sukcesach (np. "Zapisano fiszki") i błędach (np. "Błąd serwera").
