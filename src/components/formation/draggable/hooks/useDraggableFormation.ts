
import { useState, useRef, useEffect } from "react";
import { FormationFormat } from "../../types";
import { PerformanceCategory } from "@/types/player";
import { useSubstitutionManager } from "./useSubstitutionManager";
import { useSquadManagement } from "./useSquadManagement";
import { useFormationState } from "./useFormationState";
import { useTemplateManagement } from "./useTemplateManagement";
import { usePlayerData } from "./usePlayerData";

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
  periodNumber?: number;
  periodDuration?: number;
  forceSquadMode?: boolean;
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
  onSquadPlayersChange,
  periodNumber = 1,
  periodDuration = 45,
  forceSquadMode
}: UseDraggableFormationProps) => {
  // Initialize squad management
  const {
    squadPlayers: localSquadPlayers,
    squadMode,
    addPlayerToSquad,
    removePlayerFromSquad,
    toggleSquadMode,
    returnToSquadSelection,
    finishSquadSelection
  } = useSquadManagement({
    initialSquadPlayers: squadPlayers,
    onSquadPlayersChange,
    forceSquadMode
  });

  // Initialize formation state
  const {
    selections: formationSelections,
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
  } = useFormationState({
    initialSelections,
    onSelectionChange,
    performanceCategory,
    periodNumber,
    periodDuration,
    squadPlayers: localSquadPlayers
  });

  // Initialize template management
  const {
    selectedTemplate,
    handleTemplateChange
  } = useTemplateManagement({
    initialTemplate: formationTemplate,
    onTemplateChange
  });

  // Initialize player data retrieval
  const {
    getPlayerById,
    getAvailablePlayers,
    getPlayer,
    getAvailableSquadPlayers
  } = usePlayerData({
    availablePlayers,
    squadPlayers: localSquadPlayers
  });

  // Initialize substitution manager
  // Fix: Pass direct object instead of function to updateSelections
  const { 
    addSubstitute, 
    removeSubstitute, 
    handleSubstituteDrop 
  } = useSubstitutionManager({
    selections: formationSelections,
    updateSelections: onSelectionChange, // Fixed: Pass the callback directly
    onSelectionChange,
    performanceCategory
  });

  // We need this for the useEffect that updates squad players from selections
  const previousSelectionsRef = useRef({});

  // Update squad players when selections change
  useEffect(() => {
    if (onSquadPlayersChange) {
      // Get all currently selected players
      const selectedPlayerIds = Object.values(formationSelections)
        .map(selection => selection.playerId)
        .filter(id => id !== "unassigned");
      
      // IMPORTANT: Don't lose existing squad players when updating
      const newSquadPlayers = [...localSquadPlayers];
      
      // Only add new players that aren't already in the squad
      selectedPlayerIds.forEach(id => {
        if (!newSquadPlayers.includes(id)) {
          newSquadPlayers.push(id);
        }
      });
      
      // Only update if something actually changed
      if (JSON.stringify([...newSquadPlayers].sort()) !== JSON.stringify([...localSquadPlayers].sort())) {
        onSquadPlayersChange(newSquadPlayers);
      }
    }
  }, [formationSelections, onSelectionChange, localSquadPlayers]);

  const showPlayers = true;

  return {
    selectedPlayerId,
    draggingPlayer,
    selectedTemplate,
    selections: formationSelections,
    formationRef,
    squadMode,
    squadPlayers: localSquadPlayers,
    currentPeriod,
    periodLength,
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
    showPlayers,
    toggleSquadMode,
    addPlayerToSquad,
    removePlayerFromSquad,
    finishSquadSelection,
    returnToSquadSelection
  };
};
