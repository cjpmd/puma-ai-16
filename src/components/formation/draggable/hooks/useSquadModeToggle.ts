
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

  const toggleSquadMode = () => {
    const newSquadMode = !squadMode;
    setSquadMode(newSquadMode);
    
    console.log(`Toggling squad mode from ${squadMode} to ${newSquadMode}`);
    
    if (onToggleSquadMode) {
      onToggleSquadMode(newSquadMode);
    }

    return newSquadMode;
  };

  const canExitSquadMode = squadPlayers.length > 0;

  return {
    squadMode,
    setSquadMode,
    toggleSquadMode,
    canExitSquadMode
  };
};
