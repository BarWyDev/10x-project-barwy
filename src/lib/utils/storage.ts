/**
 * Storage Utilities
 *
 * This module provides functions for managing sessionStorage,
 * particularly for passing verification data between pages.
 */

import type { FlashcardProposal, UsageInfo } from "../../types";

/**
 * Verification data structure stored in sessionStorage
 */
export interface VerificationData {
  proposals: FlashcardProposal[];
  deckId: string;
  usageInfo?: UsageInfo;
  timestamp: number;
}

/**
 * Storage key for verification data
 */
const VERIFICATION_DATA_KEY = "verification_proposals";

/**
 * Maximum age of stored data (30 minutes in milliseconds)
 */
const MAX_DATA_AGE = 30 * 60 * 1000;

/**
 * Save verification data to sessionStorage
 *
 * @param data - Verification data to save
 */
export function saveVerificationData(data: Omit<VerificationData, "timestamp">): void {
  try {
    const storageData: VerificationData = {
      ...data,
      timestamp: Date.now(),
    };

    sessionStorage.setItem(VERIFICATION_DATA_KEY, JSON.stringify(storageData));
  } catch (error) {
    console.error("Failed to save verification data to sessionStorage:", error);
  }
}

/**
 * Load verification data from sessionStorage
 *
 * @returns VerificationData if found and valid, null otherwise
 */
export function loadVerificationData(): VerificationData | null {
  try {
    const stored = sessionStorage.getItem(VERIFICATION_DATA_KEY);

    if (!stored) {
      return null;
    }

    const data: VerificationData = JSON.parse(stored);

    // Check if data is too old
    const age = Date.now() - data.timestamp;
    if (age > MAX_DATA_AGE) {
      clearVerificationData();
      return null;
    }

    // Validate data structure
    if (!data.proposals || !Array.isArray(data.proposals) || !data.deckId) {
      clearVerificationData();
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to load verification data from sessionStorage:", error);
    clearVerificationData();
    return null;
  }
}

/**
 * Clear verification data from sessionStorage
 */
export function clearVerificationData(): void {
  try {
    sessionStorage.removeItem(VERIFICATION_DATA_KEY);
  } catch (error) {
    console.error("Failed to clear verification data from sessionStorage:", error);
  }
}

/**
 * Check if verification data exists and is valid
 *
 * @returns true if valid data exists
 */
export function hasVerificationData(): boolean {
  return loadVerificationData() !== null;
}
