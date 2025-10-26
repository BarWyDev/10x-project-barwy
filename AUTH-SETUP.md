# 🔐 Konfiguracja Autentykacji - Przewodnik Setup

Kompletny przewodnik konfiguracji modułu autentykacji użytkowników w aplikacji 10XCards z użyciem Supabase Auth.

## 📋 Spis Treści

1. [Wymagania](#wymagania)
2. [Konfiguracja Supabase](#konfiguracja-supabase)
3. [Zmienne Środowiskowe](#zmienne-środowiskowe)
4. [Testowanie Autentykacji](#testowanie-autentykacji)
5. [Rozwiązywanie Problemów](#rozwiązywanie-problemów)

---

## Wymagania

- Aktywny projekt Supabase
- Node.js 18+ i npm
- Zależności zainstalowane (`npm install`)

## Konfiguracja Supabase

### 1. Utwórz projekt Supabase (jeśli jeszcze nie masz)

1. Przejdź do [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Kliknij **"New Project"**
3. Wypełnij dane projektu:
   - **Name**: `10xcards` (lub dowolna nazwa)
   - **Database Password**: Wygeneruj silne hasło i zapisz je bezpiecznie
   - **Region**: Wybierz najbliższą lokalizację
4. Kliknij **"Create new project"**
5. Poczekaj ~2 minuty na inicjalizację projektu

### 2. Pobierz klucze API

1. W dashboard Supabase przejdź do: **Settings → API**
2. Skopiuj następujące wartości:
   - **Project URL** (np. `https://abcdefgh.supabase.co`)
   - **anon/public key** (długi ciąg znaków zaczynający się od `eyJ...`)

### 3. Wyłącz potwierdzenie email (WAŻNE!)

⚠️ **Ten krok jest wymagany dla zgodności z User Story US-001 (automatyczne logowanie po rejestracji)**

1. W dashboard Supabase przejdź do: **Authentication → Providers → Email**
2. Znajdź sekcję **"Email Confirmation"**
3. **Wyłącz** opcję **"Confirm email"** (odznacz checkbox)
4. Kliknij **"Save"**

**Dlaczego to robimy?**
- PRD (US-001) wymaga automatycznego logowania po rejestracji
- Dla MVP pomijamy weryfikację email aby uprościć onboarding
- W produkcji możesz włączyć tę opcję i dostosować przepływ rejestracji

### 4. Skonfiguruj Site URL (opcjonalne dla development)

1. W dashboard Supabase przejdź do: **Authentication → URL Configuration**
2. W polu **"Site URL"** wpisz:
   - Development: `http://localhost:3000`
   - Production: Twoja domena produkcyjna (np. `https://app.10xcards.com`)
3. W polu **"Redirect URLs"** dodaj:
   - `http://localhost:3000/**`
   - Oraz URL produkcyjny z wildcards jeśli masz

### 5. Skonfiguruj Email Templates (opcjonalne)

Jeśli planujesz używać funkcji resetowania hasła:

1. Przejdź do: **Authentication → Email Templates**
2. Wybierz template: **"Reset Password"**
3. Dostosuj wiadomość według potrzeb (opcjonalnie)
4. Upewnij się, że link w szablonie prowadzi do: `{{ .SiteURL }}/reset-password?token={{ .Token }}`

---

## Zmienne Środowiskowe

### Utwórz plik `.env` w głównym katalogu projektu:

```bash
# .env
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_KEY=your-anon-key-here
OPENROUTER_API_KEY=your-openrouter-api-key
```

**Uwaga:** Prefix `PUBLIC_` jest wymagany dla zmiennych używanych w komponentach React po stronie klienta.

### Gdzie znaleźć wartości?

**Dla lokalnej instancji Supabase (Docker):**
- Uruchom `supabase status` w terminalu
- Skopiuj wartości z output:
  - `API URL` → `PUBLIC_SUPABASE_URL`
  - `Publishable key` → `PUBLIC_SUPABASE_KEY`

| Zmienna | Źródło | Opis |
|---------|--------|------|
| `PUBLIC_SUPABASE_URL` | `supabase status` → API URL | URL lokalnej instancji Supabase |
| `PUBLIC_SUPABASE_KEY` | `supabase status` → Publishable key | Klucz publiczny (bezpieczny dla klienta) |
| `OPENROUTER_API_KEY` | [OpenRouter Dashboard](https://openrouter.ai/) | API key do generowania fiszek AI |

### ⚠️ Bezpieczeństwo

- **NIE commituj** pliku `.env` do repozytorium
- Plik `.env` jest już w `.gitignore`
- W produkcji ustaw zmienne środowiskowe w panelu hostingu (Vercel, Netlify, etc.)

### Przykładowy plik `.env.example`:

```bash
# Supabase Configuration (LOCAL)
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_KEY=your-publishable-key-from-supabase-status
OPENROUTER_API_KEY=your-openrouter-api-key
# OPENAI_API_KEY=your-openai-api-key  # Opcjonalnie
```

---

## Testowanie Autentykacji

### 1. Uruchom serwer deweloperski

```bash
npm run dev
```

Aplikacja powinna być dostępna pod adresem: `http://localhost:3000`

### 2. Test przepływu rejestracji

1. Otwórz: `http://localhost:3000/register`
2. Wypełnij formularz:
   - **Email**: `test@example.com`
   - **Hasło**: `TestPassword123` (min. 8 znaków, duża litera, mała litera, cyfra)
   - **Potwierdzenie hasła**: `TestPassword123`
3. Kliknij **"Zarejestruj się"**
4. Powinieneś być automatycznie zalogowany i przekierowany do `/app`

### 3. Test przepływu logowania

1. Otwórz: `http://localhost:3000/login`
2. Wprowadź dane utworzonego konta:
   - **Email**: `test@example.com`
   - **Hasło**: `TestPassword123`
3. Kliknij **"Zaloguj się"**
4. Powinieneś być przekierowany do `/app`

### 4. Test ochrony tras

**Test A: Próba dostępu do chronionej trasy bez logowania**
1. Wyloguj się (przycisk "Wyloguj się" w headerze)
2. Spróbuj otworzyć: `http://localhost:3000/app`
3. Powinieneś być automatycznie przekierowany do `/login`

**Test B: Próba dostępu do strony logowania będąc zalogowanym**
1. Zaloguj się
2. Spróbuj otworzyć: `http://localhost:3000/login`
3. Powinieneś być automatycznie przekierowany do `/app`

### 5. Test wylogowania

1. Będąc zalogowanym, kliknij przycisk **"Wyloguj się"** w headerze
2. Powinieneś być przekierowany do `/login`
3. Próba otwarcia `/app` powinna teraz przekierować z powrotem do `/login`

### 6. Weryfikacja użytkownika w Supabase Dashboard

1. Przejdź do: **Authentication → Users** w dashboard Supabase
2. Powinieneś zobaczyć utworzonych użytkowników z:
   - Email
   - Datą utworzenia
   - Statusem potwierdzenia (powinien być "confirmed" jeśli wyłączyłeś email confirmation)

---

## Rozwiązywanie Problemów

### Problem: "Invalid login credentials"

**Możliwe przyczyny:**
- Błędne dane logowania
- Użytkownik nie istnieje w bazie
- Email nie został potwierdzony (jeśli włączona weryfikacja)

**Rozwiązanie:**
1. Sprawdź czy użytkownik istnieje: Authentication → Users w Supabase
2. Upewnij się, że wyłączyłeś email confirmation (punkt 3 konfiguracji)
3. Spróbuj utworzyć nowe konto

### Problem: "supabase is not defined" lub błędy TypeScript

**Rozwiązanie:**
1. Upewnij się, że plik `.env` istnieje i zawiera prawidłowe wartości z prefiksem `PUBLIC_`
2. Zrestartuj serwer deweloperski (`Ctrl+C`, potem `npm run dev`)
3. Sprawdź czy `PUBLIC_SUPABASE_URL` i `PUBLIC_SUPABASE_KEY` są ustawione
4. Upewnij się że używasz `Publishable key` a nie `anon key` (dla lokalnego Supabase)

### Problem: Przekierowanie do `/login` zamiast do `/app` po rejestracji

**Możliwe przyczyny:**
- Email confirmation jest włączona w Supabase
- Sesja nie została poprawnie utworzona

**Rozwiązanie:**
1. Sprawdź punkt 3 konfiguracji - wyłącz email confirmation
2. Sprawdź console przeglądarki (F12) pod kątem błędów
3. Sprawdź czy token sesji jest przechowywany w localStorage:
   - Otwórz DevTools → Application → Local Storage
   - Szukaj kluczy zaczynających się od `sb-`

### Problem: "Failed to fetch" lub błędy CORS

**Rozwiązanie:**
1. Sprawdź czy `SUPABASE_URL` w `.env` jest poprawny
2. Upewnij się, że projekt Supabase jest aktywny (nie wygaszony/pausowany)
3. Sprawdź Site URL i Redirect URLs w konfiguracji Supabase

### Problem: Middleware nie przekierowuje prawidłowo

**Diagnostyka:**
1. Dodaj logi do middleware (`src/middleware/index.ts`):
```typescript
console.log('Pathname:', pathname);
console.log('User:', context.locals.user);
```
2. Sprawdź terminal gdzie działa `npm run dev`
3. Zobacz co jest logowane przy próbie dostępu do tras

---

## 🎯 Kolejne Kroki

Po ukończeniu konfiguracji autentykacji możesz:

1. ✅ Zaimplementować pozostałe komponenty auth:
   - `RegisterForm.tsx` - Formularz rejestracji
   - `ForgotPasswordForm.tsx` - Przypomnienie hasła
   - `ResetPasswordForm.tsx` - Reset hasła

2. ✅ Dodać testy automatyczne:
   - Unit testy komponentów formularzy
   - Integration testy przepływów autentykacji
   - E2E testy Playwright/Cypress

3. ✅ Rozszerzyć profil użytkownika:
   - Dodać tabelę `profiles` w Supabase
   - Rozszerzyć `AppUser` o dodatkowe pola
   - Implementować edycję profilu

4. ✅ Implementować RLS (Row Level Security):
   - Zabezpieczyć tabele `flashcards` i `decks`
   - Tylko właściciel może odczytać/modyfikować swoje dane

---

## 📚 Dokumentacja Techniczna

### Architektura Autentykacji

```
┌─────────────┐
│   Browser   │
│ (LoginForm) │
└──────┬──────┘
       │ 1. signInWithPassword()
       ▼
┌─────────────────┐
│ Supabase Client │
│  (localStorage) │
└──────┬──────────┘
       │ 2. Session Token
       ▼
┌─────────────────┐
│   Middleware    │
│   (SSR Auth)    │
└──────┬──────────┘
       │ 3. Astro.locals.user
       ▼
┌─────────────────┐
│   AppLayout     │
│ (Protected Page)│
└─────────────────┘
```

### Wykorzystane Technologie

- **Supabase Auth** - Zarządzanie użytkownikami i sesjami
- **localStorage** - Przechowywanie session token (client-side)
- **Astro Middleware** - Weryfikacja sesji na serwerze (SSR)
- **react-hook-form + zod** - Walidacja formularzy

### Pliki Zmodyfikowane/Utworzone

| Plik | Opis | Status |
|------|------|--------|
| `src/env.d.ts` | Typy TypeScript (AppUser, Locals) | ✅ Zaktualizowany |
| `src/middleware/index.ts` | Autentykacja i ochrona tras | ✅ Zaktualizowany |
| `src/components/auth/LoginForm.tsx` | Formularz logowania | ✅ Zaktualizowany |
| `src/components/auth/LogoutButton.tsx` | Przycisk wylogowania | ✅ Zaktualizowany |
| `src/layouts/AppLayout.astro` | Layout dla zalogowanych | ✅ Zaktualizowany |
| `package.json` | Dodano @hookform/resolvers | ✅ Zaktualizowany |

---

## ✅ Checklist Konfiguracji

Użyj tej checklisty aby upewnić się, że wszystko jest skonfigurowane:

- [ ] Utworzono projekt Supabase
- [ ] Skopiowano SUPABASE_URL i SUPABASE_KEY
- [ ] Wyłączono email confirmation w Supabase
- [ ] Ustawiono Site URL w Supabase (opcjonalne)
- [ ] Utworzono plik `.env` z poprawnymi wartościami
- [ ] Uruchomiono `npm install` (zainstalowano @hookform/resolvers)
- [ ] Uruchomiono `npm run dev` i serwer działa
- [ ] Przetestowano rejestrację nowego użytkownika
- [ ] Przetestowano logowanie
- [ ] Przetestowano wylogowanie
- [ ] Przetestowano ochronę tras (przekierowania)
- [ ] Zweryfikowano użytkownika w Supabase Dashboard

---

## 🆘 Wsparcie

Jeśli masz problemy z konfiguracją:

1. Sprawdź sekcję [Rozwiązywanie Problemów](#rozwiązywanie-problemów)
2. Przejrzyj logi w konsoli przeglądarki (F12)
3. Sprawdź logi serwera w terminalu
4. Zweryfikuj konfigurację w Supabase Dashboard
5. Sprawdź czy wszystkie zmienne środowiskowe są ustawione

---

**Dokument utworzony:** 2025-10-26  
**Ostatnia aktualizacja:** 2025-10-26  
**Wersja:** 1.0.0

