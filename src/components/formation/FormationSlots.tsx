import React from "react";
import { FormationFormat, FormationSlot, PlayerSelection } from "./types";
import { getFormationSlots, getAllPositionSlots } from "./utils/formationUtils";
import { DragDropFormation } from "./components/DragDropFormation";
import { StandardSelectionGrid } from "./components/StandardSelectionGrid";

interface FormationSlotsProps {
  format: FormationFormat;
  selections?: Record<string, PlayerSelection>;
  availablePlayers?: Array<{ id: string; name: string; squad_number?: number }>;
  onPlayerSelection?: (slotId: string, playerId: string, position: string) => void;
  selectedPlayers?: Set<string>;
  onDrop?: (slotId: string, position: string) => void;
  showAllPositions?: boolean;
  renderSlot?: (
    slotId: string, 
    position: string, 
    dropProps: {
      className: string;
      onDragOver: (e: React.DragEvent) => void;
      onDragLeave: (e: React.DragEvent) => void;
      onDrop: (e: React.DragEvent) => void;
    }
  ) => React.ReactNode;
}

export const FormationSlots: React.FC<FormationSlotsProps> = ({
  format,
  selections = {},
  availablePlayers = [],
  onPlayerSelection,
  selectedPlayers = new Set(),
  onDrop,
  showAllPositions = true,
  renderSlot
}) => {
  // Get all formation slots
  const formationSlots = getAllPositionSlots();

  // If renderSlot is provided, we're in drag-and-drop mode
  if (renderSlot) {
    return (
      <DragDropFormation
        formationSlots={formationSlots}
        format={format}
        onDrop={onDrop}
        renderSlot={renderSlot}
      />
    );
  }

  // Otherwise, we're in standard selection mode
  return (
    <StandardSelectionGrid
      formationSlots={formationSlots}
      selections={selections}
      availablePlayers={availablePlayers}
      onPlayerSelection={onPlayerSelection}
      selectedPlayers={selectedPlayers}
    />
  );
};
