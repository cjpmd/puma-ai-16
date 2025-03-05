
import { PerformanceCategory } from "@/types/player";

interface UseDropOperationsProps {
  selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>;
  updateSelections: React.Dispatch<React.SetStateAction<Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>>>;
  selectedPlayerId: string | null;
  setSelectedPlayerId: React.Dispatch<React.SetStateAction<string | null>>;
  draggingPlayer: string | null;
  setDraggingPlayer: React.Dispatch<React.SetStateAction<string | null>>;
  performanceCategory?: PerformanceCategory;
}

export const useDropOperations = ({
  selections,
  updateSelections,
  selectedPlayerId,
  setSelectedPlayerId,
  draggingPlayer,
  setDraggingPlayer,
  performanceCategory
}: UseDropOperationsProps) => {
  
  const handleDrop = (e: React.DragEvent, slotId: string, position: string) => {
    e.preventDefault();
    
    // Identify which player is being dropped - either a dragged player or a selected player
    const playerId = draggingPlayer || selectedPlayerId;
    
    if (!playerId) {
      console.log("No player selected for drop");
      return;
    }
    
    console.log(`Dropping player ${playerId} into position ${position} (slot ${slotId})`);
    
    // Update selections with the new player
    const updatedSelections = { ...selections };
    
    // Check if the dropped player is already assigned to a position
    Object.entries(updatedSelections).forEach(([existingSlotId, existingSelection]) => {
      if (existingSelection.playerId === playerId) {
        delete updatedSelections[existingSlotId];
      }
    });
    
    // Add the player to the new position
    updatedSelections[slotId] = {
      playerId,
      position,
      performanceCategory: performanceCategory as string
    };
    
    // Update the state
    updateSelections(updatedSelections);
    
    // Reset the UI state
    setSelectedPlayerId(null);
    setDraggingPlayer(null);
  };
  
  return { handleDrop };
};
