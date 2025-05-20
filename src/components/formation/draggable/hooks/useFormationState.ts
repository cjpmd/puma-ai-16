import { useState, useRef, useEffect } from "react";
import { Selection } from "../../types";
import { PerformanceCategory } from "@/types/player";
import { useDropOperations } from "./useDropOperations";
import { useDragOperations } from "./useDragOperations";

interface UseFormationStateProps {
  initialSelections?: Record<string, any>;
  onSelectionChange: (selections: Record<string, any>) => void;
  performanceCategory?: PerformanceCategory;
  periodNumber?: number;
  periodDuration?: number;
  squadPlayers: string[];
}

export const useFormationState = ({
  initialSelections,
  onSelectionChange,
  performanceCategory = PerformanceCategory.MESSI,
  periodNumber = 1,
  periodDuration = 45,
  squadPlayers
}: UseFormationStateProps) => {
  const [selections, setSelections] = useState<Record<string, any>>(initialSelections || {});
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<number>(periodNumber);
  const [periodLength, setPeriodLength] = useState<number>(periodDuration);
  const formationRef = useRef<HTMLDivElement>(null);
  const previousSelectionsRef = useRef<Record<string, { playerId: string; position: string }>>({});

  // Get drag operations
  const { draggingPlayerId: draggingPlayer, handleDragStart, handleDragEnd, handlePlayerSelect } = useDragOperations();

  // Initialize drop operations
  const { handleDrop } = useDropOperations({
    selections,
    updateSelections: (newSelections) => {
      previousSelectionsRef.current = selections;
      setSelections(newSelections);
    },
    selectedPlayerId,
    setSelectedPlayerId,
    draggingPlayer,
    setDraggingPlayer: handleDragEnd,
    performanceCategory,
    preventDuplicates: true
  });

  // Update parent when selections change
  useEffect(() => {
    const needsUpdate = JSON.stringify(selections) !== JSON.stringify(previousSelectionsRef.current);
    
    if (needsUpdate) {
      // Notify parent of selection changes
      onSelectionChange(selections);
    }
  }, [selections, onSelectionChange]);

  // Sync period data from props
  useEffect(() => {
    setCurrentPeriod(periodNumber);
    setPeriodLength(periodDuration);
  }, [periodNumber, periodDuration]);

  // Handle player selection
  const handlePlayerClick = (playerId: string) => {
    if (selectedPlayerId === playerId) {
      setSelectedPlayerId(null);
    } else {
      setSelectedPlayerId(playerId);
    }
  };

  // Handle player removal
  const handleRemovePlayer = (slotId: string) => {
    const updatedSelections = { ...selections };
    delete updatedSelections[slotId];
    setSelections(updatedSelections);
  };

  return {
    selections,
    selectedPlayerId,
    draggingPlayer,
    formationRef,
    currentPeriod,
    periodLength,
    handleDrop,
    handlePlayerClick,
    handleRemovePlayer,
    handleDragStart,
    handleDragEnd,
    handlePlayerSelect
  };
};
