# Następne Kroki - Wdrożenie Testów

Środowisko testowe jest gotowe! Oto sugerowane następne kroki do pełnego wykorzystania testów w projekcie.

## 🎯 Faza 1: Zapoznanie się z narzędziami (1-2 dni)

### 1. Uruchom Vitest UI
```bash
npm run test:ui
```
- Otwórz przeglądarką `http://localhost:51204`
- Zobacz przykładowe testy w akcji
- Pobaw się interfejsem - możesz filtrować, uruchamiać pojedyncze testy, etc.

### 2. Uruchom Playwright UI
```bash
npm run test:e2e:ui
```
- Zobacz jak działają testy E2E
- Wykorzystaj "Pick Locator" do wybierania elementów na stronie
- Zobacz trace viewer dla debugowania

### 3. Przeczytaj dokumentację
- 📖 `test/README.md` - pełna dokumentacja
- 💡 `test/EXAMPLES.md` - gotowe przykłady do skopiowania
- 📋 `TESTING.md` - szybki start

## 🏗️ Faza 2: Pierwsze testy (3-5 dni)

### 1. Rozpocznij od testów jednostkowych

**Priorytety:**
1. Funkcje utility (`src/lib/utils/`)
2. Schematy walidacji (`src/lib/validation/`)
3. Serwisy (`src/lib/services/`)

**Przykład:**
```bash
# Utwórz test dla validation.ts
touch test/unit/lib/utils/validation.test.ts

# Uruchom w trybie watch
npm run test:watch
```

### 2. Dodaj testy komponentów UI

**Priorytety:**
1. Komponenty UI (Button, Input, Card) - już są w `src/components/ui/`
2. Komponenty dashboard (`src/components/dashboard/`)
3. Komponenty auth (`src/components/auth/`)

**Przykład:**
```bash
# Utwórz test dla LoginForm
touch test/unit/components/auth/LoginForm.test.tsx

# Zobacz w UI
npm run test:ui
```

### 3. Pisz testy podczas developmentu

Workflow:
1. Otwórz `npm run test:watch` w jednym terminalu
2. Otwórz `npm run dev` w drugim terminalu
3. Pisz kod i testy równocześnie
4. Obserwuj jak testy przechodzą automatycznie

## 🎭 Faza 3: Testy E2E (5-7 dni)

### 1. Utwórz Auth Fixtures

Najpierw musisz zapisać stan autentykacji:

```bash
# Utwórz skrypt setup
touch test/e2e/auth.setup.ts
```

```typescript
// test/e2e/auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  // TODO: Dostosuj do swojej aplikacji
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('test@example.com');
  await page.getByLabel(/password/i).fill('Test123!');
  await page.getByRole('button', { name: /login/i }).click();
  
  await page.waitForURL('/app');
  await page.context().storageState({ 
    path: 'test/fixtures/auth-state.json' 
  });
});
```

Dodaj do `playwright.config.ts`:
```typescript
export default defineConfig({
  // ... existing config
  projects: [
    { 
      name: 'setup', 
      testMatch: /.*\.setup\.ts/ 
    },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'test/fixtures/auth-state.json',
      },
      dependencies: ['setup'],
    },
  ],
});
```

### 2. Rozbuduj Page Objects

Dodaj Page Objects dla wszystkich głównych stron:

```bash
touch test/e2e/pages/register.page.ts
touch test/e2e/pages/generate.page.ts
touch test/e2e/pages/verification.page.ts
```

### 3. Napisz główne scenariusze

**Priorytety:**
1. ✅ Rejestracja i logowanie (już jest szkic)
2. 🎯 Generowanie fiszek
3. 🎯 Weryfikacja fiszek
4. 🎯 Zarządzanie taliami
5. 🎯 Limity użycia

### 4. Uruchom codegen dla pomocy

```bash
# Playwright wygeneruje testy za Ciebie!
npx playwright codegen http://localhost:4321
```

## 📊 Faza 4: Coverage i CI/CD (2-3 dni)

### 1. Włącz progi coverage

W `vitest.config.ts` odkomentuj:
```typescript
coverage: {
  thresholds: {
    lines: 70,
    functions: 70,
    branches: 70,
    statements: 70,
  },
}
```

### 2. Dodaj pre-commit hook

```bash
npx husky add .husky/pre-push "npm run test:run"
```

### 3. Skonfiguruj GitHub Actions

