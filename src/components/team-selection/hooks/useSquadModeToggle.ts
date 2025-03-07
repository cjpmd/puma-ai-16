
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
    console.log(`team-selection/useSquadModeToggle - Toggling squad mode from ${!squadMode} to ${squadMode}, can exit: ${canExitSquadMode}`);
  }, [squadMode, canExitSquadMode]);
  
  const toggleSquadMode = () => {
    if (!squadMode || canExitSquadMode) {
      setSquadMode(!squadMode);
    }
  };
  
  return {
    squadMode,
    toggleSquadMode,
    canExitSquadMode,
    setSquadMode
  };
};
