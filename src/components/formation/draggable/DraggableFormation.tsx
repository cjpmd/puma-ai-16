
import React, { useState, useEffect } from "react";
import { FormationFormat } from "../types";
import { PerformanceCategory } from "@/types/player";
import { FormationHelperText } from "./FormationHelperText";
import { useDraggableFormation } from "./hooks/useDraggableFormation";
import { FormationHeader } from "./components/FormationHeader";
import { SquadModeView } from "./components/SquadModeView";
import { FormationModeView } from "./components/FormationModeView";

export interface DraggableFormationProps {
  format: FormationFormat;
  availablePlayers: any[];
  squadPlayers: string[];
  initialSelections?: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>;
  onSelectionChange: (selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>) => void;
  performanceCategory?: PerformanceCategory;
  onSquadPlayersChange?: (playerIds: string[]) => void;
  formationTemplate?: string;
  onTemplateChange?: (template: string) => void;
  renderSubstitutionIndicator?: (position: string) => React.ReactNode;
  periodNumber?: number;
  periodDuration?: number;
  onPeriodChange?: (periodNumber: number) => void;
  onDurationChange?: (duration: number) => void;
  periodId?: number;
}

export const DraggableFormation: React.FC<DraggableFormationProps> = ({
  format,
  availablePlayers,
  squadPlayers,
  initialSelections,
  onSelectionChange,
  performanceCategory = "MESSI",
  onSquadPlayersChange,
  formationTemplate = "All",
  onTemplateChange,
  renderSubstitutionIndicator,
  periodNumber = 1,
  periodDuration = 45,
  onPeriodChange,
  onDurationChange,
  periodId
}) => {
  const [localPeriod, setLocalPeriod] = useState(periodNumber);
  const [localDuration, setLocalDuration] = useState(periodDuration);
  const [squadModeState, setSquadModeState] = useState(true);

  console.log("DraggableFormation props:", {
    format,
    squadPlayers: squadPlayers.length,
    performanceCategory,
    formationTemplate,
    periodNumber,
    periodDuration
  });

  const {
    selectedPlayerId,
    draggingPlayer,
    selectedTemplate,
    selections,
    formationRef,
    squadMode,
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
    returnToSquadSelection,
    squadPlayers: localSquadPlayers
  } = useDraggableFormation({
    initialSelections,
    onSelectionChange,
    availablePlayers,
    squadPlayers,
    performanceCategory,
    format,
    formationTemplate,
    onTemplateChange,
    onSquadPlayersChange,
    periodNumber: localPeriod,
    periodDuration: localDuration,
    forceSquadMode: squadModeState
  });

  useEffect(() => {
    if (squadMode !== squadModeState) {
      setSquadModeState(squadMode);
    }
  }, [squadMode, squadModeState]);

  const handlePeriodChange = (value: string) => {
    const period = parseInt(value);
    setLocalPeriod(period);
    if (onPeriodChange) {
      onPeriodChange(period);
    }
  };

  const handleDurationChange = (value: number) => {
    setLocalDuration(value);
    if (onDurationChange) {
      onDurationChange(value);
    }
  };

  const handleToggleSquadMode = () => {
    const newSquadMode = !squadModeState;
    setSquadModeState(newSquadMode);
    
    console.log(`Toggling squad mode from ${squadModeState} to ${newSquadMode}`);
    
    if (newSquadMode) {
      returnToSquadSelection();
    } else {
      if (localSquadPlayers.length > 0) {
        finishSquadSelection();
      }
    }
  };

  const periodDisplayName = () => {
    if (periodId) {
      if (periodId === 100) return "First Half";
      if (periodId === 200) return "Second Half";
      return `Period ${periodId}`;
    }
    return periodNumber === 1 ? "First Half" : "Second Half";
  };

  console.log("DraggableFormation state:", {
    squadMode: squadModeState,
    localSquadPlayers: localSquadPlayers.length,
    selections: Object.keys(selections).length
  });

  return (
    <div className="space-y-6" id={`team-selection-${periodId || periodNumber}`}>
      <FormationHeader 
        squadMode={squadModeState}
        onToggleSquadMode={handleToggleSquadMode}
        squadPlayersLength={localSquadPlayers.length}
        periodDisplayName={periodDisplayName()}
        format={format}
        template={selectedTemplate}
        onTemplateChange={onTemplateChange}
        onDurationChange={onDurationChange ? handleDurationChange : undefined}
        localDuration={localDuration}
        periodId={periodId}
      />
      
      <FormationHelperText 
        selectedPlayerId={selectedPlayerId}
        draggingPlayer={draggingPlayer}
        squadMode={squadModeState}
        periodNumber={localPeriod}
      />
      
      {squadModeState ? (
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
        />
      )}
    </div>
  );
};
