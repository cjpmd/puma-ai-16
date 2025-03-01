
/**
 * Formats the player display text showing name and squad number if available
 */
export const getPlayerDisplay = (player: { name: string; squad_number?: number }) => {
  return player ? `${player.name}${player.squad_number ? ` (${player.squad_number})` : ''}` : 'None';
};

/**
 * Checks if a player is a substitution compared to a previous period
 */
export const isPlayerSubstitution = (
  currentPeriodSelections: Record<string, { playerId: string; position: string }> | undefined,
  previousPeriodSelections: Record<string, { playerId: string; position: string }> | undefined,
  position: string
): boolean => {
  if (!currentPeriodSelections || !previousPeriodSelections) return false;
  
  // Find position in current and previous periods
  const currentPositionEntry = Object.entries(currentPeriodSelections).find(
    ([_, selection]) => selection.position === position
  );
  
  const previousPositionEntry = Object.entries(previousPeriodSelections).find(
    ([_, selection]) => selection.position === position
  );
  
  // If the position exists in both periods and the player IDs are different, it's a substitution
  if (currentPositionEntry && previousPositionEntry) {
    return currentPositionEntry[1].playerId !== previousPositionEntry[1].playerId 
      && currentPositionEntry[1].playerId !== 'unassigned'
      && previousPositionEntry[1].playerId !== 'unassigned';
  }
  
  // If the position exists in the current period but not in the previous, it's a new player (not a sub)
  return false;
};
