
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
  renderSubstitutionIndicator
}) => {
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
    onSquadPlayersChange
  });

  return (
    <div className="space-y-6">
      {/* Squad mode toggle button */}
      <div className="flex justify-between items-center">
        <Button 
          variant={squadMode ? "default" : "outline"}
          onClick={squadMode ? finishSquadSelection : returnToSquadSelection}
          className="flex items-center"
          disabled={squadMode && localSquadPlayers.length === 0}
        >
          {squadMode ? (
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
        
        {!squadMode && (
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
        squadMode={squadMode}
      />
      
      {/* Squad selection mode vs Position assignment mode */}
      {squadMode ? (
        <div className="space-y-4">
          {/* Available Players List */}
          <AvailablePlayersSection
            players={getAvailablePlayers()}
            selectedPlayerId={selectedPlayerId}
            onPlayerClick={handlePlayerClick}
            squadPlayers={localSquadPlayers}
            onAddToSquad={addPlayerToSquad}
            squadMode={true}
          />
          
          {/* Squad Players List */}
          <SquadPlayersSection
            players={availablePlayers}
            squadPlayers={localSquadPlayers}
            onRemoveFromSquad={removePlayerFromSquad}
            selectedPlayerId={selectedPlayerId}
            onPlayerClick={handlePlayerClick}
            squadMode={true}
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
            />
          </div>
        </div>
      )}
      
      {/* Substitutes Section - only visible in position assignment mode */}
      {!squadMode && (
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
