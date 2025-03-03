
import React, { useRef } from "react";
import { PitchMarkings } from "../components/PitchMarkings";
import { SubstitutesSection } from "../components/SubstitutesSection";
import { AvailableSquadPlayers } from "../components/AvailableSquadPlayers";
import { FormationSlots } from "../FormationSlots";
import { useDraggableFormation } from "./hooks/useDraggableFormation";
import { FormationHelperText } from "./FormationHelperText";
import { FormationPositionSlot } from "./FormationPositionSlot";
import { FormationFormat } from "../types";

interface DraggableFormationProps {
  format: FormationFormat;
  availablePlayers: any[];
  squadPlayers?: string[];
  initialSelections?: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>;
  onSelectionChange?: (selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>) => void;
  renderSubstitutionIndicator?: (position: string) => React.ReactNode;
}

export const DraggableFormation: React.FC<DraggableFormationProps> = ({
  format,
  availablePlayers,
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

  return (
    <div className="relative flex flex-col items-center">
      <div 
        ref={formationRef}
        className="relative w-[60%] mx-auto aspect-[2/3] bg-green-600 overflow-hidden mb-6 rounded-lg"
      >
        {/* Pitch markings */}
        <PitchMarkings format={format} />
        
        {/* Helper text for interaction */}
        <FormationHelperText 
          draggingPlayer={draggingPlayer} 
          selectedPlayerId={selectedPlayerId} 
        />
        
        {/* Formation Slots - Positions */}
        <div className="absolute inset-0 z-10">
          <FormationSlots
            format={format}
            showAllPositions={true}
            onDrop={handleDrop}
            renderSlot={(slotId, position, dropProps) => {
              const selection = selections[slotId];
              const player = selection ? getPlayer(selection.playerId) : null;
              
              return (
                <FormationPositionSlot
                  slotId={slotId}
                  position={position}
                  selection={selection}
                  player={player}
                  selectedPlayerId={selectedPlayerId}
                  onDrop={handleDrop}
                  onRemovePlayer={handleRemovePlayer}
                  renderSubstitutionIndicator={renderSubstitutionIndicator}
                  dropProps={dropProps}
                />
              );
            }}
          />
        </div>
      </div>
      
      {/* Substitutes section */}
      <SubstitutesSection 
        selections={selections}
        getPlayer={getPlayer}
        handleRemovePlayer={handleRemovePlayer}
        onSubstituteDrop={handleSubstituteDrop}
      />
      
      {/* Available Squad Players */}
      <AvailableSquadPlayers 
        availableSquadPlayers={getAvailableSquadPlayers()}
        handlePlayerSelect={handlePlayerSelect}
        selectedPlayerId={selectedPlayerId}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      />
    </div>
  );
};
