
import { useState, useEffect } from "react";

interface UseSquadModeToggleProps {
  initialSquadMode: boolean;
  squadPlayers: string[];
}

export const useSquadModeToggle = ({
  initialSquadMode,
  squadPlayers
}: UseSquadModeToggleProps) => {
  const [squadMode, setSquadMode] = useState<boolean>(initialSquadMode);

  // If we have no squad players, force squad mode to true
  useEffect(() => {
    if (squadPlayers.length === 0 && !squadMode) {
      console.log("No squad players, forcing squad mode to true");
      setSquadMode(true);
    }
  }, [squadPlayers, squadMode]);

  // Toggle function for squad mode
  const toggleSquadMode = () => {
    console.log(`Toggling squad mode from ${squadMode} to ${!squadMode}`);
    setSquadMode(prev => !prev);
  };

  return {
    squadMode,
    setSquadMode,
    toggleSquadMode
  };
};
