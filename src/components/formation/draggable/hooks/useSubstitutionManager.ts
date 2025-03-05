
import { useState } from "react";

interface UseSubstitutionManagerProps {
  selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>;
  updateSelections: (selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>) => void;
  onSelectionChange?: (selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>) => void;
}

export const useSubstitutionManager = ({
  selections,
  updateSelections,
  onSelectionChange
}: UseSubstitutionManagerProps) => {
  const [substitutionCounter, setSubstitutionCounter] = useState(0);

  // Initialize the substitution counter based on existing selections
  const initializeSubCounter = () => {
    const existingSubstitutes = Object.entries(selections)
      .filter(([_, selection]) => selection.isSubstitution)
      .map(([slotId]) => {
        const match = slotId.match(/sub-(\d+)/);
        return match ? parseInt(match[1], 10) : -1;
      })
      .filter(num => num >= 0);

    if (existingSubstitutes.length > 0) {
      setSubstitutionCounter(Math.max(...existingSubstitutes) + 1);
    }
  };

  // Handle adding a player to the substitutes area
  const handleSubstituteDrop = (playerId: string, fromSlotId?: string) => {
    console.log(`Adding player ${playerId} to substitutes from slot ${fromSlotId || 'none'}`);
    
    // Create a new slot ID for this substitute
    const substitutionSlotId = `sub-${substitutionCounter}`;
    
    // Create a new selections object
    const newSelections = { ...selections };
    
    // If the player is coming from another slot, remove them from that slot
    if (fromSlotId && newSelections[fromSlotId]) {
      delete newSelections[fromSlotId];
    } else {
      // If not from a slot, check if they're already in a position
      const existingSlot = Object.entries(newSelections).find(
        ([_, selection]) => selection.playerId === playerId
      )?.[0];
      
      if (existingSlot) {
        delete newSelections[existingSlot];
      }
    }
    
    // Add the player to the substitutes
    newSelections[substitutionSlotId] = {
      playerId,
      position: 'SUB',
      isSubstitution: true
    };
    
    // Increment the counter
    setSubstitutionCounter(prev => prev + 1);
    
    // Update selections
    updateSelections(newSelections);
  };

  // Handle removing a player from any position
  const handleRemovePlayer = (slotId: string) => {
    console.log(`Removing player from slot ${slotId}`);
    
    const newSelections = { ...selections };
    delete newSelections[slotId];
    
    updateSelections(newSelections);
  };

  return {
    handleSubstituteDrop,
    initializeSubCounter,
    handleRemovePlayer
  };
};
