
import { useState, useEffect } from "react";

interface UseSquadModeToggleProps {
  initialSquadMode?: boolean;
  onToggleSquadMode?: (isSquadMode: boolean) => void;
  squadPlayers: string[];
}

export const useSquadModeToggle = ({
  initialSquadMode = true,
  onToggleSquadMode,
  squadPlayers
}: UseSquadModeToggleProps) => {
  const [squadMode, setSquadMode] = useState(initialSquadMode);

  // Handle external updates to squad mode
  useEffect(() => {
    if (initialSquadMode !== undefined && initialSquadMode !== squadMode) {
      setSquadMode(initialSquadMode);
    }
  }, [initialSquadMode, squadMode]);

  // Calculate if we can exit squad mode
  const canExitSquadMode = squadPlayers.length > 0;

  // Toggle squad mode only if allowed
  const toggleSquadMode = () => {
    // If trying to exit squad mode, check if we have players
    if (squadMode && !canExitSquadMode) {
      console.log("Cannot exit squad mode - no players selected");
      return squadMode; // Don't change the mode
    }

    const newSquadMode = !squadMode;
    console.log(`useSquadModeToggle - Toggling squad mode from ${squadMode} to ${newSquadMode}`);
    setSquadMode(newSquadMode);
    
    if (onToggleSquadMode) {
      onToggleSquadMode(newSquadMode);
    }

    return newSquadMode;
  };

  return {
    squadMode,
    setSquadMode,
    toggleSquadMode,
    canExitSquadMode
  };
};
