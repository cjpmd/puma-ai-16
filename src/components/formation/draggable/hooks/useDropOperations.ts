
import { PerformanceCategory } from "@/types/player";

interface UseDropOperationsProps {
  selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>;
  updateSelections: React.Dispatch<React.SetStateAction<Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>>>;
  selectedPlayerId: string | null;
  setSelectedPlayerId: React.Dispatch<React.SetStateAction<string | null>>;
  draggingPlayer: string | null;
  setDraggingPlayer: (playerId: string | null) => void;
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
    const playerId = draggingPlayer || selectedPlayerId;
    
    if (!playerId) {
      console.log("No player selected for drop");
      return;
    }
    
    // Don't allow dropping into the same slot
    if (fromSlotId === slotId) {
      console.log("Same slot, ignoring drop");
      return;
    }
    
    console.log(`Dropping player ${playerId} into position ${position} (slot ${slotId})`);
    
    // Create a new selections object
    const updatedSelections = { ...selections };
    
    // If moving from one slot to another, remove from old slot first
    if (fromSlotId && updatedSelections[fromSlotId]?.playerId === playerId) {
      console.log(`Removing player ${playerId} from slot ${fromSlotId}`);
      delete updatedSelections[fromSlotId];
    }
    
    // If preventing duplicates, remove the player from any other positions
    // but only if they're the same player and it's not the target slot
    if (preventDuplicates) {
      Object.entries(updatedSelections).forEach(([existingSlotId, existingSelection]) => {
        if (existingSelection.playerId === playerId && existingSlotId !== slotId) {
          console.log(`Removing duplicate ${playerId} from position ${existingSelection.position}`);
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
    
    // Reset UI state
    setSelectedPlayerId(null);
    setDraggingPlayer(null);
  };
  
  return { handleDrop };
};
