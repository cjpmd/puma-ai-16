
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
  const handleSubstituteDrop = (playerId: string, fromSlotId: string) => {
    if (!playerId || !fromSlotId) {
      console.log("Missing playerId or fromSlotId, cannot create substitute");
      return;
    }
    
    console.log(`Player ${playerId} dropped to substitutes section from ${fromSlotId}`);
    
    // Initialize the counter if needed
    if (subCounterRef.current === 0) {
      initializeSubCounter();
    }
    
    // Generate a new substitute slot ID
    const subSlotId = `sub-${subCounterRef.current++}`;
    
    // Get the player's current position for debugging
    const currentPosition = selections[fromSlotId]?.position;
    console.log(`Moving player from position ${currentPosition} to SUB`);
    
    // Create a new selections object
    const newSelections = { ...selections };
    
    // Remove the player from their current position
    if (selections[fromSlotId]) {
      delete newSelections[fromSlotId];
    }
    
    // Add them to the substitutes
    newSelections[subSlotId] = {
      playerId,
      position: 'SUB',
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
