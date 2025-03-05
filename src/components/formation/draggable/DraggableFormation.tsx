
import React, { useState, useEffect } from "react";
import { useDraggableFormation } from "./hooks/useDraggableFormation";
import { FormationHelperText } from "./FormationHelperText";
import { FormationFormat } from "../types";
import { FormationGrid } from "./components/FormationGrid";
import { SubstitutesSection } from "./components/SubstitutesSection";
import { AvailablePlayersSection } from "./components/AvailablePlayersSection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const templates = getFormationTemplatesByFormat(selectedFormat);
  
  const {
    selectedPlayerId,
    selections,
    formationRef,
    draggingPlayer,
    handleDrop: originalHandleDrop,
    handlePlayerSelect,
    handleRemovePlayer,
    handleDragStart,
    handleDragEnd,
    handleSubstituteDrop: originalHandleSubstituteDrop,
    getPlayer,
    getAvailableSquadPlayers
  } = useDraggableFormation({
    initialSelections,
    onSelectionChange,
    availablePlayers,
    squadPlayers,
    performanceCategory
  });

  // Wrapper functions to match the expected signatures
  const handleDrop = (slotId: string, position: string, fromSlotId?: string) => {
    originalHandleDrop(slotId, position, fromSlotId);
  };

  const handleSubstituteDrop = (playerId: string, fromSlotId?: string) => {
    originalHandleSubstituteDrop(playerId, fromSlotId);
  };

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

  const handleFormatChange = (newFormat: FormationFormat) => {
    setSelectedFormat(newFormat);
  };

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    if (onTemplateChange) {
      onTemplateChange(template);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex justify-between items-center">
            <span>Team Formation</span>
            <div className="flex space-x-2">
              <Select
                value={selectedTemplate}
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Formation" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(templates).map(template => (
                    <SelectItem key={template} value={template}>
                      {template}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={selectedFormat}
                onValueChange={(value) => handleFormatChange(value as FormationFormat)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5-a-side">5-a-side</SelectItem>
                  <SelectItem value="7-a-side">7-a-side</SelectItem>
                  <SelectItem value="9-a-side">9-a-side</SelectItem>
                  <SelectItem value="11-a-side">11-a-side</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormationHelperText 
            draggingPlayer={draggingPlayer}
            selectedPlayerId={selectedPlayerId}
          />
          
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
        </CardContent>
      </Card>
      
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
