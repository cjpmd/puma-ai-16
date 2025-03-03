
import React from "react";
import { PitchMarkings } from "../components/PitchMarkings";
import { SubstitutesSection } from "../components/SubstitutesSection";
import { AvailableSquadPlayers } from "../components/AvailableSquadPlayers";
import { FormationSlots } from "../FormationSlots";
import { useDraggableFormation } from "./useDraggableFormation";
import { FormationHelperText } from "./FormationHelperText";

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
          onDrop={handleDrop}
          renderSlot={(slotId, position, dropProps) => {
            const selection = selections[slotId];
            const player = selection ? getPlayer(selection.playerId) : null;
            
            return (
              <div
                {...dropProps}
                className={`${dropProps.className} w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center ${
                  !player ? 'border-2 border-dashed border-white/50 hover:border-white/80' : ''
                }`}
                onClick={() => {
                  if (selectedPlayerId) {
                    handleDrop(slotId, position);
                  }
                }}
              >
                {selection && player ? (
                  <div className="relative">
                    <div
                      className="relative flex items-center justify-center w-8 h-8 bg-white/90 rounded-full cursor-pointer hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePlayer(slotId);
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-5 h-5 flex items-center justify-center bg-blue-500 text-white rounded-full text-[9px] font-bold">
                          {player.squad_number || player.name.charAt(0)}
                        </div>
                        <div className="text-[7px] mt-0.5 max-w-5 truncate">
                          {player.name.split(' ')[0]}
                          {selection.isSubstitution && (
                            <span className="ml-0.5 text-orange-500">↑</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Substitution indicator */}
                    {renderSubstitutionIndicator && renderSubstitutionIndicator(position)}
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-200 bg-opacity-70 rounded-full cursor-pointer hover:bg-gray-300">
                    <span className="text-[8px] font-medium">{position}</span>
                  </div>
                )}
              </div>
            );
          }}
        />
      </div>
      
      {/* Substitutes section */}
      <SubstitutesSection 
        selections={selections}
        getPlayer={getPlayer}
        handleRemovePlayer={handleRemovePlayer}
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
