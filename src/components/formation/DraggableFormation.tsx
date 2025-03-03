
import { useState, useRef, useEffect } from "react";
import { FormationSlots } from "./FormationSlots";
import { PitchMarkings } from "./components/PitchMarkings";
import { FormationSlot } from "./components/FormationSlot";
import { SubstitutesSection } from "./components/SubstitutesSection";
import { AvailableSquadPlayers } from "./components/AvailableSquadPlayers";

interface DraggableFormationProps {
  format: "5-a-side" | "7-a-side" | "9-a-side" | "11-a-side";
  availablePlayers: any[];
  squadPlayers?: string[]; // Add squad players prop
  initialSelections?: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>;
  onSelectionChange?: (selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>) => void;
  renderSubstitutionIndicator?: (position: string) => React.ReactNode;
}

export const DraggableFormation = ({
  format,
  availablePlayers,
  squadPlayers = [],
  initialSelections = {},
  onSelectionChange,
  renderSubstitutionIndicator
}: DraggableFormationProps) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, { playerId: string; position: string; isSubstitution?: boolean }>>(initialSelections || {});
  const formationRef = useRef<HTMLDivElement>(null);
  const [draggingPlayer, setDraggingPlayer] = useState<string | null>(null);

  // Update state when initialSelections change
  useEffect(() => {
    if (initialSelections && Object.keys(initialSelections).length > 0) {
      setSelections(initialSelections);
    }
  }, [initialSelections]);

  // Get player object from ID
  const getPlayer = (playerId: string) => {
    return availablePlayers.find(p => p.id === playerId);
  };

  // Handle drop onto a formation slot
  const handleDrop = (slotId: string, position: string) => {
    // Use either dragging player or selected player
    const playerToAssign = draggingPlayer || selectedPlayerId;
    if (!playerToAssign) return;

    // Get the current slot that this player is assigned to (if any)
    const currentSlotId = Object.entries(selections).find(
      ([_, selection]) => selection.playerId === playerToAssign
    )?.[0];

    // Get the player currently in the target slot (if any)
    const currentPlayerInSlot = selections[slotId]?.playerId;

    // Create a new selections object
    const newSelections = { ...selections };

    // If the player is already assigned to a slot, remove them
    if (currentSlotId && currentSlotId !== slotId) {
      delete newSelections[currentSlotId];
    }

    // Assign the player to the new slot
    newSelections[slotId] = {
      playerId: playerToAssign,
      position,
      isSubstitution: position.includes('SUB')
    };

    // If there was a player in the target slot, and it's not the same player,
    // then we need to make that player unassigned
    if (currentPlayerInSlot && currentPlayerInSlot !== playerToAssign) {
      // Find any other slots this player might be in and remove them
      Object.entries(newSelections).forEach(([sid, sel]) => {
        if (sid !== slotId && sel.playerId === currentPlayerInSlot) {
          delete newSelections[sid];
        }
      });
    }

    setSelections(newSelections);
    setSelectedPlayerId(null);
    setDraggingPlayer(null);

    // Notify parent of change
    onSelectionChange?.(newSelections);
  };

  // Handle player selection for dragging
  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayerId(playerId === selectedPlayerId ? null : playerId);
  };

  // Handle removing a player from a position
  const handleRemovePlayer = (slotId: string) => {
    const newSelections = { ...selections };
    delete newSelections[slotId];
    
    setSelections(newSelections);
    onSelectionChange?.(newSelections);
  };

  // Handle drag start for a player
  const handleDragStart = (playerId: string) => {
    setDraggingPlayer(playerId);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggingPlayer(null);
  };

  // Get all players assigned to positions
  const getAssignedPlayers = () => {
    return Object.values(selections).map(s => s.playerId);
  };

  // Get squad players that haven't been assigned yet
  const getAvailableSquadPlayers = () => {
    const assignedPlayerIds = new Set(getAssignedPlayers());
    return availablePlayers.filter(player => 
      squadPlayers.includes(player.id) && !assignedPlayerIds.has(player.id)
    );
  };

  return (
    <div className="relative flex flex-col items-center">
      <div 
        ref={formationRef}
        className="relative w-full max-w-xl aspect-[2/3] bg-green-600 bg-gradient-to-b from-green-500 to-green-700 rounded-lg overflow-hidden mb-6"
      >
        {/* Pitch markings */}
        <PitchMarkings format={format} />
        
        {/* Helper text for interaction */}
        <div className="absolute top-2 left-0 right-0 text-center z-20">
          <span className="px-2 py-1 bg-white/80 rounded text-xs text-gray-700">
            {draggingPlayer ? "Drag player to a position" : selectedPlayerId ? "Now click on a position to place player" : "Select or drag a player from below"}
          </span>
        </div>
        
        <FormationSlots
          format={format}
          onDrop={handleDrop}
          renderSlot={(slotId, position, dropProps) => {
            const selection = selections[slotId];
            const player = selection ? getPlayer(selection.playerId) : null;
            
            return (
              <div
                {...dropProps}
                className={`absolute flex items-center justify-center w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                  dropProps.className
                } ${!player ? 'border-2 border-dashed border-white/50 hover:border-white/80' : ''}`}
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
