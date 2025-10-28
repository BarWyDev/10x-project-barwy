/**
 * CharacterCounter Component
 *
 * Displays character count for text inputs with color-coded indication
 * based on proximity to the maximum limit.
 */

export interface CharacterCounterProps {
  current: number;
  max: number;
  className?: string;
}

export function CharacterCounter({ current, max, className }: CharacterCounterProps) {
  const percentage = (current / max) * 100;

  // Color coding based on usage
  const getColorClass = () => {
    if (percentage >= 100) return "text-red-600 font-semibold";
    if (percentage >= 90) return "text-orange-600 font-medium";
    if (percentage >= 75) return "text-yellow-600";
    return "text-gray-500";
  };

  return (
    <span
      className={`text-xs ${getColorClass()} ${className || ""}`}
      aria-live="polite"
      aria-label={`Liczba znaków: ${current} z ${max}`}
    >
      {current} / {max}
    </span>
  );
}
