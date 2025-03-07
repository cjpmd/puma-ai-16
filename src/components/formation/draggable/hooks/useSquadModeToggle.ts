
import { useState, useEffect } from "react";

interface UseSquadModeToggleProps {
  initialSquadMode?: boolean;
  squadPlayers: string[];
}

export const useSquadModeToggle = ({ 
  initialSquadMode = true, 
  squadPlayers 
}: UseSquadModeToggleProps) => {
  const [squadMode, setSquadMode] = useState<boolean>(initialSquadMode);
  
  // Determine if we can exit squad mode (need at least one player in squad)
  const canExitSquadMode = squadPlayers.length > 0;
  
  // Log when squad mode changes
  useEffect(() => {
    console.log(`useSquadModeToggle - Toggling squad mode from ${!squadMode} to ${squadMode}`);
  }, [squadMode]);
  
  const toggleSquadMode = () => {
    if (!squadMode || canExitSquadMode) {
      setSquadMode(!squadMode);
    }
  };
  
  return {
    squadMode,
    toggleSquadMode,
    canExitSquadMode
  };
};
