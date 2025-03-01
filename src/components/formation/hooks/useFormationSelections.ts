
import { useState, useEffect, useRef } from "react";
import { PlayerSelection } from "../types";

export function useFormationSelections({
  initialSelections,
  performanceCategory,
  onSelectionChange
}: {
  initialSelections?: Record<string, PlayerSelection>;
  performanceCategory: string;
  onSelectionChange: (selections: Record<string, PlayerSelection>) => void;
}) {
  const [selections, setSelections] = useState<Record<string, PlayerSelection>>({});
  const [localPerformanceCategory, setLocalPerformanceCategory] = useState(performanceCategory);
  const initialSelectionsRef = useRef<string>("");
  const hasUpdatedSelectionsRef = useRef(false);

  // Update local state when initialSelections change - improved to handle preserved positions
  useEffect(() => {
    if (initialSelections) {
      const currentInitialSelectionsStr = JSON.stringify(initialSelections);
      
      // Only update if the initialSelections are different
      if (currentInitialSelectionsStr !== initialSelectionsRef.current) {
        console.log("FormationSelector: Setting initialSelections", initialSelections);
        
        // Deep clone to avoid reference issues
        const clonedSelections = JSON.parse(JSON.stringify(initialSelections));
        setSelections(clonedSelections);
        initialSelectionsRef.current = currentInitialSelectionsStr;
        hasUpdatedSelectionsRef.current = true;
      }
    }
  }, [initialSelections]);

  // Update local state when performanceCategory changes
  useEffect(() => {
    setLocalPerformanceCategory(performanceCategory);
  }, [performanceCategory]);

  // Handle player selection changes
  const handlePlayerSelection = (slotId: string, playerId: string, position: string) => {
    console.log(`FormationSelector: Selection change - SlotID: ${slotId}, PlayerID: ${playerId}, Position: ${position}`);
    
    // Create a new selections object with the updated values
    const newSelections = {
      ...selections,
      [slotId]: {
        playerId,
        position,
        performanceCategory: localPerformanceCategory
      }
    };
    
    // Update local state
    setSelections(newSelections);
    
    // Notify parent component about changes
    onSelectionChange(newSelections);
  };

  // Update performance categories when they change
  useEffect(() => {
    if (Object.keys(selections).length > 0) {
      const updatedSelections = Object.fromEntries(
        Object.entries(selections).map(([key, value]) => [
          key,
          { ...value, performanceCategory: localPerformanceCategory }
        ])
      );
      
      if (JSON.stringify(selections) !== JSON.stringify(updatedSelections)) {
        setSelections(updatedSelections);
        onSelectionChange(updatedSelections);
      }
    }
  }, [localPerformanceCategory, onSelectionChange]);

  return {
    selections,
    localPerformanceCategory,
    handlePlayerSelection
  };
}
