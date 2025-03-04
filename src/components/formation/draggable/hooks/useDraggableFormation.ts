
import { useState, useRef, useEffect } from "react";
import { usePlayerManagement } from "./usePlayerManagement";
import { useDragOperations } from "./useDragOperations";
import { useDropOperations } from "./useDropOperations";
import { useSubstitutionManager } from "./useSubstitutionManager";

interface UseDraggableFormationProps {
  initialSelections?: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>;
  onSelectionChange?: (selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>) => void;
  availablePlayers: any[];
  squadPlayers?: string[];
}

export const useDraggableFormation = ({
  initialSelections = {},
  onSelectionChange,
  availablePlayers,
  squadPlayers = []
}: UseDraggableFormationProps) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>>(initialSelections);
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
  
  const { 
    handleDragStart, 
    handleDragEnd, 
    handlePlayerSelect: originalHandlePlayerSelect 
  } = useDragOperations();
  
  // Wrapper for handlePlayerSelect to update selectedPlayerId
  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayerId(originalHandlePlayerSelect(playerId));
    return playerId;
  };
  
  const { handleDrop } = useDropOperations({
    selections,
    updateSelections: setSelections,
    selectedPlayerId,
    setSelectedPlayerId,
    draggingPlayer,
    setDraggingPlayer
  });
  
  const { 
    handleSubstituteDrop,
    initializeSubCounter,
    handleRemovePlayer
  } = useSubstitutionManager({
    selections,
    updateSelections: setSelections,
    onSelectionChange
  });

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
