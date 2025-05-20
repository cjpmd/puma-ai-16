
import React, { useState, useEffect, useCallback } from "react";
import { FormationFormat } from "../types";
import { PerformanceCategory } from "@/types/player";
import { FormationHelperText } from "./FormationHelperText";
import { useDraggableFormation } from "./hooks/useDraggableFormation";
import { FormationHeader } from "./components/FormationHeader";
import { SquadModeView } from "./components/SquadModeView";
import { FormationModeView } from "./components/FormationModeView";
import { usePeriodManagement } from "./hooks/usePeriodManagement";
import { useSquadModeToggle } from "./hooks/useSquadModeToggle";
import { toast } from "sonner";

export interface DraggableFormationProps {
  format: FormationFormat;
  availablePlayers: any[];
  squadPlayers: string[];
  initialSelections?: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>;
  onSelectionChange: (selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>) => void;
  performanceCategory?: string;
  onSquadPlayersChange?: (playerIds: string[]) => void;
  formationTemplate?: string;
  onTemplateChange?: (template: string) => void;
  renderSubstitutionIndicator?: (position: string) => React.ReactNode;
  periodNumber?: number;
  periodDuration?: number;
  onPeriodChange?: (periodNumber: number) => void;
  onDurationChange?: (duration: number) => void;
  periodId?: number;
  forceSquadMode?: boolean;
}

export const DraggableFormation: React.FC<DraggableFormationProps> = ({
  format,
  availablePlayers,
  squadPlayers,
  initialSelections,
  onSelectionChange,
  performanceCategory = PerformanceCategory.MESSI,
  onSquadPlayersChange,
  formationTemplate = "All",
  onTemplateChange,
  renderSubstitutionIndicator,
  periodNumber = 1,
  periodDuration = 45,
  onPeriodChange,
  onDurationChange,
  periodId,
  forceSquadMode
}) => {
  // Use our period management hook
  const {
    localPeriod,
    localDuration,
    handlePeriodChange,
    handleDurationChange,
    getPeriodDisplayName
  } = usePeriodManagement({
    initialPeriodNumber: periodNumber,
    initialPeriodDuration: periodDuration,
    onPeriodChange,
    onDurationChange,
    periodId
  });

  const {
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
    showPlayers,
    addPlayerToSquad,
    removePlayerFromSquad,
    squadPlayers: localSquadPlayers
  } = useDraggableFormation({
    initialSelections,
    onSelectionChange,
    availablePlayers,
    squadPlayers,
    performanceCategory: performanceCategory as PerformanceCategory,
    format,
    formationTemplate,
    onTemplateChange,
    onSquadPlayersChange,
    periodNumber: localPeriod,
    periodDuration: localDuration,
    forceSquadMode
  });

  // Use our squad mode toggle hook
  const { 
    squadMode,
    toggleSquadMode,
    canExitSquadMode,
    setSquadMode
  } = useSquadModeToggle({
    initialSquadMode: forceSquadMode === true || (initialSelections && Object.keys(initialSelections).length === 0),
    squadPlayers: localSquadPlayers,
    minRequiredPlayers: 1
  });

  // Handle toggle squad mode with better feedback
  const handleToggleSquadMode = () => {
    if (squadMode && !canExitSquadMode) {
      toast.warning("Add at least one player to the squad first before proceeding");
      return;
    }
    toggleSquadMode();
  };

  // Debug state
  useEffect(() => {
    console.log("DraggableFormation state:", {
      squadMode,
      localSquadPlayers: localSquadPlayers.length,
      selections: Object.keys(selections).length,
      canExitSquadMode,
      forceSquadMode
    });
  }, [squadMode, localSquadPlayers, selections, canExitSquadMode, forceSquadMode]);

  // Force squad mode if needed
  useEffect(() => {
    if (forceSquadMode) {
      setSquadMode(true);
    }
  }, [forceSquadMode, setSquadMode]);

  // Handle the case where we have initialSelections but no squad players
  useEffect(() => {
    if (initialSelections && Object.keys(initialSelections).length > 0 && localSquadPlayers.length === 0) {
      // Extract player IDs from initialSelections
      const playerIds = Object.values(initialSelections)
        .map(selection => selection.playerId)
        .filter(id => id !== "unassigned");
      
      // Add each player to squad
      if (playerIds.length > 0 && onSquadPlayersChange) {
        console.log("Adding initial players to squad:", playerIds);
        onSquadPlayersChange(playerIds);
      }
    }
  }, [initialSelections, localSquadPlayers.length, onSquadPlayersChange]);

  return (
    <div className="space-y-6" id={`team-selection-${periodId || localPeriod}`}>
      <FormationHeader 
        squadMode={squadMode}
        onToggleSquadMode={handleToggleSquadMode}
        squadPlayersLength={localSquadPlayers.length}
        periodDisplayName={getPeriodDisplayName()}
        format={format}
        template={selectedTemplate}
        onTemplateChange={onTemplateChange}
        onDurationChange={onDurationChange ? handleDurationChange : undefined}
        localDuration={localDuration}
        periodId={periodId}
        canExitSquadMode={canExitSquadMode}
      />
      
      <FormationHelperText 
        selectedPlayerId={selectedPlayerId}
        draggingPlayer={draggingPlayer}
        squadMode={squadMode}
        periodNumber={localPeriod}
      />
      
      {squadMode ? (
        <SquadModeView 
          getAvailablePlayers={getAvailablePlayers}
          selectedPlayerId={selectedPlayerId}
          onPlayerClick={handlePlayerClick}
          squadPlayers={localSquadPlayers}
          onAddToSquad={addPlayerToSquad}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
          onRemoveFromSquad={removePlayerFromSquad}
        />
      ) : (
        <FormationModeView 
          format={format}
          template={selectedTemplate}
          selections={selections}
          selectedPlayerId={selectedPlayerId}
          onDrop={handleDrop}
          onRemovePlayer={handleRemovePlayer}
          getPlayerById={getPlayerById}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
          renderSubstitutionIndicator={renderSubstitutionIndicator}
          availablePlayers={availablePlayers}
          squadPlayers={localSquadPlayers}
          onRemoveFromSquad={removePlayerFromSquad}
          onPlayerClick={handlePlayerClick}
          addSubstitute={addSubstitute}
          removeSubstitute={removeSubstitute}
          handleSubstituteDrop={handleSubstituteDrop}
          formationRef={formationRef}
        />
      )}
    </div>
  );
};
