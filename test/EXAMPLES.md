# Przykłady Testów - Szybki Reference

## 🧪 Testy Jednostkowe (Vitest)

### 1. Test prostej funkcji

```typescript
// test/unit/lib/utils/myFunction.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/utils/myFunction';

describe('myFunction', () => {
  it('should return expected value', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### 2. Test z mockami

```typescript
// test/unit/lib/services/api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchData } from '@/lib/services/api';

// Mock fetch globalnie
global.fetch = vi.fn();

describe('fetchData', () => {
  beforeEach(() => {
    // Reset mocków przed każdym testem
    vi.clearAllMocks();
  });

  it('should fetch data successfully', async () => {
    // Arrange
    const mockData = { id: 1, name: 'Test' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });
    
    // Act
    const result = await fetchData('/api/test');
    
    // Assert
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith('/api/test');
  });

  it('should handle errors', async () => {
    // Arrange
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
    
    // Act & Assert
    await expect(fetchData('/api/test')).rejects.toThrow('Network error');
  });
});
```

### 3. Test komponentu React

```typescript
// test/unit/components/MyComponent.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen, userEvent } from '@/test/helpers/test-utils';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render with props', () => {
    // Arrange & Act
    renderWithProviders(<MyComponent title="Test Title" />);
    
    // Assert
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    // Arrange
    const handleClick = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<MyComponent onClick={handleClick} />);
    
    // Act
    await user.click(screen.getByRole('button'));
    
    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should update on prop change', () => {
    // Arrange
    const { rerender } = renderWithProviders(<MyComponent count={0} />);
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
    
    // Act
    rerender(<MyComponent count={5} />);
    
    // Assert
    expect(screen.getByText('Count: 5')).toBeInTheDocument();
  });
});
```

### 4. Test z vi.mock()

```typescript
// test/unit/lib/services/userService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { getUserById } from '@/lib/services/userService';

// Mock całego modułu
vi.mock('@/lib/api/users', () => ({
  fetchUser: vi.fn(),
}));

import { fetchUser } from '@/lib/api/users';

describe('getUserById', () => {
  it('should call fetchUser with correct id', async () => {
    // Arrange
    const mockUser = { id: '123', name: 'John' };
    (fetchUser as any).mockResolvedValueOnce(mockUser);
    
    // Act
    const result = await getUserById('123');
    
    // Assert
    expect(fetchUser).toHaveBeenCalledWith('123');
    expect(result).toEqual(mockUser);
  });
});
```

### 5. Test ze snapshot

```typescript
// test/unit/components/Card.test.tsx
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/test/helpers/test-utils';
import { Card } from '@/components/ui/card';

describe('Card', () => {
  it('should match snapshot', () => {
    // Arrange & Act
    const { container } = renderWithProviders(
      <Card>
        <h2>Title</h2>
        <p>Content</p>
      </Card>
    );
    
    // Assert
    expect(container.firstChild).toMatchSnapshot();
  });
});
```

### 6. Test async funkcji

```typescript
// test/unit/lib/services/dataService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { processData } from '@/lib/services/dataService';

describe('processData', () => {
  it('should process data asynchronously', async () => {
    // Arrange
    const input = [1, 2, 3];
    
    // Act
    const result = await processData(input);
    
    // Assert
    expect(result).toEqual([2, 4, 6]);
  });

  it('should timeout after 5 seconds', async () => {
    // Arrange
    vi.useFakeTimers();
    const promise = processData([1, 2, 3]);
    
    // Act
    vi.advanceTimersByTime(5000);
    
    // Assert
    await expect(promise).rejects.toThrow('Timeout');
    vi.useRealTimers();
  });
});
```

## 🎭 Testy E2E (Playwright)

### 1. Prosty test nawigacji

```typescript
// test/e2e/navigation.spec.ts
import { test, expect } from '@playwright/test';

