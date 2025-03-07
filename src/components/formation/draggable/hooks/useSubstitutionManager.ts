
import { PerformanceCategory } from "@/types/player";

interface UseSubstitutionManagerProps {
  selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>;
  updateSelections: (selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>) => void;
  onSelectionChange: (selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>) => void;
  performanceCategory?: PerformanceCategory;
}

export const useSubstitutionManager = ({
  selections,
  updateSelections,
  onSelectionChange,
  performanceCategory
}: UseSubstitutionManagerProps) => {
  
  // Handle adding a player as a substitute
  const addSubstitute = (playerId: string) => {
    if (!playerId) return;
    
    // Generate a unique ID for the substitution slot
    const existingSubCount = Object.values(selections).filter(
      selection => selection.position.startsWith('sub-')
    ).length;
    
    const slotId = `sub-${existingSubCount + 1}`;
    const position = `sub-${existingSubCount + 1}`;
    
    // Create updated selections with new substitute
    const updatedSelections = {
      ...selections,
      [slotId]: {
        playerId,
        position,
        isSubstitution: true,
        performanceCategory: performanceCategory as string
      }
    };
    
    // Update state
    updateSelections(updatedSelections);
    onSelectionChange(updatedSelections);
  };
  
  // Handle removing a substitute
  const removeSubstitute = (slotId: string) => {
    if (!slotId || !selections[slotId]) return;
    
    // Create new selections object without the removed substitute
    const { [slotId]: removed, ...rest } = selections;
    
    // Update state
    updateSelections(rest);
    onSelectionChange(rest);
  };
  
  // Handle drop on substitutes area
  const handleSubstituteDrop = (playerId: string) => {
    if (playerId) {
      addSubstitute(playerId);
    }
  };
  
  return {
    addSubstitute,
    removeSubstitute,
    handleSubstituteDrop
  };
};
