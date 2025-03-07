
import { useState, useEffect } from "react";

interface UseSquadManagementProps {
  initialSquadPlayers: string[];
  onSquadPlayersChange?: (playerIds: string[]) => void;
  forceSquadMode?: boolean;
}

export const useSquadManagement = ({
  initialSquadPlayers,
  onSquadPlayersChange,
  forceSquadMode
}: UseSquadManagementProps) => {
  const [squadPlayers, setSquadPlayers] = useState<string[]>(initialSquadPlayers || []);
  
  // Sync squad players from props
  useEffect(() => {
    if (initialSquadPlayers && initialSquadPlayers.length > 0) {
      // Sort for consistent comparison
      const sortedSquadPlayers = [...initialSquadPlayers].sort();
      const sortedLocalPlayers = [...squadPlayers].sort();
      
      // Only update if there's an actual difference
      if (JSON.stringify(sortedSquadPlayers) !== JSON.stringify(sortedLocalPlayers)) {
        console.log("Syncing squad players from props:", initialSquadPlayers);
        setSquadPlayers(initialSquadPlayers);
      }
    }
  }, [initialSquadPlayers, squadPlayers]);

  // Add a player to the squad
  const addPlayerToSquad = (playerId: string) => {
    if (!squadPlayers.includes(playerId)) {
      const updatedSquad = [...squadPlayers, playerId];
      console.log("Adding player to squad:", playerId, updatedSquad);
      setSquadPlayers(updatedSquad);
      
      if (onSquadPlayersChange) {
        onSquadPlayersChange(updatedSquad);
      }
    }
  };

  // Remove a player from the squad
  const removePlayerFromSquad = (playerId: string) => {
    if (squadPlayers.includes(playerId)) {
      const updatedSquad = squadPlayers.filter(id => id !== playerId);
      console.log("Removing player from squad:", playerId, updatedSquad);
      setSquadPlayers(updatedSquad);
      
      if (onSquadPlayersChange) {
        onSquadPlayersChange(updatedSquad);
      }
    }
  };

  return {
    squadPlayers,
    addPlayerToSquad,
    removePlayerFromSquad
  };
};
