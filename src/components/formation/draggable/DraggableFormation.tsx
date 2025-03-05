
import { useEffect, useState } from "react";
import { FormationFormat } from "../types";
import { FormationGrid } from "./components/FormationGrid";
import { AvailablePlayersSection } from "./components/AvailablePlayersSection";
import { SubstitutesSection } from "./components/SubstitutesSection";
import { useDraggableFormation } from "./hooks/useDraggableFormation";
import { PerformanceCategory } from "@/types/player";
import { FormationTemplateSelector } from "../FormationTemplateSelector";
import { Button } from "@/components/ui/button";

interface DraggableFormationProps {
  format: FormationFormat;
  availablePlayers: any[];
  squadPlayers?: string[];
  initialSelections?: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>;
  onSelectionChange?: (selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>) => void;
  performanceCategory?: PerformanceCategory;
  onSquadPlayersChange?: (playerIds: string[]) => void;
  formationTemplate?: string;
  onTemplateChange?: (template: string) => void;
}

export const DraggableFormation = ({
  format,
  availablePlayers,
  squadPlayers = [],
  initialSelections = {},
  onSelectionChange,
  performanceCategory = "MESSI",
  onSquadPlayersChange,
  formationTemplate,
  onTemplateChange
}: DraggableFormationProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState(formationTemplate || "All");
  const [selectedFormat, setSelectedFormat] = useState<FormationFormat>(format);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  
  const {
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
    setSelectedFormat(format);
  }, [format]);

  // Update selected template when prop changes
  useEffect(() => {
    if (formationTemplate) {
      setSelectedTemplate(formationTemplate);
    }
  }, [formationTemplate]);

  // Handler for formation template changes
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    if (onTemplateChange) {
      onTemplateChange(template);
    }
  };

  // Helper to render substitution indicators
  const renderSubstitutionIndicator = (position: string) => {
    return position.startsWith('sub-') ? (
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
        S
      </div>
    ) : null;
  };

  return (
    <div className="space-y-4">
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
        handleSubstituteDrop={handleSubstituteDrop}
        handleRemovePlayer={handleRemovePlayer}
        getPlayer={getPlayer}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
        selectedPlayerId={selectedPlayerId}
        draggingPlayer={draggingPlayer}
      />
      
      <AvailablePlayersSection 
        availablePlayers={getAvailableSquadPlayers()}
        handlePlayerSelect={handlePlayerSelect}
        selectedPlayerId={selectedPlayerId}
        onSquadPlayersChange={onSquadPlayersChange}
      />
    </div>
  );
};