test('should navigate to about page', async ({ page }) => {
  // Arrange
  await page.goto('/');
  
  // Act
  await page.getByRole('link', { name: /about/i }).click();
  
  // Assert
  await expect(page).toHaveURL('/about');
  await expect(page.getByRole('heading', { name: /about us/i })).toBeVisible();
});
```

### 2. Test z formularzem

```typescript
// test/e2e/contact-form.spec.ts
import { test, expect } from '@playwright/test';

test('should submit contact form', async ({ page }) => {
  // Arrange
  await page.goto('/contact');
  
  // Act
  await page.getByLabel(/name/i).fill('John Doe');
  await page.getByLabel(/email/i).fill('john@example.com');
  await page.getByLabel(/message/i).fill('Test message');
  await page.getByRole('button', { name: /send/i }).click();
  
  // Assert
  await expect(page.getByText(/message sent/i)).toBeVisible();
});
```

### 3. Test z Page Object Model

```typescript
// test/e2e/pages/contact.page.ts
import { type Page, type Locator } from '@playwright/test';

export class ContactPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly messageInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByLabel(/name/i);
    this.emailInput = page.getByLabel(/email/i);
    this.messageInput = page.getByLabel(/message/i);
    this.submitButton = page.getByRole('button', { name: /send/i });
  }

  async goto() {
    await this.page.goto('/contact');
  }

  async fillForm(name: string, email: string, message: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.messageInput.fill(message);
  }

  async submit() {
    await this.submitButton.click();
  }
}

// test/e2e/contact.spec.ts
import { test, expect } from '@playwright/test';
import { ContactPage } from './pages/contact.page';

test('should submit form using POM', async ({ page }) => {
  const contactPage = new ContactPage(page);
  await contactPage.goto();
  await contactPage.fillForm('John', 'john@example.com', 'Test');
  await contactPage.submit();
  
  await expect(page.getByText(/message sent/i)).toBeVisible();
});
```

### 4. Test z API mockingiem

```typescript
// test/e2e/api-mock.spec.ts
import { test, expect } from '@playwright/test';

test('should handle API error', async ({ page }) => {
  // Arrange - mock API
  await page.route('**/api/data', (route) => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Server error' }),
    });
  });
  
  // Act
  await page.goto('/dashboard');
  
  // Assert
  await expect(page.getByText(/error loading data/i)).toBeVisible();
});

test('should use mocked data', async ({ page }) => {
  // Arrange
  const mockData = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ];
  
  await page.route('**/api/items', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockData),
    });
  });
  
  // Act
  await page.goto('/items');
  
  // Assert
  await expect(page.getByText('Item 1')).toBeVisible();
  await expect(page.getByText('Item 2')).toBeVisible();
});
```

### 5. Test z czekaniem na request/response

```typescript
// test/e2e/data-loading.spec.ts
import { test, expect } from '@playwright/test';

test('should load data from API', async ({ page }) => {
  // Arrange
  const responsePromise = page.waitForResponse('**/api/data');
  
  // Act
  await page.goto('/dashboard');
  const response = await responsePromise;
  
  // Assert
  expect(response.status()).toBe(200);
  await expect(page.getByRole('list')).toBeVisible();
});

test('should submit data to API', async ({ page }) => {
  // Arrange
  await page.goto('/form');
  
  const requestPromise = page.waitForRequest('**/api/submit');
  
  // Act
  await page.getByLabel(/name/i).fill('John');
  await page.getByRole('button', { name: /submit/i }).click();
  
  const request = await requestPromise;
  
  // Assert
  expect(request.method()).toBe('POST');
  const postData = request.postDataJSON();
  expect(postData).toHaveProperty('name', 'John');
});
```

### 6. Test z autentykacją (storage state)

```typescript
// test/e2e/auth.setup.ts
import { test as setup } from '@playwright/test';

