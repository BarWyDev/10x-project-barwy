# Specyfikacja Techniczna: Moduł Autentykacji Użytkowników

## 1. Architektura Interfejsu Użytkownika (Frontend)

### 1.1. Strony i Layouty (Astro)

-   **`src/layouts/AuthLayout.astro` (nowy)**
    -   **Cel**: Zapewnienie spójnego wyglądu dla stron publicznych, które nie wymagają autentykacji.
    -   **Struktura**: Minimalistyczny layout zawierający podstawowe tagi `<html>`, `<head>` i `<body>`, bez elementów nawigacyjnych przeznaczonych dla zalogowanych użytkowników (np. link do dashboardu, przycisk wylogowania). Będzie renderował komponenty formularzy React.

-   **`src/layouts/AppLayout.astro` (refaktoryzacja `src/layouts/Layout.astro`)**
    -   **Cel**: Główny layout dla wszystkich stron aplikacji wymagających zalogowanego użytkownika.
    -   **Struktura**: Będzie zawierał pełną nawigację aplikacji, w tym `LogoutButton.tsx`.
    -   **Logika**: Wewnątrz layoutu znajdzie się skrypt, który pobierze dane użytkownika z `Astro.locals.user` (wstrzyknięte przez middleware). Jeśli `user` jest `null`, nastąpi przekierowanie do `/login` za pomocą `Astro.redirect`.

-   **`src/pages/login.astro` (nowa)**
    -   **Layout**: `AuthLayout.astro`
    -   **Zawartość**: Będzie renderować komponent `<LoginForm client:load />`.

-   **`src/pages/register.astro` (nowa)**
    -   **Layout**: `AuthLayout.astro`
    -   **Zawartość**: Będzie renderować komponent `<RegisterForm client:load />`.

-   **`src/pages/forgot-password.astro` (nowa)**
    -   **Layout**: `AuthLayout.astro`
    -   **Zawartość**: Będzie renderować komponent `<ForgotPasswordForm client:load />`.

-   **`src/pages/reset-password.astro` (nowa)**
    -   **Layout**: `AuthLayout.astro`
    -   **Logika**: Strona będzie musiała obsłużyć token resetowania hasła z URL, który jest częścią mechanizmu Supabase.
    -   **Zawartość**: Będzie renderować komponent `<ResetPasswordForm client:load />`.

-   **`src/pages/app/index.astro` (modyfikacja)**
    -   **Layout**: Zostanie zmieniony na `AppLayout.astro`, aby zapewnić ochronę trasy.

### 1.2. Komponenty (React)

Wszystkie komponenty formularzy będą zbudowane z użyciem `react-hook-form` do zarządzania stanem i walidacją oraz `zod` do definicji schematów walidacji.

-   **`src/components/auth/LoginForm.tsx` (nowy)**
    -   **UI**: Pola na e-mail i hasło, przycisk "Zaloguj się", link do strony rejestracji i odzyskiwania hasła.
    -   **Logika**:
        -   Wywołuje `supabase.auth.signInWithPassword()` z danymi z formularza.
        -   W przypadku sukcesu: `window.location.href = '/app'`.
        -   W przypadku błędu: Wyświetla generyczny komunikat "Nieprawidłowy e-mail lub hasło" pod formularzem.

-   **`src/components/auth/RegisterForm.tsx` (nowy)**
    -   **UI**: Pola na e-mail i hasło (z potwierdzeniem), przycisk "Zarejestruj się".
    -   **Logika**:
        -   Wywołuje `supabase.auth.signUp()`.
        -   W przypadku sukcesu: `window.location.href = '/app'`. Przekierowanie jest zgodne z historyjką użytkownika US-001, która zakłada automatyczne zalogowanie po rejestracji. Wymaga to wyłączenia potwierdzenia e-mail w ustawieniach Supabase.
        -   W przypadku błędu (np. e-mail już istnieje): Wyświetla odpowiedni komunikat.

