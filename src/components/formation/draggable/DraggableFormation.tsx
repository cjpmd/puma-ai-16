
import React, { useState, useEffect } from "react";
import { FormationGrid } from "./components/FormationGrid";
import { FormationFormat } from "../types";
import { PerformanceCategory } from "@/types/player";
import { FormationTemplateSelector } from "../FormationTemplateSelector";
import { FormationHelperText } from "./FormationHelperText";
import { AvailablePlayersSection } from "./components/AvailablePlayersSection";
import { SubstitutesSection } from "./components/SubstitutesSection";
import { useDraggableFormation } from "./hooks/useDraggableFormation";

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
      {/* Template Selector */}
      <FormationTemplateSelector
        format={format}
        selectedTemplate={selectedTemplate}
        onTemplateChange={handleTemplateChange}
      />
      
      {/* Helper text */}
      <FormationHelperText 
        selectedPlayerId={selectedPlayerId}
        draggingPlayer={draggingPlayer}
      />
      
      {/* The pitch with formation slots */}
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
        
        {/* Available Players List */}
        <div className="lg:w-1/4 space-y-4">
          <AvailablePlayersSection
            players={getAvailablePlayers()}
            selectedPlayerId={selectedPlayerId}
            onPlayerClick={handlePlayerClick}
          />
        </div>
      </div>
      
      {/* Substitutes Section */}
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
    </div>
  );
};
