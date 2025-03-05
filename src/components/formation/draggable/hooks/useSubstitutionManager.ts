
import { useState } from "react";
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
  performanceCategory
}: UseSubstitutionManagerProps) => {
  const [subCounter, setSubCounter] = useState(1);
  
  // Initialize substitution counter based on existing selections
  const initializeSubCounter = () => {
    let maxCounter = 0;
    
    Object.values(selections).forEach(selection => {
      if (selection.position.startsWith('sub-')) {
        const counterStr = selection.position.replace('sub-', '');
        const counter = parseInt(counterStr, 10);
        if (!isNaN(counter) && counter > maxCounter) {
          maxCounter = counter;
        }
      }
    });
    
    setSubCounter(maxCounter + 1);
  };
  
  // Remove player from selection
  const handleRemovePlayer = (slotId: string) => {
    const updatedSelections = { ...selections };
    delete updatedSelections[slotId];
    
    updateSelections(updatedSelections);
    if (onSelectionChange) {
      onSelectionChange(updatedSelections);
    }
  };
  
  // Handle drop on the substitutes section
  const handleSubstituteDrop = (playerId: string, fromSlotId?: string) => {
    if (!playerId) return;
    
    // Check if player is already assigned
    let isAlreadyAssigned = false;
    let existingSlotId = '';
    
    Object.entries(selections).forEach(([slotId, selection]) => {
      if (selection.playerId === playerId && slotId !== fromSlotId) {
        isAlreadyAssigned = true;
        existingSlotId = slotId;
      }
    });
    
    const updatedSelections = { ...selections };
    
    // If player is already assigned somewhere, remove from that position
    if (isAlreadyAssigned && existingSlotId) {
      delete updatedSelections[existingSlotId];
    }
    
    // Add player to substitutes
    const subPosition = `sub-${subCounter}`;
    const newSlotId = `sub-${subCounter}`;
    
    updatedSelections[newSlotId] = {
      playerId,
      position: subPosition,
      isSubstitution: true,
      performanceCategory: performanceCategory as string
    };
    
    // Increment counter for next substitution
    setSubCounter(prev => prev + 1);
    
    // Update selections
    updateSelections(updatedSelections);
    if (onSelectionChange) {
      onSelectionChange(updatedSelections);
    }
  };
  
  return {
    handleSubstituteDrop,
    initializeSubCounter,
    handleRemovePlayer
  };
};
