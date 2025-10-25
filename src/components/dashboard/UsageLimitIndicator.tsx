/**
 * UsageLimitIndicator Component
 * 
 * Displays the current usage of daily AI generation limit as a progress bar
 * with color-coded indicators based on usage percentage.
 */

import { Progress } from '@/components/ui/progress';
import { calculateUsagePercentage, getUsageColor } from '@/lib/utils/validation';
import type { UsageInfo } from '@/types';

export interface UsageLimitIndicatorProps {
  usageInfo: UsageInfo;
  className?: string;
}

export function UsageLimitIndicator({ usageInfo, className }: UsageLimitIndicatorProps) {
  const percentage = calculateUsagePercentage(
    usageInfo.total_generated_today,
    usageInfo.daily_limit
  );
  const colorType = getUsageColor(percentage);

  // Color mapping for Tailwind classes
  const colorClasses = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  };

  const progressColorClasses = {
    success: '[&>div]:bg-green-500',
    warning: '[&>div]:bg-yellow-500',
    danger: '[&>div]:bg-red-500',
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Dzienny limit generowania AI
        </span>
        <span className={`text-sm font-semibold ${colorClasses[colorType]}`}>
          {usageInfo.total_generated_today} / {usageInfo.daily_limit}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={`h-2 ${progressColorClasses[colorType]}`}
        aria-label={`Wykorzystano ${usageInfo.total_generated_today} z ${usageInfo.daily_limit} dziennych generacji`}
      />
      <p className="text-xs text-gray-500 mt-1">
        {percentage < 100 
          ? `Pozostało ${usageInfo.daily_limit - usageInfo.total_generated_today} generacji`
          : 'Limit dzienny osiągnięty. Spróbuj ponownie jutro o 00:00.'
        }
      </p>
    </div>
  );
}

