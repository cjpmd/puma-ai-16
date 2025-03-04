
import { useRef } from "react";
import { useFormationSelections } from "./useFormationSelections";
import { useSubstitutionManager } from "./useSubstitutionManager";
import { useDragOperations } from "./useDragOperations";
import { useDropOperations } from "./useDropOperations";
import { usePlayerManagement } from "./usePlayerManagement";

interface UseDraggableFormationProps {
  initialSelections?: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>;
  onSelectionChange?: (selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>) => void;
  availablePlayers: any[];
  squadPlayers?: string[];
}

export const useDraggableFormation = ({
  initialSelections = {},
  onSelectionChange,
  availablePlayers,
  squadPlayers = []
}: UseDraggableFormationProps) => {
  const formationRef = useRef<HTMLDivElement>(null);
  
  // Initialize formation selections
  const { 
    selections, 
    updateSelections, 
    handleRemovePlayer 
  } = useFormationSelections(initialSelections, onSelectionChange);
  
  // Initialize drag operations
  const { 
    selectedPlayerId, 
    setSelectedPlayerId,
    draggingPlayer, 
    handlePlayerSelect, 
    handleDragStart: baseDragStart, 
    handleDragEnd 
  } = useDragOperations();
  
  // Initialize player management
  const { 
    getPlayer, 
    getAvailableSquadPlayers 
  } = usePlayerManagement(availablePlayers, squadPlayers, selections);
  
  // Initialize drop operations
  const { 
    handleDrop 
  } = useDropOperations(
    selections, 
    updateSelections, 
    selectedPlayerId, 
    setSelectedPlayerId, 
    draggingPlayer, 
    setDraggingPlayer => setSelectedPlayerId(null)
  );
  
  // Initialize substitution manager
  const { 
    handleSubstituteDrop, 
    initializeSubCounter 
  } = useSubstitutionManager(updateSelections, selections);
  
  // Initialize sub counter when initialSelections change
  if (initialSelections && Object.keys(initialSelections).length > 0) {
    initializeSubCounter();
  }
  
  // Wrapper for handleDragStart to include getPlayer
  const handleDragStart = (e: React.DragEvent, playerId: string) => {
    baseDragStart(e, playerId, getPlayer);
  };

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
