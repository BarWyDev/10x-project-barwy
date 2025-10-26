# Dokumentacja Testów

Ten katalog zawiera kompletne środowisko testowe dla projektu **10x-cards**, obejmujące zarówno testy jednostkowe (Vitest) jak i E2E (Playwright).

## 📁 Struktura Katalogów

```
test/
├── unit/                    # Testy jednostkowe
│   ├── components/         # Testy komponentów React
│   └── lib/                # Testy funkcji utility, serwisów, itp.
├── e2e/                    # Testy E2E
│   ├── pages/              # Page Object Models
│   └── *.spec.ts           # Pliki testowe E2E
├── fixtures/               # Dane testowe, mocki, fixtures
├── helpers/                # Pomocnicze funkcje dla testów
└── setup.ts               # Setup file dla Vitest
```

## 🧪 Testy Jednostkowe (Vitest)

### Uruchamianie

```bash
# Tryb watch (rozwój)
npm run test:watch

# Jednorazowe uruchomienie
npm run test:run

# Z interfejsem UI
npm run test:ui

# Z coverage
npm run test:coverage
```

### Best Practices

1. **Struktura testów**: Arrange-Act-Assert
2. **Nazewnictwo**: Opisowe nazwy testów w `it('should ...')`
3. **Mockowanie**: Używaj `vi.fn()`, `vi.spyOn()`, `vi.mock()`
4. **Testing Library**: Preferuj `getByRole()` dla dostępności
5. **Cleanup**: Automatyczny cleanup po każdym teście (skonfigurowany w `setup.ts`)

### Przykład testu komponentu

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen, userEvent } from '@/test/helpers/test-utils';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('should handle click events', async () => {
    // Arrange
    const handleClick = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<Button onClick={handleClick}>Click me</Button>);

    // Act
    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Przykład testu funkcji

```typescript
import { describe, it, expect } from 'vitest';
import { validateEmail } from '@/lib/utils/validation';

describe('validateEmail', () => {
  it('should validate correct email addresses', () => {
    // Arrange & Act & Assert
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid')).toBe(false);
  });
});
```

## 🎭 Testy E2E (Playwright)

### Uruchamianie

```bash
# Headless mode (domyślny)
npm run test:e2e

# Z interfejsem UI
npm run test:e2e:ui

# Tryb headed (widoczna przeglądarka)
npm run test:e2e:headed

# Tryb debug
npm run test:e2e:debug

# Raport z testów
npm run test:e2e:report
```

### Best Practices

1. **Page Object Model**: Enkapsulacja logiki stron w klasach
2. **Locators**: Preferuj `getByRole()` dla dostępności
3. **Waiting**: Używaj `waitForLoadState()`, `waitForResponse()`
4. **Izolacja**: Każdy test jest niezależny
5. **API Testing**: Kombinuj E2E z testami API

### Przykład Page Object

```typescript
import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.submitButton = page.getByRole('button', { name: /login/i });
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

### Przykład testu E2E

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';

test('should login with valid credentials', async ({ page }) => {
  // Arrange
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  // Act
  await loginPage.login('test@example.com', 'password123');

  // Assert
  await expect(page).toHaveURL(/\/app/);
});
```

## 🔧 Konfiguracja

### Vitest (`vitest.config.ts`)

- **Environment**: jsdom (dla testowania komponentów React)
- **Setup**: Automatyczny import `@testing-library/jest-dom`
- **Coverage**: v8 provider, raporty w HTML/JSON/Text
- **Aliases**: Skonfigurowany alias `@/*` zgodny z `tsconfig.json`

### Playwright (`playwright.config.ts`)

- **Browser**: Tylko Chromium (zgodnie z best practices)
- **Base URL**: `http://localhost:4321`
- **Trace**: Włączone przy ponownym uruchomieniu testu
- **Screenshots**: Tylko przy błędach
- **Video**: Zachowywane przy błędach
- **Web Server**: Automatyczne uruchamianie `npm run dev`

## 📊 Coverage

Aby wygenerować raport coverage:

```bash
npm run test:coverage
```

Raport będzie dostępny w `coverage/index.html`.

### Progi coverage (obecnie wyłączone)

Możesz włączyć progi coverage w `vitest.config.ts`:

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

## 🚀 CI/CD

### GitHub Actions (przykład)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:run
      
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
```

## 📝 Fixtures i Dane Testowe

Przykładowe dane znajdują się w `test/fixtures/test-data.ts`:

```typescript
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
};

export const mockFlashcard = {
  id: 'flashcard-1',
  front: 'Test Question',
  back: 'Test Answer',
  status: 'verified',
};
```

## 🔍 Debugowanie

### Vitest

```bash
# UI mode - najłatwiejszy sposób
npm run test:ui

# Watch mode z filtrem
npm run test:watch -- -t "nazwa testu"
```

### Playwright

```bash
# Debug mode
npm run test:e2e:debug

# Trace viewer (po uruchomieniu testów)
npx playwright show-trace test-results/trace.zip

# Headed mode (widoczna przeglądarka)
npm run test:e2e:headed
```

## 📚 Dodatkowe Zasoby

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)

## ⚠️ Ważne Uwagi

1. **Niektóre testy są oznaczone jako `test.skip`** - wymagają autentykacji lub fixtures
2. **Auth state**: Możesz zapisać stan autentykacji używając `page.context().storageState()`
3. **API Mocking**: W Playwright możesz mockować API używając `page.route()`
4. **Parallel Execution**: Playwright uruchamia testy równolegle (można wyłączyć w konfiguracji)

## 🎯 Następne Kroki

1. Usuń przykładowe testy i napisz własne
2. Skonfiguruj CI/CD
3. Włącz progi coverage gdy będziesz gotowy
4. Dodaj auth fixtures dla testów E2E
5. Rozważ dodanie visual regression testing