Utwórz `.github/workflows/tests.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## 🎨 Faza 5: Visual Regression (opcjonalnie, 1-2 dni)

### 1. Dodaj screenshoty komponentów

```typescript
// test/e2e/visual/components.spec.ts
import { test, expect } from '@playwright/test';

test('Button component snapshots', async ({ page }) => {
  await page.goto('/test'); // strona z komponentami
  
  await expect(page.getByTestId('button-primary')).toHaveScreenshot('button-primary.png');
  await expect(page.getByTestId('button-secondary')).toHaveScreenshot('button-secondary.png');
});
```

### 2. Utwórz test page dla komponentów

```astro
---
// src/pages/test-components.astro
import Button from '@/components/ui/button';
---
<html>
  <body>
    <div data-testid="button-primary">
      <Button variant="primary">Primary</Button>
    </div>
    <div data-testid="button-secondary">
      <Button variant="secondary">Secondary</Button>
    </div>
  </body>
</html>
```

## 📈 Metryki sukcesu

### Tygodniowe cele:

**Tydzień 1:**
- [ ] Wszystkie przykładowe testy działają
- [ ] Napisane testy dla 3-5 funkcji utility
- [ ] Testy dla 2-3 komponentów UI

**Tydzień 2:**
- [ ] Coverage > 50% dla `src/lib/`
- [ ] Testy dla wszystkich komponentów auth
- [ ] Podstawowe testy E2E (login, register)

**Tydzień 3:**
- [ ] Coverage > 70% dla całego projektu
- [ ] Pełne testy E2E dla głównych flow
- [ ] CI/CD skonfigurowane

**Tydzień 4:**
- [ ] Coverage > 80%
- [ ] Visual regression dla kluczowych komponentów
- [ ] Dokumentacja testów zaktualizowana

## 💡 Wskazówki

### Do's ✅
- ✅ Pisz testy podczas developmentu, nie po
- ✅ Rozpocznij od prostych testów (pure functions)
- ✅ Wykorzystuj `test:watch` non-stop
- ✅ Mockuj zewnętrzne zależności (API, Supabase)
- ✅ Używaj Page Object Model dla E2E
- ✅ Pisz testy dla bugów zanim je naprawisz

### Don'ts ❌
- ❌ Nie testuj implementacji, testuj zachowanie
- ❌ Nie dąż do 100% coverage kosztem jakości testów
- ❌ Nie pisz testów zbyt zależnych od struktury DOM
- ❌ Nie skipuj testów na stałe (tylko tymczasowo)
- ❌ Nie commituj failujących testów

## 🆘 Pomoc

### Problem: Testy są wolne
**Rozwiązanie:**
- Mockuj ciężkie operacje (API, DB)
- Używaj `vi.mock()` zamiast prawdziwych modułów
- Dla E2E: mockuj API używając `page.route()`

### Problem: Testy są kruche (flaky)
**Rozwiązanie:**
- Używaj `waitForLoadState('networkidle')`
- Zwiększ timeouty w `playwright.config.ts`
- Używaj `waitForResponse()` zamiast `waitForTimeout()`
- Dodaj retry strategy

### Problem: Nie wiem co testować
**Rozwiązanie:**
1. Zacznij od edge cases
2. Testuj błędy przed happy path
3. Zobacz coverage report: `npm run test:coverage`
4. Przeczytaj `test/EXAMPLES.md`

### Problem: Coverage jest niski
**Rozwiązanie:**
- Zobacz raport: `coverage/index.html`
- Znajdź untested lines
- Nie gonij liczb - testuj to co ważne

## 📚 Materiały dodatkowe

### Vitest
- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Kent C. Dodds - Testing](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Playwright
- [Playwright Docs](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)

### Testing Philosophy
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Testing JavaScript](https://testingjavascript.com/)

## 🎯 Checklist końcowa

Przed uznaniem projektu za "fully tested":

- [ ] Coverage > 80% dla critical paths
- [ ] Wszystkie edge cases pokryte
- [ ] E2E dla głównych user flows
- [ ] CI/CD uruchamia testy automatycznie
- [ ] Pre-commit hook blokuje broken code
- [ ] Dokumentacja testów jest aktualna
- [ ] Team zna jak pisać i uruchamiać testy
- [ ] Testy przechodzą < 5 minut (unit + E2E)

---

**Powodzenia! 🚀**

Pamiętaj: Dobre testy to inwestycja, która zwraca się każdego dnia developmentu.


