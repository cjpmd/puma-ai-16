
import { useState, useEffect } from "react";

interface UseSquadModeToggleProps {
  initialSquadMode?: boolean;
  squadPlayers: string[];
  minRequiredPlayers?: number;
}

export const useSquadModeToggle = ({
  initialSquadMode = true,
  squadPlayers,
  minRequiredPlayers = 1
}: UseSquadModeToggleProps) => {
  const [squadMode, setSquadMode] = useState<boolean>(initialSquadMode);
  
  // Determine if we can exit squad mode (need at least minRequiredPlayers in squad)
  const canExitSquadMode = squadPlayers.length >= minRequiredPlayers;
  
  // Log when squad mode changes
  useEffect(() => {
    console.log(`team-selection/useSquadModeToggle - Squad mode: ${squadMode}, can exit: ${canExitSquadMode}, players: ${squadPlayers.length}`);
  }, [squadMode, canExitSquadMode, squadPlayers.length]);
  
  const toggleSquadMode = () => {
    if (!squadMode || canExitSquadMode) {
      console.log(`team-selection/useSquadModeToggle - Toggling squad mode from ${squadMode} to ${!squadMode}`);
      setSquadMode(!squadMode);
    } else {
      console.log(`team-selection/useSquadModeToggle - Cannot exit squad mode, need at least ${minRequiredPlayers} player(s)`);
    }
  };
  
  return {
    squadMode,
    toggleSquadMode,
    canExitSquadMode,
    setSquadMode
  };
};
