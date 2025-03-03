
import { useState, useEffect } from "react";

type SelectionType = {
  playerId: string;
  position: string;
  isSubstitution?: boolean;
};

export const useFormationSelections = (
  initialSelections: Record<string, SelectionType> = {},
  onSelectionChange?: (selections: Record<string, SelectionType>) => void
) => {
  const [selections, setSelections] = useState<Record<string, SelectionType>>(initialSelections || {});

  // Update state when initialSelections change
  useEffect(() => {
    if (initialSelections && Object.keys(initialSelections).length > 0) {
      setSelections(initialSelections);
    }
  }, [initialSelections]);

  // Update selections and notify parent
  const updateSelections = (newSelections: Record<string, SelectionType>) => {
    setSelections(newSelections);
    onSelectionChange?.(newSelections);
  };

  // Handle removing a player from a position
  const handleRemovePlayer = (slotId: string) => {
    console.log(`Removing player from slot ${slotId}`);
    const newSelections = { ...selections };
    delete newSelections[slotId];
    
    updateSelections(newSelections);
  };

  return {
    selections,
    setSelections,
    updateSelections,
    handleRemovePlayer
  };
};
