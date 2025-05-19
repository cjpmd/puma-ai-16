
import { useState } from "react";

export const useTeamSelection = () => {
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());

  const addSelectedPlayer = (playerId: string) => {
    setSelectedPlayers(prev => new Set([...prev, playerId]));
  };

  const removeSelectedPlayer = (playerId: string) => {
    setSelectedPlayers(prev => {
      const newSet = new Set(prev);
      newSet.delete(playerId);
      return newSet;
    });
  };

  const clearSelectedPlayers = () => {
    setSelectedPlayers(new Set());
  };

  return {
    selectedPlayers,
    addSelectedPlayer,
    removeSelectedPlayer,
    clearSelectedPlayers,
  };
};