-   **`src/components/auth/LogoutButton.tsx` (nowy)**
    -   **UI**: Przycisk "Wyloguj".
    -   **Logika**:
        -   `onClick` wywołuje `supabase.auth.signOut()`.
        -   Po pomyślnym wylogowaniu: `window.location.href = '/login'`.

-   **`src/components/auth/ForgotPasswordForm.tsx` (nowy)**
    -   **UI**: Pole na e-mail, przycisk "Wyślij instrukcje".
    -   **Logika**:
        -   Wywołuje `supabase.auth.resetPasswordForEmail()`.
        -   Niezależnie od wyniku (ze względów bezpieczeństwa), wyświetla komunikat "Jeśli konto istnieje, instrukcje zostały wysłane na podany adres e-mail".

-   **`src/components/auth/ResetPasswordForm.tsx` (nowy)**
    -   **UI**: Pole na nowe hasło i jego potwierdzenie.
    -   **Logika**:
        -   Wywołuje `supabase.auth.updateUser()` z nowym hasłem.
        -   W przypadku sukcesu: Przekierowuje do `/login` z komunikatem o pomyślnej zmianie hasła.

## 2. Logika Backendowa

### 2.1. Middleware (`src/middleware/index.ts`)

Middleware jest kluczowym elementem architektury, działającym po stronie serwera przed renderowaniem każdej strony.

-   **`supabase.ts` (w `src/lib` lub `src/db`)**: Należy utworzyć dwie instancje klienta Supabase: jedną dla strony serwera (używająca `SUPABASE_SERVICE_ROLE_KEY` w razie potrzeby) i jedną dla klienta (używająca `SUPABASE_ANON_KEY`). Middleware będzie używać klienta serwerowego.
-   **Logika middleware**:
    1.  Dla każdego żądania (`context`, `next`) tworzy serwerowego klienta Supabase z kontekstem ciasteczek żądania.
    2.  Wywołuje `supabase.auth.getUser()` w celu weryfikacji sesji na podstawie JWT z ciasteczek.
    3.  Wynik (obiekt `user` lub `null`) jest przypisywany do `context.locals.user`.
    4.  Implementuje logikę ochrony tras:
        -   Pobiera `Astro.url.pathname`.
        -   Jeśli `pathname` zaczyna się od `/app` i `!context.locals.user`, zwraca `context.redirect('/login')`.
        -   Jeśli `pathname` to `/login` lub `/register` i `context.locals.user`, zwraca `context.redirect('/app')`.
    5.  Wywołuje `next()` aby kontynuować przetwarzanie żądania.

## 3. System Autentykacji (Supabase)

-   **Konfiguracja**: Klient Supabase (`@supabase/supabase-js`) zostanie zainicjowany w jednym pliku (`src/db/supabase.client.ts`) i eksportowany do użycia w całej aplikacji. Zmienne środowiskowe `PUBLIC_SUPABASE_URL` i `PUBLIC_SUPABASE_ANON_KEY` będą używane.
-   **Zarządzanie sesją**: Supabase Auth domyślnie używa `localStorage` do przechowywania sesji. Dla SSR z Astro, konieczna będzie konfiguracja `cookieOptions`, aby sesja była przechowywana w bezpiecznych ciasteczkach `httpOnly`, co umożliwi jej odczyt w middleware po stronie serwera.
-   **Szablony e-mail**: W panelu Supabase należy skonfigurować szablon e-maila dla resetowania hasła. Opcja potwierdzenia adresu e-mail po rejestracji musi być **wyłączona**, aby spełnić wymaganie z PRD (US-001) o automatycznym logowaniu użytkownika. Szablony muszą zawierać poprawne linki do frontendu aplikacji.
-   **Row Level Security (RLS)**: Po wdrożeniu autentykacji, wszystkie tabele przechowujące dane użytkowników (np. fiszki) muszą mieć włączone RLS. Polityki RLS zapewnią, że użytkownik może odczytywać i modyfikować tylko własne dane, bazując na `auth.uid() = user_id`.
