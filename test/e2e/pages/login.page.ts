/**
 * Page Object Model - Login Page
 * 
 * Best practices demonstrowane tutaj:
 * - Page Object Model pattern
 * - Encapsulation of page interactions
 * - Reusable locators
 * - Type-safe page methods
 */

import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Locators - preferujemy getByRole dla dostępności
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/hasło|password/i);
    this.submitButton = page.getByRole('button', { name: /zaloguj|login/i });
    this.errorMessage = page.getByRole('alert');
    this.forgotPasswordLink = page.getByRole('link', { name: /zapomniałem hasła|forgot password/i });
    this.registerLink = page.getByRole('link', { name: /zarejestruj|register/i });
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill login form
   */
  async fillForm(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Submit login form
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Perform complete login action
   */
  async login(email: string, password: string) {
    await this.fillForm(email, password);
    await this.submit();
  }

  /**
   * Check if error message is visible
   */
  async hasError() {
    return await this.errorMessage.isVisible();
  }

  /**
   * Get error message text
   */
  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  /**
   * Click register link
   */
  async clickRegister() {
    await this.registerLink.click();
  }
}


