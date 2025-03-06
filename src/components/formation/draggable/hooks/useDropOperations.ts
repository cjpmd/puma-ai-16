
import { PerformanceCategory } from "@/types/player";

interface UseDropOperationsProps {
  selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>;
  updateSelections: React.Dispatch<React.SetStateAction<Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>>>;
  selectedPlayerId: string | null;
  setSelectedPlayerId: React.Dispatch<React.SetStateAction<string | null>>;
  draggingPlayer: string | null;
  setDraggingPlayer: React.Dispatch<React.SetStateAction<string | null>>;
  performanceCategory?: PerformanceCategory;
  preventDuplicates?: boolean;
}

export const useDropOperations = ({
  selections,
  updateSelections,
  selectedPlayerId,
  setSelectedPlayerId,
  draggingPlayer,
  setDraggingPlayer,
  performanceCategory,
  preventDuplicates = true
}: UseDropOperationsProps) => {
  
  const handleDrop = (slotId: string, position: string, fromSlotId?: string) => {
    // Identify which player is being dropped - either a dragged player or a selected player
    const playerId = draggingPlayer || selectedPlayerId;
    
    if (!playerId) {
      console.log("No player selected for drop");
      return;
    }
    
    console.log(`Dropping player ${playerId} into position ${position} (slot ${slotId})`);
    
    // Create a new selections object to avoid mutating the original
    const updatedSelections = { ...selections };
    
    // If we're preventing duplicates, remove the player from other positions first
    if (preventDuplicates) {
      // Only remove if not the same slot (for dragging within the same position)
      Object.entries(updatedSelections).forEach(([existingSlotId, existingSelection]) => {
        if (existingSelection.playerId === playerId && existingSlotId !== fromSlotId && existingSlotId !== slotId) {
          console.log(`Removing ${playerId} from position ${existingSelection.position} (slot ${existingSlotId})`);
          delete updatedSelections[existingSlotId];
        }
      });
    }
    
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
