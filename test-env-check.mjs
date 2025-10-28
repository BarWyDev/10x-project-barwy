#!/usr/bin/env node

/**
 * Skrypt do weryfikacji środowiska testowego
 * Sprawdza czy wszystkie komponenty są zainstalowane i działają poprawnie
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkFile(path, description) {
  const fullPath = join(__dirname, path);
  const exists = existsSync(fullPath);
  log(`${exists ? "✅" : "❌"} ${description}: ${path}`, exists ? colors.green : colors.red);
  return exists;
}

function runCommand(command, description) {
  try {
    log(`\n🔍 Sprawdzam: ${description}`, colors.cyan);
    const output = execSync(command, { encoding: "utf-8", stdio: "pipe" });
    log(`✅ ${description} - OK`, colors.green);
    return true;
  } catch (error) {
    log(`❌ ${description} - BŁĄD`, colors.red);
    return false;
  }
}

console.log("\n" + "=".repeat(60));
log("🧪 WERYFIKACJA ŚRODOWISKA TESTOWEGO", colors.blue);
console.log("=".repeat(60) + "\n");

// Sprawdzenie plików konfiguracyjnych
log("📁 Pliki konfiguracyjne:", colors.yellow);
const configFiles = [
  checkFile("vitest.config.ts", "Vitest config"),
  checkFile("playwright.config.ts", "Playwright config"),
  checkFile("test/setup.ts", "Vitest setup"),
  checkFile("test/README.md", "Dokumentacja testów"),
  checkFile("TESTING.md", "Podsumowanie testów"),
];

// Sprawdzenie struktury katalogów
log("\n📂 Struktura katalogów:", colors.yellow);
const directories = [
  checkFile("test/unit", "Katalog testów jednostkowych"),
  checkFile("test/e2e", "Katalog testów E2E"),
  checkFile("test/fixtures", "Katalog fixtures"),
  checkFile("test/helpers", "Katalog helpers"),
  checkFile("test/e2e/pages", "Katalog Page Objects"),
];

// Sprawdzenie przykładowych testów
log("\n📝 Przykładowe testy:", colors.yellow);
const testFiles = [
  checkFile("test/unit/lib/validation/auth.schemas.test.ts", "Test schematów auth"),
  checkFile("test/unit/lib/utils/validation.test.ts", "Test funkcji validation"),
  checkFile("test/unit/components/ui/button.test.tsx", "Test komponentu Button"),
  checkFile("test/e2e/auth.spec.ts", "Test E2E - autentykacja"),
  checkFile("test/e2e/flashcards.spec.ts", "Test E2E - fiszki"),
];

// Sprawdzenie Page Objects
log("\n🎭 Page Object Models:", colors.yellow);
const pageObjects = [
  checkFile("test/e2e/pages/login.page.ts", "LoginPage POM"),
  checkFile("test/e2e/pages/dashboard.page.ts", "DashboardPage POM"),
];

// Sprawdzenie instalacji pakietów
log("\n📦 Pakiety npm:", colors.yellow);
const packages = [
  runCommand("npm list vitest --depth=0", "Vitest"),
  runCommand("npm list @playwright/test --depth=0", "Playwright"),
  runCommand("npm list @testing-library/react --depth=0", "Testing Library React"),
  runCommand("npm list @vitest/ui --depth=0", "Vitest UI"),
];

// Sprawdzenie skryptów
log("\n⚙️  Dostępne skrypty npm:", colors.yellow);
try {
  const packageJson = JSON.parse(execSync("cat package.json", { encoding: "utf-8" }));
  const testScripts = Object.keys(packageJson.scripts).filter((key) => key.startsWith("test"));
  testScripts.forEach((script) => {
    log(`✅ npm run ${script}`, colors.green);
  });
} catch (error) {
  log("❌ Nie można odczytać package.json", colors.red);
}

// Podsumowanie
console.log("\n" + "=".repeat(60));
const allChecks = [...configFiles, ...directories, ...testFiles, ...pageObjects, ...packages];
const passed = allChecks.filter(Boolean).length;
const total = allChecks.length;
const percentage = Math.round((passed / total) * 100);

if (percentage === 100) {
  log(`✅ WSZYSTKO OK! (${passed}/${total} - ${percentage}%)`, colors.green);
  log("\n🎉 Środowisko testowe jest w pełni skonfigurowane!", colors.green);
  log("\nMożesz uruchomić:", colors.cyan);
  log("  npm run test:watch    - Vitest w trybie watch", colors.cyan);
  log("  npm run test:ui       - Vitest UI", colors.cyan);
  log("  npm run test:e2e:ui   - Playwright UI", colors.cyan);
} else {
  log(`⚠️  UWAGA! Przeszło tylko ${passed}/${total} sprawdzeń (${percentage}%)`, colors.yellow);
}
console.log("=".repeat(60) + "\n");
