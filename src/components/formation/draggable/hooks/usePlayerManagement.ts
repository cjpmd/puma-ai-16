
interface UsePlayerManagementProps {
  availablePlayers: any[];
  squadPlayers: string[];
  selections: Record<string, { playerId: string; position: string }>;
}

export const usePlayerManagement = ({
  availablePlayers,
  squadPlayers,
  selections
}: UsePlayerManagementProps) => {
  // Get player data by ID
  const getPlayer = (playerId: string) => {
    return availablePlayers.find(player => player.id === playerId);
  };

  // Get available players for the squad that aren't already selected
  const getAvailableSquadPlayers = () => {
    // If squadPlayers is provided, filter to only those players
    const eligiblePlayers = squadPlayers.length > 0
      ? availablePlayers.filter(player => squadPlayers.includes(player.id))
      : availablePlayers;
    
    // Get all player IDs that are currently selected
    const selectedPlayerIds = new Set(
      Object.values(selections).map(selection => selection.playerId)
    );
    
    // Filter out players that are already selected
    return eligiblePlayers.filter(player => !selectedPlayerIds.has(player.id));
  };

  return {
    getPlayer,
    getAvailableSquadPlayers
  };
};
