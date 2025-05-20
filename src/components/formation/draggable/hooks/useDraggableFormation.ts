
import { useState, useRef, useEffect, useCallback } from "react";
import { FormationFormat } from "../../types";
import { PerformanceCategory } from "@/types/player";
import { useSubstitutionManager } from "./useSubstitutionManager";
import { useSquadManagement } from "./useSquadManagement";
import { useFormationState } from "./useFormationState";
import { useTemplateManagement } from "./useTemplateManagement";
import { usePlayerData } from "./usePlayerData";
import { toast } from "sonner";

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
  performanceCategory = PerformanceCategory.MESSI,
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
    addPlayerToSquad,
    removePlayerFromSquad,
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
  const { 
    addSubstitute, 
    removeSubstitute, 
    handleSubstituteDrop 
  } = useSubstitutionManager({
    selections: formationSelections,
    updateSelections: onSelectionChange,
    onSelectionChange,
    performanceCategory
  });

  // We need this for the useEffect that updates squad players from selections
  const previousSelectionsRef = useRef({});
  const previousSquadPlayersRef = useRef<string[]>([]);

  // Log whenever squad players change
  useEffect(() => {
    if (JSON.stringify(localSquadPlayers) !== JSON.stringify(previousSquadPlayersRef.current)) {
      console.log("Squad players changed:", {
        old: previousSquadPlayersRef.current,
        new: localSquadPlayers
      });
      previousSquadPlayersRef.current = [...localSquadPlayers];
    }
  }, [localSquadPlayers]);

  // Log whenever selections change
  useEffect(() => {
    if (JSON.stringify(formationSelections) !== JSON.stringify(previousSelectionsRef.current)) {
      console.log("Selections changed:", {
        old: Object.keys(previousSelectionsRef.current).length,
        new: Object.keys(formationSelections).length
      });
      previousSelectionsRef.current = {...formationSelections};
    }
  }, [formationSelections]);

  // Update squad players when selections change to ensure sync
  useEffect(() => {
    if (onSquadPlayersChange && Object.keys(formationSelections).length > 0) {
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
        console.log("Updating squad players from selections:", {
          before: localSquadPlayers.length,
          after: newSquadPlayers.length
        });
        onSquadPlayersChange(newSquadPlayers);
      }
    }
  }, [formationSelections, onSelectionChange, localSquadPlayers, onSquadPlayersChange]);

  // Add improved squad player management
  const addPlayerToSquadWithFeedback = useCallback((playerId: string) => {
    addPlayerToSquad(playerId);
    toast.success("Player added to squad");
  }, [addPlayerToSquad]);

  const removePlayerFromSquadWithFeedback = useCallback((playerId: string) => {
    // First check if this player is used in any positions
    const playerInUse = Object.values(formationSelections).some(
      selection => selection.playerId === playerId
    );
    
    if (playerInUse) {
      toast.warning("This player is currently in a position. Remove them from all positions first.");
      return;
    }
    
    removePlayerFromSquad(playerId);
    toast.success("Player removed from squad");
  }, [removePlayerFromSquad, formationSelections]);

  const showPlayers = true;

  return {
    selectedPlayerId,
    draggingPlayer,
    selectedTemplate,
    selections: formationSelections,
    formationRef,
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
    addPlayerToSquad: addPlayerToSquadWithFeedback,
    removePlayerFromSquad: removePlayerFromSquadWithFeedback
  };
};
