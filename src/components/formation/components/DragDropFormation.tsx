
import React from "react";
import { FormationSlot } from "../types";
import { FormationSlotRenderer } from "./FormationSlotRenderer";

interface DragDropFormationProps {
  formationSlots: FormationSlot[];
  onDrop?: (slotId: string, position: string) => void;
  renderSlot: (
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

export const DragDropFormation: React.FC<DragDropFormationProps> = ({
  formationSlots,
  onDrop,
  renderSlot
}) => {
  return (
    <div className="relative w-full h-full">
      {formationSlots.map((slot: FormationSlot) => (
        <FormationSlotRenderer
          key={slot.id}
          slot={slot}
          onDrop={onDrop}
          renderSlot={renderSlot}
        />
      ))}
    </div>
  );
};
