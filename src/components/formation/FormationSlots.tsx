import React from "react";
import { PlayerPositionSelect } from "./PlayerPositionSelect";
import { FormationFormat, FormationSlot, PlayerSelection } from "./types";
import { getFormationSlots } from "./utils/formationUtils";

interface FormationSlotsProps {
  format: FormationFormat;
  selections?: Record<string, PlayerSelection>;
  availablePlayers?: Array<{ id: string; name: string; squad_number?: number }>;
  onPlayerSelection?: (slotId: string, playerId: string, position: string) => void;
  selectedPlayers?: Set<string>;
  onDrop?: (slotId: string, position: string) => void;
  renderSlot?: (slotId: string, position: string, dropProps: any) => React.ReactNode;
}

export const FormationSlots: React.FC<FormationSlotsProps> = ({
  format,
  selections = {},
  availablePlayers = [],
  onPlayerSelection,
  selectedPlayers = new Set(),
  onDrop,
  renderSlot
}) => {
  const formationSlots = getFormationSlots(format);

  // If renderSlot is provided, we're in drag-and-drop mode
  if (renderSlot) {
    return (
      <div className="relative w-full h-full">
        {formationSlots.map((slot: FormationSlot) => {
          const dropProps = {
            className: slot.className,
            onDragOver: (e: React.DragEvent) => {
              e.preventDefault();
              e.currentTarget.classList.add('bg-blue-200');
            },
            onDragLeave: (e: React.DragEvent) => {
              e.currentTarget.classList.remove('bg-blue-200');
            },
            onDrop: (e: React.DragEvent) => {
              e.preventDefault();
              e.currentTarget.classList.remove('bg-blue-200');
              onDrop?.(slot.id, slot.label);
            }
          };
          
          return renderSlot(slot.id, slot.label, dropProps);
        })}
      </div>
    );
  }

  // Otherwise, we're in standard selection mode
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
