
import { useRef, useEffect } from "react";

type SelectionType = {
  playerId: string;
  position: string;
  isSubstitution?: boolean;
};

interface SubstitutionManagerProps {
  selections: Record<string, SelectionType>;
  updateSelections: (selections: Record<string, SelectionType>) => void;
  onSelectionChange?: (selections: Record<string, SelectionType>) => void;
}

export const useSubstitutionManager = ({
  selections,
  updateSelections,
  onSelectionChange
}: SubstitutionManagerProps) => {
  // Substitution counter for generating unique slot IDs
  const subCounterRef = useRef<number>(0);

  // Initialize from existing selections when component mounts
  useEffect(() => {
    initializeSubCounter();
  }, []);

  // Initialize from existing selections if any
  const initializeSubCounter = () => {
    // Calculate the highest sub-X ID to continue numbering from there
    const subIds = Object.keys(selections)
      .filter(id => id.startsWith('sub-'))
      .map(id => parseInt(id.replace('sub-', ''), 10));
    
    if (subIds.length > 0) {
      subCounterRef.current = Math.max(...subIds) + 1;
      console.log(`Initialized sub counter to ${subCounterRef.current}`);
    }
  };

  // Handle removing a player from a position
  const handleRemovePlayer = (slotId: string) => {
    console.log(`Removing player from slot ${slotId}`);
    const newSelections = { ...selections };
    delete newSelections[slotId];
    
    updateSelections(newSelections);
    if (onSelectionChange) {
      onSelectionChange(newSelections);
    }
  };

  // Handle dragging to substitutes section
  const handleSubstituteDrop = (playerId: string, fromSlotId?: string) => {
    if (!playerId) {
      console.log("Missing playerId, cannot create substitute");
      return;
    }
    
    console.log(`Player ${playerId} dropped to substitutes section from ${fromSlotId || 'direct selection'}`);
    
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
    if (onSelectionChange) {
      onSelectionChange(newSelections);
    }
  };

  return {
    handleSubstituteDrop,
    initializeSubCounter,
    handleRemovePlayer
  };
};
