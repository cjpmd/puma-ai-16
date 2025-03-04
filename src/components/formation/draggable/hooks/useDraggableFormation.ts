
import { useState, useRef, useEffect } from "react";
import { usePlayerManagement } from "./usePlayerManagement";
import { useDragOperations } from "./useDragOperations";
import { useDropOperations } from "./useDropOperations";
import { useSubstitutionManager } from "./useSubstitutionManager";

export const useDraggableFormation = ({
  initialSelections = {},
  onSelectionChange,
  availablePlayers,
  squadPlayers = []
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, { playerId: string; position: string; isSubstitution?: boolean }>>(initialSelections);
  const [draggingPlayer, setDraggingPlayer] = useState<string | null>(null);
  const formationRef = useRef<HTMLDivElement>(null);
  
  // Initialize with saved selections
  useEffect(() => {
    if (Object.keys(initialSelections).length > 0) {
      console.log("Initializing formation with saved selections:", initialSelections);
      setSelections(initialSelections);
    }
  }, [initialSelections]);

  // Helper functions from custom hooks
  const { getPlayer, getAvailableSquadPlayers } = usePlayerManagement({
    availablePlayers,
    squadPlayers,
    selections
  });
  
  const { handleDragStart, handleDragEnd } = useDragOperations({
    setDraggingPlayer
  });
  
  const { handleDrop } = useDropOperations({
    selections,
    setSelections,
    draggingPlayer,
    setDraggingPlayer, 
    selectedPlayerId,
    setSelectedPlayerId,
    getPlayer,
    onSelectionChange
  });
  
  const { 
    handleSubstituteDrop,
    handleRemovePlayer 
  } = useSubstitutionManager({
    selections,
    setSelections,
    onSelectionChange
  });
  
  // Handle player selection
  const handlePlayerSelect = (playerId: string) => {
    if (selectedPlayerId === playerId) {
      setSelectedPlayerId(null);
    } else {
      setSelectedPlayerId(playerId);
    }
  };
  
  // Update parent component when selections change
  useEffect(() => {
    if (onSelectionChange && Object.keys(selections).length > 0) {
      onSelectionChange(selections);
    }
  }, [selections, onSelectionChange]);

  return {
    selectedPlayerId,
    selections,
    formationRef,
    draggingPlayer,
    handleDrop,
    handlePlayerSelect,
    handleRemovePlayer,
    handleDragStart,
    handleDragEnd,
    handleSubstituteDrop,
    getPlayer,
    getAvailableSquadPlayers
  };
};
