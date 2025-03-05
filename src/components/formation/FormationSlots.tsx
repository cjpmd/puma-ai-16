
import React from "react";
import { FormationFormat } from "./types";
import { PlayerPositionSelect } from "./PlayerPositionSelect";
import { getFormationSlots } from "./utils/formationFormatUtils";

interface FormationSlotsProps {
  format: FormationFormat;
  selections: Record<string, { playerId: string; position: string; performanceCategory?: string }>;
  availablePlayers: Array<{ id: string; name: string; squad_number?: number }>;
  onPlayerSelection: (slotId: string, playerId: string) => void;
  selectedPlayers: Set<string>;
  formationTemplate?: string;
}

export const FormationSlots: React.FC<FormationSlotsProps> = ({
  format,
  selections,
  availablePlayers,
  onPlayerSelection,
  selectedPlayers,
  formationTemplate = "All"
}) => {
  // Get appropriate position slots based on formation format and template
  const positionSlots = getFormationSlots(format, formationTemplate);
  
  console.log(`Rendering FormationSlots with format: ${format}, template: ${formationTemplate}, slots: ${positionSlots.length}`);

  return (
    <div className="rounded-md border p-4">
      <h3 className="text-sm font-medium mb-4">Starting Players</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {positionSlots.map((slot) => {
          const slotId = slot.id.toLowerCase();
          const selection = selections[slotId] || { playerId: "unassigned", position: slot.id };
          
          return (
            <div key={slotId} className="flex flex-col gap-1">
              <label htmlFor={`player-${slotId}`} className="text-xs font-medium">
                {slot.label}
              </label>
              <PlayerPositionSelect
                playerId={selection.playerId}
                position={slot.id}
                onSelectionChange={(playerId) => onPlayerSelection(slotId, playerId)}
                availablePlayers={availablePlayers.filter(
                  (player) => !selectedPlayers.has(player.id) || player.id === selection.playerId
                )}
                selectedPlayers={selectedPlayers}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
