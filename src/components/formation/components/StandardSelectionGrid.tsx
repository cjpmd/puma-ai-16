
import React from "react";
import { PlayerPositionSelect } from "../PlayerPositionSelect";
import { FormationSlot, PlayerSelection } from "../types";

interface StandardSelectionGridProps {
  formationSlots: FormationSlot[];
  selections: Record<string, PlayerSelection>;
  availablePlayers: Array<{ id: string; name: string; squad_number?: number }>;
  onPlayerSelection?: (slotId: string, playerId: string, position: string) => void;
  selectedPlayers: Set<string>;
}

export const StandardSelectionGrid: React.FC<StandardSelectionGridProps> = ({
  formationSlots,
  selections,
  availablePlayers,
  onPlayerSelection,
  selectedPlayers
}) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {formationSlots.map((slot: FormationSlot) => {
        // Get the current selection for this slot or use default values
        const selection = selections[slot.id] || { playerId: "unassigned", position: slot.label };
        
        return (
          <PlayerPositionSelect
            key={`${slot.id}-${selection.position}-${selection.playerId}`}
            position={selection.position}
            playerId={selection.playerId}
            availablePlayers={availablePlayers}
            onSelectionChange={(playerId, position) => 
              onPlayerSelection?.(slot.id, playerId, position)}
            selectedPlayers={selectedPlayers}
          />
        );
      })}
    </div>
  );
};
