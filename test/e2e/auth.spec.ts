/**
 * E2E Test - Authentication Flow
 * 
 * Best practices demonstrowane tutaj:
 * - Page Object Model usage
 * - Setup and teardown hooks
 * - API testing for setup
 * - Browser contexts for isolation
 * - Screenshot on failure (configured in playwright.config.ts)
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { DashboardPage } from './pages/dashboard.page';

test.describe('Authentication', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    // Initialize Page Objects
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('should display login form', async ({ page }) => {
    // Arrange
    await loginPage.goto();

    // Assert
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Arrange
    await loginPage.goto();

    // Act
    await loginPage.login('invalid@example.com', 'wrongpassword');

    // Assert
    await expect(loginPage.errorMessage).toBeVisible();
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain('Invalid');
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Arrange
    await loginPage.goto();

    // Act
    await loginPage.submit();

    // Assert - formularz powinien pokazać błędy walidacji
    await expect(page.getByText(/email.*wymagany|email.*required/i)).toBeVisible();
    await expect(page.getByText(/hasło.*wymagane|password.*required/i)).toBeVisible();
  });

  test('should navigate to forgot password page', async ({ page }) => {
    // Arrange
    await loginPage.goto();

    // Act
    await loginPage.clickForgotPassword();

    // Assert
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test('should navigate to register page', async ({ page }) => {
    // Arrange
    await loginPage.goto();

    // Act
    await loginPage.clickRegister();

    // Assert
    await expect(page).toHaveURL(/\/register/);
  });

  test.describe('Authenticated user', () => {
    test.use({
      storageState: 'test/fixtures/auth-state.json', // Można zapisać stan po zalogowaniu
    });

    test.skip('should access dashboard when logged in', async ({ page }) => {
      // Ten test wymaga wcześniejszego zapisania stanu autentykacji
      // Możesz go uruchomić po utworzeniu fixtures/auth-state.json
      
      // Arrange & Act
      await dashboardPage.goto();

      // Assert
      await expect(dashboardPage.welcomeMessage).toBeVisible();
      expect(await dashboardPage.isLoggedIn()).toBe(true);
    });
  });

  test('should prevent access to protected routes when not logged in', async ({ page }) => {
    // Arrange & Act
    await page.goto('/app');

    // Assert - powinno przekierować na stronę logowania
    await expect(page).toHaveURL(/\/login/);
  });
});

