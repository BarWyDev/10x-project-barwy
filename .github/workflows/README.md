# GitHub Actions Workflows - Dokumentacja

## Przegląd

Ten katalog zawiera konfiguracje CI/CD dla projektu. Główny workflow (`ci.yml`) uruchamia linting, testy jednostkowe, testy E2E i buduje aplikację.

## Pliki Workflow

### `ci.yml` (Główny Workflow)

Workflow uruchamiany automatycznie przy każdym push'u na `master/main` oraz możliwy do ręcznego uruchomienia.

**Struktura:**

1. **Lint** - ESLint sprawdza jakość kodu
2. **Unit Tests** - Vitest uruchamia testy jednostkowe z coverage
3. **E2E Tests** - Playwright uruchamia testy end-to-end
4. **Build** - Buduje wersję produkcyjną
5. **Summary** - Podsumowanie wszystkich kroków

### `ci-with-local-supabase.yml.example` (Opcjonalny)

Przykład workflow z lokalnym Supabase w Docker'ze. Bardziej skomplikowany, ale daje pełną izolację.

## Konfiguracja Secrets

W GitHub Settings > Secrets > Actions ustaw:

- `SUPABASE_URL` - URL do Twojej instancji Supabase
- `SUPABASE_ANON_KEY` - Publiczny klucz API Supabase

## Ważne Zagadnienia

### Problem z Playwright webServer

**Symptom:** 
```
Error: Timed out waiting 120000ms for webServer
```

**Przyczyna:**
Playwright automatycznie uruchamia serwer deweloperski (zdefiniowany w `playwright.config.ts`), ale potrzebuje zmiennych środowiskowych, żeby aplikacja Astro mogła się uruchomić.

**Rozwiązanie:**
Zmienne środowiskowe muszą być ustawione na poziomie całego job'a, a nie tylko dla kroku z testami:

```yaml
# ✅ POPRAWNIE - zmienne dla całego job'a
test-e2e:
  name: E2E Tests
  runs-on: ubuntu-latest
  env:
    PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
  steps:
    - name: Run E2E tests
      run: npm run test:e2e

# ❌ ŹLE - zmienne tylko dla kroku
test-e2e:
  name: E2E Tests
  runs-on: ubuntu-latest
  steps:
    - name: Run E2E tests
      run: npm run test:e2e
      env:
        PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

**Dlaczego to ważne:**
- Playwright uruchamia `webServer` jako osobny proces
- Ten proces musi mieć dostęp do zmiennych środowiskowych
- Zmienne z `env` na poziomie kroku nie są dziedziczone przez procesy potomne

### Playwright Configuration

W `playwright.config.ts` mamy:

```typescript
webServer: {
  command: "npm run dev",
  url: "http://localhost:4321",
  reuseExistingServer: !process.env.CI,
  timeout: 120 * 1000,
}
```

- `reuseExistingServer: !process.env.CI` - W CI zawsze uruchamiaj nowy serwer
- `timeout: 120 * 1000` - 120 sekund na uruchomienie serwera
- Serwer musi odpowiadać na `url` zanim testy się rozpoczną

## Troubleshooting

### Timeout podczas uruchamiania serwera

1. **Sprawdź secrets** - Upewnij się, że `SUPABASE_URL` i `SUPABASE_ANON_KEY` są ustawione w GitHub
2. **Sprawdź logi** - Zobacz logi z kroku "Run E2E tests" w GitHub Actions
3. **Uruchom lokalnie** - Sprawdź czy `npm run dev` działa lokalnie z tymi samymi zmiennymi

### Testy przechodzą lokalnie, ale nie w CI

1. **Zmienne środowiskowe** - W CI mogą być różne od lokalnych
2. **Timing** - Serwer może wolniej się uruchamiać w CI
3. **Baza danych** - Upewnij się, że dane testowe są tworzone w setup hooks

### Playwright nie znajduje przeglądarki

```bash
npx playwright install --with-deps chromium
```

Ten krok musi być wykonany **przed** uruchomieniem testów.

## Best Practices

1. **Zmienne środowiskowe na poziomie job'a** - Dla kroków z automatycznym uruchamianiem serwera
2. **Używaj `npm ci` zamiast `npm install`** - Szybsze i bardziej deterministyczne
3. **Cache dla Node.js** - `actions/setup-node@v4` z `cache: 'npm'`
4. **Retry w CI** - Playwright config ma `retries: process.env.CI ? 2 : 0`
5. **Single worker w CI** - `workers: process.env.CI ? 1 : undefined` - unika race conditions
6. **Upload artifacts** - Zawsze uploaduj raporty z testów (`if: always()`)

## Uruchamianie Lokalnie

```bash
# Testy jednostkowe
npm run test:run

# Testy E2E (wymaga uruchomionego serwera)
npm run test:e2e

# Lub użyj skryptu który uruchamia serwer automatycznie
# (Playwright zrobi to za Ciebie dzięki webServer config)
npm run test:e2e
```

## Monitoring

- **GitHub Actions UI** - Zobacz status w zakładce "Actions"
- **Playwright Report** - Pobierz artifact "playwright-report"
- **Coverage Report** - Pobierz artifact "coverage-report"
- **Build Artifacts** - Pobierz artifact "dist"

## Przydatne Linki

- [Playwright CI Documentation](https://playwright.dev/docs/ci)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Supabase CI/CD Guide](https://supabase.com/docs/guides/cli/cicd-workflow)
