
import { useRef } from "react";

type SelectionType = {
  playerId: string;
  position: string;
  isSubstitution?: boolean;
};

export const useSubstitutionManager = (
  updateSelections: (selections: Record<string, SelectionType>) => void,
  selections: Record<string, SelectionType>
) => {
  // Substitution counter for generating unique slot IDs
  const subCounterRef = useRef<number>(0);

  // Initialize from existing selections if any
  const initializeSubCounter = () => {
    // Calculate the highest sub-X ID to continue numbering from there
    const subIds = Object.keys(selections)
      .filter(id => id.startsWith('sub-'))
      .map(id => parseInt(id.replace('sub-', ''), 10));
    
    if (subIds.length > 0) {
      subCounterRef.current = Math.max(...subIds) + 1;
    }
  };

  // Handle dragging to substitutes section
  const handleSubstituteDrop = (playerId: string, fromSlotId: string = '') => {
    if (!playerId) {
      console.log("Missing playerId, cannot create substitute");
      return;
    }
    
    console.log(`Player ${playerId} dropped to substitutes section from ${fromSlotId || 'direct selection'}`);
    
    // Initialize the counter if needed
    if (subCounterRef.current === 0) {
      initializeSubCounter();
    }
    
    // Generate a new substitute slot ID
    const subSlotId = `sub-${subCounterRef.current++}`;
    
    // Get the player's current position if they're being moved from another slot
    let currentPosition = 'SUB';
    if (fromSlotId && selections[fromSlotId]) {
      currentPosition = selections[fromSlotId]?.position || 'SUB';
      console.log(`Moving player from position ${currentPosition} to SUB`);
    }
    
    // Create a new selections object
    const newSelections = { ...selections };
    
    // Remove the player from their current position if they're being moved
    if (fromSlotId && selections[fromSlotId]) {
      delete newSelections[fromSlotId];
    }
    
    // Add them to the substitutes
    newSelections[subSlotId] = {
      playerId,
      position: currentPosition,
      isSubstitution: true
    };
    
    console.log('New selections after substitution:', newSelections);
    
    updateSelections(newSelections);
  };

  return {
    handleSubstituteDrop,
    initializeSubCounter
  };
};
