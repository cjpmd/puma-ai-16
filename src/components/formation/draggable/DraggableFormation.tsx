
import React from "react";
import { PitchMarkings } from "../components/PitchMarkings";
import { SubstitutesSection } from "../components/SubstitutesSection";
import { AvailableSquadPlayers } from "../components/AvailableSquadPlayers";
import { FormationSlots } from "../FormationSlots";
import { useDraggableFormation } from "./hooks/useDraggableFormation";
import { FormationHelperText } from "./FormationHelperText";
import { FormationPositionSlot } from "./FormationPositionSlot";

interface DraggableFormationProps {
  format: "5-a-side" | "7-a-side" | "9-a-side" | "11-a-side";
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
        className="relative w-full max-w-xl aspect-[2/3] bg-green-600 bg-gradient-to-b from-green-500 to-green-700 rounded-lg overflow-hidden mb-6"
      >
        {/* Pitch markings */}
        <PitchMarkings format={format} />
        
        {/* Helper text for interaction */}
        <FormationHelperText 
          draggingPlayer={draggingPlayer} 
          selectedPlayerId={selectedPlayerId} 
        />
        
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
