
/**
 * Gets a display name for a period based on its ID or number
 */
export const getPeriodDisplayName = (periodId?: number, periodNumber?: number): string => {
  if (periodId) {
    if (periodId === 100) return "First Half";
    if (periodId === 200) return "Second Half";
    return `Period ${periodId}`;
  }
  return periodNumber === 1 ? 'First Half' : 'Second Half';
};
