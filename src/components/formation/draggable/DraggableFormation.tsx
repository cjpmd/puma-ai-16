
import React from "react";
import { useDraggableFormation } from "./hooks/useDraggableFormation";
import { FormationHelperText } from "./FormationHelperText";
import { FormationFormat } from "../types";
import { FormationGrid } from "./components/FormationGrid";
import { SubstitutesSection } from "./components/SubstitutesSection";
import { AvailablePlayersSection } from "./components/AvailablePlayersSection";

interface DraggableFormationProps {
  format: FormationFormat;
  availablePlayers: any[];
  squadPlayers?: string[];
  initialSelections?: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>;
  onSelectionChange?: (selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>) => void;
  renderSubstitutionIndicator?: (position: string) => React.ReactNode;
}

export const DraggableFormation: React.FC<DraggableFormationProps> = ({
  format,
  availablePlayers = [],
  squadPlayers = [],
  initialSelections = {},
  onSelectionChange,
  renderSubstitutionIndicator
}) => {
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
    squadPlayers
  });

  const availableSquadPlayers = getAvailableSquadPlayers();

  return (
    <div className="space-y-6">
      <FormationHelperText 
        draggingPlayer={draggingPlayer}
        selectedPlayerId={selectedPlayerId}
      />
      
      <FormationGrid 
        format={format}
        formationRef={formationRef}
        selections={selections}
        selectedPlayerId={selectedPlayerId}
        handleDrop={handleDrop}
        handleRemovePlayer={handleRemovePlayer}
        getPlayer={getPlayer}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
        renderSubstitutionIndicator={renderSubstitutionIndicator}
      />
      
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
