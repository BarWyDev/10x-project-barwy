/**
 * Page Object Model - Dashboard Page
 *
 * Best practices demonstrowane tutaj:
 * - Page Object Model for complex pages
 * - Component-based locators
 * - Waiting strategies
 */

import { type Page, type Locator } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly welcomeMessage: Locator;
  readonly deckSelector: Locator;
  readonly generateButton: Locator;
  readonly flashcardList: Locator;
  readonly logoutButton: Locator;
  readonly usageLimitIndicator: Locator;

  constructor(page: Page) {
    this.page = page;

    // Locators
    this.welcomeMessage = page.getByRole("heading", { name: /witaj|welcome/i });
    this.deckSelector = page.getByRole("combobox", { name: /wybierz talię|select deck/i });
    this.generateButton = page.getByRole("button", { name: /generuj|generate/i });
    this.flashcardList = page.getByRole("list", { name: /fiszki|flashcards/i });
    this.logoutButton = page.getByRole("button", { name: /wyloguj|logout/i });
    this.usageLimitIndicator = page.getByText(/wykorzystanie|usage/i);
  }

  /**
   * Navigate to dashboard
   */
  async goto() {
    await this.page.goto("/app");
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Check if user is logged in (by checking welcome message)
   */
  async isLoggedIn() {
    return await this.welcomeMessage.isVisible();
  }

  /**
   * Select deck from dropdown
   */
  async selectDeck(deckName: string) {
    await this.deckSelector.click();
    await this.page.getByRole("option", { name: deckName }).click();
  }

  /**
   * Click generate flashcards button
   */
  async clickGenerate() {
    await this.generateButton.click();
  }

  /**
   * Get number of flashcards in list
   */
  async getFlashcardCount() {
    const items = await this.page.getByRole("listitem").count();
    return items;
  }

  /**
   * Logout from dashboard
   */
  async logout() {
    await this.logoutButton.click();
    await this.page.waitForURL("/login");
  }

  /**
   * Wait for flashcard generation to complete
   */
  async waitForGeneration() {
    await this.page.waitForResponse(
      (response) => response.url().includes("/api/flashcards/generate") && response.status() === 200
    );
  }
}
