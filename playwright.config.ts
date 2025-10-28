import { defineConfig, devices } from "@playwright/test";

/**
 * Konfiguracja Playwright dla testów E2E
 * Zgodnie z best practices używamy tylko przeglądarki Chromium
 */
export default defineConfig({
  // Katalog z testami E2E
  testDir: "./test/e2e",

  // Katalog na artefakty testowe
  outputDir: "./test-results",

  // Timeout dla pojedynczego testu (30 sekund)
  timeout: 30 * 1000,

  // Pełne wykonanie testów nawet po pierwszym błędzie
  fullyParallel: true,

  // Powtarzanie nieudanych testów
  retries: process.env.CI ? 2 : 0,

  // Liczba workerów (równoległe wykonywanie testów)
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [["html", { outputFolder: "./playwright-report" }], ["list"]],

  // Globalne ustawienia dla wszystkich projektów
  use: {
    // URL bazowy aplikacji
    baseURL: process.env.BASE_URL || "http://localhost:4321",

    // Trace przy niepowodzeniu (do debugowania)
    trace: "on-first-retry",

    // Screenshot przy niepowodzeniu
    screenshot: "only-on-failure",

    // Video przy niepowodzeniu
    video: "retain-on-failure",

    // Timeout dla akcji (np. click, fill)
    actionTimeout: 10 * 1000,
  },

  // Projekty testowe - tylko Chromium zgodnie z best practices
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Dodatkowe ustawienia dla Chromium
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  // Serwer deweloperski (opcjonalnie)
  webServer: {
    command: "npm run dev",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
