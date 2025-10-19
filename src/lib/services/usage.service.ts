/**
 * Usage Service
 * 
 * Manages AI generation usage limits and tracking.
 * Enforces daily limits to control costs and prevent abuse.
 */

import type { SupabaseClient } from '../../db/supabase.client';
import { LimitExceededError } from '../errors/api-errors';
import type { UsageInfo } from '../../types';

/**
 * Daily limit for AI-generated flashcards per user
 * This limit resets at midnight UTC
 */
const DAILY_LIMIT = 100;

export class UsageService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Checks if user can generate more flashcards today and returns usage information
   * 
   * @param userId - UUID of the user to check limits for
   * @returns Object containing canGenerate flag and usage info
   * @throws {Error} If database query fails
   * 
   * Algorithm:
   * 1. Calculate today's date range (00:00:00 to 23:59:59 UTC)
   * 2. Count flashcards created today with ai_generated=true
   * 3. Compare count against DAILY_LIMIT
   * 4. Return usage statistics
   */
  async checkAndGetUsage(userId: string): Promise<{
    canGenerate: boolean;
    usageInfo: Omit<UsageInfo, 'generated_count'>;
  }> {
    // Get today's date in UTC
    const today = new Date();
    const startOfDay = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      0, 0, 0, 0
    )).toISOString();
    
    const endOfDay = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      23, 59, 59, 999
    )).toISOString();

    // Count AI-generated flashcards created today by this user
    const { count, error } = await this.supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('ai_generated', true)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);

    if (error) {
      console.error('Failed to check usage limits:', error);
      throw new Error('Failed to check usage limits');
    }

    const totalGeneratedToday = count || 0;
    const canGenerate = totalGeneratedToday < DAILY_LIMIT;

    return {
      canGenerate,
      usageInfo: {
        total_generated_today: totalGeneratedToday,
        daily_limit: DAILY_LIMIT,
      },
    };
  }

  /**
   * Calculates when the daily limit will reset (midnight UTC)
   * 
   * @returns ISO 8601 timestamp of next reset time
   * 
   * Example: If called on 2025-10-19 at any time, returns "2025-10-20T00:00:00.000Z"
   */
  getNextResetTime(): string {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow.toISOString();
  }

  /**
   * Throws LimitExceededError with detailed information
   * 
   * @param totalGeneratedToday - Current count of generated flashcards today
   * @throws {LimitExceededError} Always throws with usage details
   */
  throwLimitExceeded(totalGeneratedToday: number): never {
    throw new LimitExceededError('Daily AI generation limit exceeded', {
      daily_limit: DAILY_LIMIT,
      used_today: totalGeneratedToday,
      resets_at: this.getNextResetTime(),
    });
  }
}

