
import React, { useState, useEffect } from "react";
import { FormationGrid } from "./components/FormationGrid";
import { FormationFormat } from "../types";
import { PerformanceCategory } from "@/types/player";
import { FormationTemplateSelector } from "../FormationTemplateSelector";
import { FormationHelperText } from "./FormationHelperText";
import { AvailablePlayersSection } from "./components/AvailablePlayersSection";
import { SquadPlayersSection } from "./components/SquadPlayersSection";
import { SubstitutesSection } from "./components/SubstitutesSection";
import { useDraggableFormation } from "./hooks/useDraggableFormation";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Grip } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  periodId?: number; // Add support for custom period IDs
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
    forceSquadMode: squadModeState // Pass the local squad mode state
  });

  // Use effect to synchronize the local squad mode state with the hook's state
  useEffect(() => {
    if (squadMode !== squadModeState) {
      setSquadModeState(squadMode);
    }
  }, [squadMode, squadModeState]);

  // Handle period change
  const handlePeriodChange = (value: string) => {
    const period = parseInt(value);
    setLocalPeriod(period);
    if (onPeriodChange) {
      onPeriodChange(period);
    }
  };

  // Handle duration change
  const handleDurationChange = (value: number) => {
    setLocalDuration(value);
    if (onDurationChange) {
      onDurationChange(value);
    }
  };

  // Handle toggle squad mode - explicitly call the function from the hook
  const handleToggleSquadMode = () => {
    const newSquadMode = !squadModeState;
    setSquadModeState(newSquadMode);
    
    console.log(`Toggling squad mode from ${squadModeState} to ${newSquadMode}`);
    
    if (newSquadMode) {
      returnToSquadSelection();
    } else {
      finishSquadSelection();
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

  return (
    <div className="space-y-6" id={`team-selection-${periodId || periodNumber}`}>
      {/* Top controls - Squad mode toggle and Period/Duration selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Button 
            variant={squadModeState ? "default" : "outline"}
            onClick={handleToggleSquadMode}
            className="flex items-center"
          >
            {squadModeState ? (
              <>
                <Grip className="mr-2 h-4 w-4" />
                Proceed to Position Assignment
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Return to Squad Selection
              </>
            )}
          </Button>
          
          {!squadModeState && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{periodDisplayName()}</span>
              {onDurationChange && (
                <>
                  <Label htmlFor="duration-input" className="ml-4">Duration (min):</Label>
                  <Input
                    id="duration-input"
                    type="number"
                    min="1"
                    max="90"
                    className="w-[80px]"
                    value={localDuration}
                    onChange={(e) => handleDurationChange(parseInt(e.target.value) || 45)}
                  />
                </>
              )}
            </div>
          )}
        </div>
        
        {!squadModeState && (
          <FormationTemplateSelector
            format={format}
            selectedTemplate={selectedTemplate}
            onTemplateChange={handleTemplateChange}
          />
        )}
      </div>
      
      {/* Helper text */}
      <FormationHelperText 
        selectedPlayerId={selectedPlayerId}
        draggingPlayer={draggingPlayer}
        squadMode={squadModeState}
        periodNumber={localPeriod}
      />
      
      {/* Squad selection mode vs Position assignment mode */}
      {squadModeState ? (
        <div className="space-y-4">
          {/* Available Players List */}
          <AvailablePlayersSection
            players={getAvailablePlayers()}
            selectedPlayerId={selectedPlayerId}
            onPlayerClick={handlePlayerClick}
            squadPlayers={localSquadPlayers}
            onAddToSquad={addPlayerToSquad}
            squadMode={true}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
          />
          
          {/* Squad Players List */}
          <SquadPlayersSection
            players={availablePlayers}
            squadPlayers={localSquadPlayers}
            onRemoveFromSquad={removePlayerFromSquad}
            selectedPlayerId={selectedPlayerId}
            onPlayerClick={handlePlayerClick}
            squadMode={true}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="lg:w-3/4 h-[500px]">
            <FormationGrid
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
            />
          </div>
          
          <div className="lg:w-1/4 space-y-4">
            {/* Squad Players List for Dragging */}
            <SquadPlayersSection
              players={availablePlayers}
              squadPlayers={localSquadPlayers}
              onRemoveFromSquad={removePlayerFromSquad}
              selectedPlayerId={selectedPlayerId}
              onPlayerClick={handlePlayerClick}
              squadMode={false}
              handleDragStart={handleDragStart}
              handleDragEnd={handleDragEnd}
            />
          </div>
        </div>
      )}
      
      {/* Substitutes Section - only visible in position assignment mode */}
      {!squadModeState && (
        <SubstitutesSection
          selections={selections}
          availablePlayers={availablePlayers}
          getPlayerById={getPlayerById}
          addSubstitute={addSubstitute}
          removeSubstitute={removeSubstitute}
          selectedPlayerId={selectedPlayerId}
          onPlayerClick={handlePlayerClick}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
          renderSubstitutionIndicator={renderSubstitutionIndicator}
          format={format}
        />
      )}
    </div>
  );
};
