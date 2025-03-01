
import { useState, useRef } from "react";
import { FormationSlots } from "./FormationSlots";
import { DraggablePlayer } from "./DraggablePlayer";
import { getPlayerDisplay } from "./utils/playerUtils";

interface DraggableFormationProps {
  format: "5-a-side" | "7-a-side" | "9-a-side" | "11-a-side";
  availablePlayers: any[];
  initialSelections?: Record<string, { playerId: string; position: string }>;
  onSelectionChange?: (selections: Record<string, { playerId: string; position: string }>) => void;
  renderSubstitutionIndicator?: (position: string) => React.ReactNode;
}

export const DraggableFormation = ({
  format,
  availablePlayers,
  initialSelections = {},
  onSelectionChange,
  renderSubstitutionIndicator
}: DraggableFormationProps) => {
  const [activePlayer, setActivePlayer] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, { playerId: string; position: string }>>(initialSelections || {});
  const formationRef = useRef<HTMLDivElement>(null);
  const playersRef = useRef<Record<string, HTMLDivElement>>({});

  // Get player object from ID
  const getPlayer = (playerId: string) => {
    return availablePlayers.find(p => p.id === playerId);
  };

  // Handle drag start
  const handleDragStart = (playerId: string) => {
    setActivePlayer(playerId);
  };

  // Handle drop onto a formation slot
  const handleDrop = (slotId: string, position: string) => {
    if (!activePlayer) return;

    // Get the current slot that this player is assigned to (if any)
    const currentSlotId = Object.entries(selections).find(
      ([_, selection]) => selection.playerId === activePlayer
    )?.[0];

    // Get the player currently in the target slot (if any)
    const currentPlayerInSlot = selections[slotId]?.playerId;

    // Create a new selections object
    const newSelections = { ...selections };

    // If the player is already assigned to a slot, remove them
    if (currentSlotId) {
      // If the player is just moving to a new slot, remove from old one
      if (currentSlotId !== slotId) {
        delete newSelections[currentSlotId];
      }
    }

    // Assign the player to the new slot
    newSelections[slotId] = {
      playerId: activePlayer,
      position
    };

    // If there was a player in the target slot, and it's not the same player,
    // then we need to make that player unassigned
    if (currentPlayerInSlot && currentPlayerInSlot !== activePlayer) {
      // Optionally, move that player back to unassigned
      // or you could implement a swap logic here
    }

    setSelections(newSelections);
    setActivePlayer(null);

    // Notify parent of change
    onSelectionChange?.(newSelections);
  };

  // Handle removing a player from a position
  const handleRemovePlayer = (slotId: string) => {
    const newSelections = { ...selections };
    delete newSelections[slotId];
    
    setSelections(newSelections);
    onSelectionChange?.(newSelections);
  };

  // Register ref for a player
  const registerPlayerRef = (playerId: string, ref: HTMLDivElement | null) => {
    if (ref) {
      playersRef.current[playerId] = ref;
    } else if (playersRef.current[playerId]) {
      delete playersRef.current[playerId];
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      <div 
        ref={formationRef}
        className="relative w-full max-w-xl aspect-[2/3] mb-8 bg-green-600 rounded-lg overflow-hidden"
      >
        {/* Helper text for drag functionality */}
        <div className="absolute top-2 left-0 right-0 text-center z-20">
          <span className="px-2 py-1 bg-white/80 rounded text-xs text-gray-700">
            Click and drag players to positions
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
              >
                {selection && player ? (
                  <div className="relative">
                    <div
                      className="relative flex items-center justify-center w-10 h-10 bg-white/80 rounded-full cursor-pointer hover:bg-white"
                      onClick={() => handleRemovePlayer(slotId)}
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full text-[10px] font-bold">
                          {player.squad_number || player.name.charAt(0)}
                        </div>
                        <div className="text-[8px] mt-0.5 max-w-8 truncate">
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
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-200 bg-opacity-70 rounded-full">
                    <span className="text-[8px] font-medium">{position}</span>
                  </div>
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};