const authFile = 'test/fixtures/auth-state.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('test@example.com');
  await page.getByLabel(/password/i).fill('password123');
  await page.getByRole('button', { name: /login/i }).click();
  
  await page.waitForURL('/dashboard');
  
  // Zapisz stan autentykacji
  await page.context().storageState({ path: authFile });
});

// test/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.use({ storageState: 'test/fixtures/auth-state.json' });

test('should access protected page', async ({ page }) => {
  // User jest już zalogowany dzięki storageState
  await page.goto('/dashboard');
  await expect(page.getByText(/welcome/i)).toBeVisible();
});
```

### 7. Visual regression test

```typescript
// test/e2e/visual.spec.ts
import { test, expect } from '@playwright/test';

test('should match homepage screenshot', async ({ page }) => {
  // Arrange
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Assert
  await expect(page).toHaveScreenshot('homepage.png', {
    fullPage: true,
    maxDiffPixels: 100,
  });
});

test('should match component screenshot', async ({ page }) => {
  await page.goto('/components');
  
  const button = page.getByRole('button', { name: /primary/i });
  await expect(button).toHaveScreenshot('primary-button.png');
});
```

## 🎯 Przydatne Matchery

### Vitest

```typescript
// Equality
expect(value).toBe(expected)
expect(value).toEqual(expected)
expect(value).toStrictEqual(expected)

// Truthiness
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeNull()
expect(value).toBeUndefined()
expect(value).toBeDefined()

// Numbers
expect(value).toBeGreaterThan(3)
expect(value).toBeGreaterThanOrEqual(3)
expect(value).toBeLessThan(5)
expect(value).toBeLessThanOrEqual(4)
expect(value).toBeCloseTo(0.3, 5)

// Strings
expect(text).toMatch(/pattern/)
expect(text).toContain('substring')

// Arrays
expect(array).toContain(item)
expect(array).toHaveLength(3)
expect(array).toContainEqual(object)

// Objects
expect(obj).toHaveProperty('key')
expect(obj).toMatchObject({ key: 'value' })

// Functions
expect(fn).toHaveBeenCalled()
expect(fn).toHaveBeenCalledTimes(2)
expect(fn).toHaveBeenCalledWith(arg1, arg2)
expect(fn).toHaveReturnedWith(value)

// Testing Library
expect(element).toBeInTheDocument()
expect(element).toBeVisible()
expect(element).toBeDisabled()
expect(element).toHaveTextContent('text')
expect(element).toHaveClass('className')
expect(element).toHaveAttribute('attr', 'value')
```

### Playwright

```typescript
// Visibility
await expect(locator).toBeVisible()
await expect(locator).toBeHidden()
await expect(locator).toBeAttached()

// State
await expect(locator).toBeEnabled()
await expect(locator).toBeDisabled()
await expect(locator).toBeChecked()
await expect(locator).toBeFocused()

// Content
await expect(locator).toHaveText('text')
await expect(locator).toContainText('text')
await expect(locator).toHaveValue('value')

// Attributes
await expect(locator).toHaveAttribute('name', 'value')
await expect(locator).toHaveClass('className')
await expect(locator).toHaveId('id')

// Count
await expect(locator).toHaveCount(3)

// URL
await expect(page).toHaveURL('url')
await expect(page).toHaveTitle('title')

// Screenshot
await expect(page).toHaveScreenshot('name.png')
```

## 💡 Wskazówki

### Vitest
- Używaj `describe` do grupowania testów
- Używaj `beforeEach`/`afterEach` dla setup/cleanup
- Preferuj `getByRole()` z Testing Library
- Mock tylko to co jest potrzebne
- Używaj `vi.clearAllMocks()` w `beforeEach`

### Playwright
- Zawsze używaj Page Object Model dla złożonych stron
- Preferuj `getByRole()` dla dostępności
- Używaj `waitForLoadState('networkidle')` dla SPA
- Mockuj API gdy to możliwe dla szybszych testów
- Zapisuj storage state dla testów wymagających autentykacji


