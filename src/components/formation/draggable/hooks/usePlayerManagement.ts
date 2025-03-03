
export const usePlayerManagement = (
  availablePlayers: any[],
  squadPlayers: string[] = [],
  selections: Record<string, { playerId: string; position: string }>
) => {
  // Get player object from ID
  const getPlayer = (playerId: string) => {
    return availablePlayers.find(p => p.id === playerId);
  };

  // Get all players assigned to positions
  const getAssignedPlayers = () => {
    return Object.values(selections).map(s => s.playerId);
  };

  // Get squad players that haven't been assigned yet
  const getAvailableSquadPlayers = () => {
    const assignedPlayerIds = new Set(getAssignedPlayers());
    // If squadPlayers is provided, filter by that, otherwise use all available players
    if (squadPlayers.length > 0) {
      return availablePlayers.filter(player => 
        squadPlayers.includes(player.id) && !assignedPlayerIds.has(player.id)
      );
    } else {
      return availablePlayers.filter(player => !assignedPlayerIds.has(player.id));
    }
  };

  return {
    getPlayer,
    getAssignedPlayers,
    getAvailableSquadPlayers
  };
};
