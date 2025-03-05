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
  onSquadPlayersChange?: (playerIds: string[]) => void;
}

export const useDraggableFormation = ({
  initialSelections = {},
  onSelectionChange,
  availablePlayers,
  squadPlayers = [],
  performanceCategory,
  format = "7-a-side",
  formationTemplate = "All",
  onTemplateChange,
  onSquadPlayersChange
}: UseDraggableFormationProps) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>>(initialSelections);
  const [draggingPlayer, setDraggingPlayer] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(formationTemplate);
  const formationRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (Object.keys(initialSelections).length > 0) {
      console.log("Initializing formation with saved selections:", initialSelections);
      setSelections(initialSelections);
    }
  }, [initialSelections]);

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
  
  const handleDragStart = (e: React.DragEvent, playerId: string) => {
    originalHandleDragStart(e, playerId);
    setDraggingPlayer(playerId);
  };
  
  const handlePlayerSelect = (playerId: string) => {
    return originalHandlePlayerSelect(playerId);
  };
  
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

  useEffect(() => {
    initializeSubCounter();
  }, []);

  useEffect(() => {
    if (onSelectionChange && Object.keys(selections).length > 0) {
      onSelectionChange(selections);
    }
  }, [selections, onSelectionChange]);
  
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    if (onTemplateChange) {
      onTemplateChange(template);
    }
  };
  
  const getPlayerById = (playerId: string) => {
    return availablePlayers.find(player => player.id === playerId);
  };
  
  const getAvailablePlayers = () => {
    return getAvailableSquadPlayers();
  };
  
  useEffect(() => {
    if (onSquadPlayersChange) {
      const playerIds = Object.values(selections)
        .map(selection => selection.playerId)
        .filter(id => id && id !== "unassigned");
        
      const uniquePlayerIds = [...new Set(playerIds)];
      
      onSquadPlayersChange(uniquePlayerIds);
    }
  }, [selections, onSquadPlayersChange]);
  
  const showPlayers = () => {
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
