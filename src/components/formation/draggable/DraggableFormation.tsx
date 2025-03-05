
import React, { useState, useEffect } from "react";
import { useDraggableFormation } from "./hooks/useDraggableFormation";
import { FormationHelperText } from "./FormationHelperText";
import { FormationFormat } from "../types";
import { FormationGrid } from "./components/FormationGrid";
import { SubstitutesSection } from "./components/SubstitutesSection";
import { AvailablePlayersSection } from "./components/AvailablePlayersSection";
import { FormationTemplateSelector } from "../FormationTemplateSelector";
import { Card, CardContent } from "@/components/ui/card";
import { getFormationTemplatesByFormat } from "../utils/formationTemplates";
import { PerformanceCategory } from "@/types/player";

interface DraggableFormationProps {
  format: FormationFormat;
  availablePlayers: any[];
  squadPlayers?: string[];
  initialSelections?: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>;
  onSelectionChange?: (selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>) => void;
  renderSubstitutionIndicator?: (position: string) => React.ReactNode;
  performanceCategory?: PerformanceCategory;
  onSquadPlayersChange?: (playerIds: string[]) => void;
  formationTemplate?: string;
  onTemplateChange?: (template: string) => void;
}

export const DraggableFormation: React.FC<DraggableFormationProps> = ({
  format,
  availablePlayers = [],
  squadPlayers = [],
  initialSelections = {},
  onSelectionChange,
  renderSubstitutionIndicator,
  performanceCategory,
  onSquadPlayersChange,
  formationTemplate = "All",
  onTemplateChange
}) => {
  const [selectedFormat, setSelectedFormat] = useState<FormationFormat>(format);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(formationTemplate);
  
  const {
    selectedPlayerId,
    selections,
    formationRef,
    draggingPlayer,
    handleDrop,
    handlePlayerSelect,
    handleRemovePlayer,
    handleDragStart,
    handleDragEnd,
    handleSubstituteDrop,
    getPlayer,
    getAvailableSquadPlayers
  } = useDraggableFormation({
    initialSelections,
    onSelectionChange,
    availablePlayers,
    squadPlayers,
    performanceCategory
  });

  // Update template when format changes
  useEffect(() => {
    setSelectedTemplate(formationTemplate || "All");
  }, [formationTemplate]);

  // Update template when a new one is selected
  useEffect(() => {
    if (onTemplateChange && selectedTemplate !== formationTemplate) {
      onTemplateChange(selectedTemplate);
    }
  }, [selectedTemplate, onTemplateChange, formationTemplate]);

  const availableSquadPlayers = getAvailableSquadPlayers();

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    if (onTemplateChange) {
      onTemplateChange(template);
    }
  };

  return (
    <div className="space-y-6">
      <FormationTemplateSelector
        format={selectedFormat}
        selectedTemplate={selectedTemplate}
        onTemplateChange={handleTemplateChange}
      />
      
      <div className="relative">
        <FormationGrid 
          format={selectedFormat}
          formationRef={formationRef}
          selections={selections}
          selectedPlayerId={selectedPlayerId}
          handleDrop={handleDrop}
          handleRemovePlayer={handleRemovePlayer}
          getPlayer={getPlayer}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
          renderSubstitutionIndicator={renderSubstitutionIndicator}
          formationTemplate={selectedTemplate}
        />
      </div>
      
      <SubstitutesSection 
        selections={selections}
        getPlayer={getPlayer}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
        handleRemovePlayer={handleRemovePlayer}
        handleSubstituteDrop={handleSubstituteDrop}
        draggingPlayer={draggingPlayer}
      />
      
      <AvailablePlayersSection 
        availableSquadPlayers={availableSquadPlayers}
        selectedPlayerId={selectedPlayerId}
        handlePlayerSelect={handlePlayerSelect}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
      />
    </div>
  );
};
