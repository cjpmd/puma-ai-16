import { useState, useRef, useEffect } from "react";
import { FormationFormat } from "../../types";
import { PerformanceCategory } from "@/types/player";
import { useDragOperations } from "./useDragOperations";
import { useDropOperations } from "./useDropOperations";
import { useSubstitutionManager } from "./useSubstitutionManager";

export interface UseDraggableFormationProps {
  initialSelections?: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>;
  onSelectionChange: (selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>) => void;
  availablePlayers: any[];
  squadPlayers: string[];
  performanceCategory?: PerformanceCategory;
  format: FormationFormat;
  formationTemplate?: string;
  onTemplateChange?: (template: string) => void;
  onSquadPlayersChange?: (playerIds: string[]) => void;
}

export const useDraggableFormation = ({
  initialSelections,
  onSelectionChange,
  availablePlayers,
  squadPlayers,
  performanceCategory = "MESSI",
  format,
  formationTemplate = "All",
  onTemplateChange,
  onSquadPlayersChange
}: UseDraggableFormationProps) => {
  // State for tracking selections, selected player, and active template
  const [selections, setSelections] = useState<Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>>(initialSelections || {});
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(formationTemplate);
  const formationRef = useRef<HTMLDivElement>(null);

  // Get drag operations from the hook
  const { draggingPlayerId: draggingPlayer, handleDragStart, handleDragEnd, handlePlayerSelect } = useDragOperations();

  // Initialize substitution manager
  const { 
    addSubstitute, 
    removeSubstitute, 
    handleSubstituteDrop 
  } = useSubstitutionManager({
    selections,
    updateSelections: setSelections,
    onSelectionChange,
    performanceCategory
  });

  // Initialize drop operations
  const { handleDrop } = useDropOperations({
    selections,
    updateSelections: setSelections,
    selectedPlayerId,
    setSelectedPlayerId,
    draggingPlayer,
    setDraggingPlayer: (playerId) => {
      if (playerId === null) handleDragEnd();
    },
    performanceCategory
  });

  // Update parent component when selections change
  useEffect(() => {
    onSelectionChange(selections);
    
    // Update squad players list based on selections
    if (onSquadPlayersChange) {
      const selectedPlayerIds = Object.values(selections)
        .map(selection => selection.playerId)
        .filter(id => id !== "unassigned");
      
      // Remove duplicates
      const uniquePlayerIds = [...new Set(selectedPlayerIds)];
      onSquadPlayersChange(uniquePlayerIds);
    }
  }, [selections, onSelectionChange, onSquadPlayersChange]);

  // Handle player click in the available players list
  const handlePlayerClick = (playerId: string) => {
    // If player is already selected, deselect them
    if (selectedPlayerId === playerId) {
      setSelectedPlayerId(null);
    } else {
      // Otherwise, select the player
      setSelectedPlayerId(playerId);
    }
  };

  // Handle removing a player from a position
  const handleRemovePlayer = (slotId: string) => {
    const updatedSelections = { ...selections };
    delete updatedSelections[slotId];
    setSelections(updatedSelections);
  };

  // Function to get player by ID from available players
  const getPlayerById = (playerId: string) => {
    return availablePlayers.find(player => player.id === playerId);
  };

  // Function to get all available players (not yet selected)
  const getAvailablePlayers = () => {
    // No need to filter out selected players - allow multiple positions
    return availablePlayers;
  };

  // Function to get player from squad by ID
  const getPlayer = (playerId: string) => {
    return availablePlayers.find(player => player.id === playerId);
  };

  // Get available players for the squad
  const getAvailableSquadPlayers = () => {
    return squadPlayers.length > 0
      ? availablePlayers.filter(player => squadPlayers.includes(player.id))
      : availablePlayers;
  };

  // Handle formation template change
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    if (onTemplateChange) {
      onTemplateChange(template);
    }
  };

  // Show all players by default
  const showPlayers = true;

  return {
    selectedPlayerId,
    draggingPlayer,
    selectedTemplate,
    selections,
    formationRef,
    handleDrop,
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
