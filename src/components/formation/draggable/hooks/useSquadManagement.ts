
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
  const [squadMode, setSquadMode] = useState<boolean>(forceSquadMode !== undefined ? forceSquadMode : true);

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
  
  // Sync squad mode from props
  useEffect(() => {
    if (forceSquadMode !== undefined && forceSquadMode !== squadMode) {
      console.log(`Forcing squad mode to: ${forceSquadMode}`);
      setSquadMode(forceSquadMode);
    }
  }, [forceSquadMode, squadMode]);

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

  // Toggle between squad selection and formation modes
  const toggleSquadMode = () => {
    console.log("Toggle squad mode called - current state:", squadMode);
    setSquadMode(prev => !prev);
  };

  // Return to squad selection mode
  const returnToSquadSelection = () => {
    console.log("Returning to squad selection");
    setSquadMode(true);
  };

  // Finish squad selection and move to position assignment
  const finishSquadSelection = () => {
    console.log("Finishing squad selection");
    if (squadPlayers.length > 0) {
      setSquadMode(false);
    }
  };

  return {
    squadPlayers,
    squadMode,
    addPlayerToSquad,
    removePlayerFromSquad,
    toggleSquadMode,
    returnToSquadSelection,
    finishSquadSelection
  };
};
