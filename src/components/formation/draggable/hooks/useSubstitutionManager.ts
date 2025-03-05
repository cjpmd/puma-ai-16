
import { useState, useEffect } from "react";
import { PerformanceCategory } from "@/types/player";

interface UseSubstitutionManagerProps {
  selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>;
  updateSelections: React.Dispatch<React.SetStateAction<Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>>>;
  onSelectionChange?: (selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>) => void;
  performanceCategory?: PerformanceCategory;
}

export const useSubstitutionManager = ({
  selections,
  updateSelections,
  onSelectionChange,
  performanceCategory = "MESSI"
}: UseSubstitutionManagerProps) => {
  const [subCounter, setSubCounter] = useState(1);

  // Initialize the substitution counter based on existing selections
  const initializeSubCounter = () => {
    const existingSubSlots = Object.keys(selections).filter(slotId => 
      slotId.startsWith('sub-') && !isNaN(parseInt(slotId.split('-')[1]))
    );
    
    if (existingSubSlots.length > 0) {
      // Find the highest number
      const highestNum = Math.max(...existingSubSlots.map(slotId => 
        parseInt(slotId.split('-')[1])
      ));
      setSubCounter(highestNum + 1);
    }
  };

  // Add a player as a substitute
  const addSubstitute = (playerId: string, fromSlotId?: string) => {
    // Generate a new slot ID for the substitute
    const newSlotId = `sub-${subCounter}`;
    
    // Create a copy of the current selections
    const newSelections = { ...selections };
    
    // If the player is being moved from another position, remove them from there
    if (fromSlotId && selections[fromSlotId]) {
      delete newSelections[fromSlotId];
    }
    
    // Add player to the substitute position
    newSelections[newSlotId] = {
      playerId,
      position: `sub-${subCounter}`,
      isSubstitution: true,
      performanceCategory: performanceCategory as string
    };
    
    // Update selections and increment the counter
    updateSelections(newSelections);
    setSubCounter(prev => prev + 1);
    
    // Notify parent
    if (onSelectionChange) {
      onSelectionChange(newSelections);
    }
  };

  // Remove a player from a position
  const handleRemovePlayer = (slotId: string) => {
    // Create a copy of the current selections
    const newSelections = { ...selections };
    
    // Remove the player from the specified slot
    delete newSelections[slotId];
    
    // Update selections
    updateSelections(newSelections);
    
    // Notify parent
    if (onSelectionChange) {
      onSelectionChange(newSelections);
    }
  };

  // Handle substitute drop (wrapper for addSubstitute with drop event handling)
  const handleSubstituteDrop = (playerId: string, fromSlotId?: string) => {
    addSubstitute(playerId, fromSlotId);
  };

  // Remove a player from the substitutes
  const removeSubstitute = (slotId: string) => {
    handleRemovePlayer(slotId);
  };

  return {
    handleSubstituteDrop,
    initializeSubCounter,
    handleRemovePlayer,
    addSubstitute,
    removeSubstitute
  };
};
