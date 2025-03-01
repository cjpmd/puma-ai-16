
import React from "react";
import { PlayerPositionSelect } from "./PlayerPositionSelect";
import { FormationFormat, FormationSlot, PlayerSelection } from "./types";
import { getFormationSlots } from "./utils/formationUtils";

interface FormationSlotsProps {
  format: FormationFormat;
  selections: Record<string, PlayerSelection>;
  availablePlayers: Array<{ id: string; name: string; squad_number?: number }>;
  onPlayerSelection: (slotId: string, playerId: string, position: string) => void;
  selectedPlayers: Set<string>;
}

export const FormationSlots: React.FC<FormationSlotsProps> = ({
  format,
  selections,
  availablePlayers,
  onPlayerSelection,
  selectedPlayers
}) => {
  const formationSlots = getFormationSlots(format);

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
            onSelectionChange={(playerId, position) => onPlayerSelection(slot.id, playerId, position)}
            selectedPlayers={selectedPlayers}
          />
        );
      })}
    </div>
  );
};
