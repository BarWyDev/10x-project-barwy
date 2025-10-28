/**
 * Test utilities - pomocnicze funkcje do testowania komponentów React
 */

import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

/**
 * Custom render z providerami
 * Można tu dodać contexty, które są potrzebne w aplikacji
 */
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { ...options });
}

// Re-export wszystkiego z testing-library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
