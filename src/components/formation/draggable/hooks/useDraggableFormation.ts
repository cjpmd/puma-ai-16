
import { useState, useRef, useEffect } from "react";
import { usePlayerManagement } from "./usePlayerManagement";
import { useDragOperations } from "./useDragOperations";
import { useDropOperations } from "./useDropOperations";
import { useSubstitutionManager } from "./useSubstitutionManager";
import { PerformanceCategory } from "@/types/player";
import { FormationFormat } from "../../types";

interface UseDraggableFormationProps {
  initialSelections?: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>;
  onSelectionChange?: (selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>) => void;
  availablePlayers: any[];
  squadPlayers?: string[];
  performanceCategory?: PerformanceCategory;
  format?: FormationFormat;
  formationTemplate?: string;
  onTemplateChange?: (template: string) => void;
}

export const useDraggableFormation = ({
  initialSelections = {},
  onSelectionChange,
  availablePlayers,
  squadPlayers = [],
  performanceCategory,
  format = "7-a-side",
  formationTemplate = "All",
  onTemplateChange
}: UseDraggableFormationProps) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>>(initialSelections);
  const [draggingPlayer, setDraggingPlayer] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(formationTemplate);
  const formationRef = useRef<HTMLDivElement>(null);
  
  // Initialize with saved selections
  useEffect(() => {
    if (Object.keys(initialSelections).length > 0) {
      console.log("Initializing formation with saved selections:", initialSelections);
      setSelections(initialSelections);
    }
  }, [initialSelections]);

  // Helper functions from custom hooks
  const { getPlayer, getAvailableSquadPlayers } = usePlayerManagement({
    availablePlayers,
    squadPlayers,
    selections
  });
  
  const { 
    handleDragStart: originalHandleDragStart, 
    handleDragEnd, 
    handlePlayerSelect: originalHandlePlayerSelect 
  } = useDragOperations();
  
  // Wrapper for handleDragStart to update draggingPlayer
  const handleDragStart = (e: React.DragEvent, playerId: string) => {
    originalHandleDragStart(e, playerId);
    setDraggingPlayer(playerId);
  };
  
  // Wrapper for handlePlayerSelect to update selectedPlayerId
  const handlePlayerSelect = (playerId: string) => {
    return originalHandlePlayerSelect(playerId);
  };
  
  // Handler for player click
  const handlePlayerClick = (playerId: string) => {
    setSelectedPlayerId(playerId === selectedPlayerId ? null : playerId);
  };
  
  const { handleDrop } = useDropOperations({
    selections,
    updateSelections: setSelections,
    selectedPlayerId,
    setSelectedPlayerId,
    draggingPlayer,
    setDraggingPlayer,
    performanceCategory
  });
  
  const { 
    handleSubstituteDrop,
    initializeSubCounter,
    handleRemovePlayer,
    addSubstitute,
    removeSubstitute
  } = useSubstitutionManager({
    selections,
    updateSelections: setSelections,
    onSelectionChange,
    performanceCategory
  });

  // Initialize substitution counter
  useEffect(() => {
    initializeSubCounter();
  }, []);

  // Update parent component when selections change
  useEffect(() => {
    if (onSelectionChange && Object.keys(selections).length > 0) {
      onSelectionChange(selections);
    }
  }, [selections, onSelectionChange]);
  
  // Handle template change
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    if (onTemplateChange) {
      onTemplateChange(template);
    }
  };
  
  // Get player by ID
  const getPlayerById = (playerId: string) => {
    return availablePlayers.find(player => player.id === playerId);
  };
  
  // Get available players
  const getAvailablePlayers = () => {
    return getAvailableSquadPlayers();
  };
  
  // Show players state function
  const showPlayers = () => {
    // Implementation can be added later if needed
    return true;
  };

  return {
    selectedPlayerId,
    draggingPlayer,
    selectedTemplate,
    selections,
    formationRef,
    handleDrop,
    handlePlayerSelect,
    handlePlayerClick,
    handleRemovePlayer,
    handleDragStart,
    handleDragEnd,
    handleSubstituteDrop,
    handleTemplateChange,
    getPlayer,
    getPlayerById,
    getAvailablePlayers,
    getAvailableSquadPlayers,
    addSubstitute,
    removeSubstitute,
    showPlayers
  };
};
