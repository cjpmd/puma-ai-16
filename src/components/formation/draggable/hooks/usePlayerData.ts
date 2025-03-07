
import { useCallback } from "react";

interface UsePlayerDataProps {
  availablePlayers: any[];
  squadPlayers: string[];
}

export const usePlayerData = ({
  availablePlayers,
  squadPlayers
}: UsePlayerDataProps) => {
  // Get player data by ID
  const getPlayerById = useCallback((playerId: string) => {
    return availablePlayers.find(player => player.id === playerId);
  }, [availablePlayers]);

  // Get all available players
  const getAvailablePlayers = useCallback(() => {
    return availablePlayers;
  }, [availablePlayers]);

  // Get player data
  const getPlayer = useCallback((playerId: string) => {
    return availablePlayers.find(player => player.id === playerId);
  }, [availablePlayers]);

  // Get players available for squad selection
  const getAvailableSquadPlayers = useCallback(() => {
    return squadPlayers.length > 0
      ? availablePlayers.filter(player => squadPlayers.includes(player.id))
      : availablePlayers;
  }, [availablePlayers, squadPlayers]);

  return {
    getPlayerById,
    getAvailablePlayers,
    getPlayer,
    getAvailableSquadPlayers
  };
};
