
import React from "react";
import { FormationSlot, FormationFormat } from "../types";
import { FormationSlotRenderer } from "./FormationSlotRenderer";

interface DragDropFormationProps {
  formationSlots: FormationSlot[];
  format: FormationFormat;
  onDrop?: (slotId: string, position: string, fromSlotId?: string) => void;
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

export const DragDropFormation: React.FC<DragDropFormationProps> = ({
  formationSlots,
  format,
  onDrop,
  renderSlot
}) => {
  // Create a wrapper div that handles drag events over empty areas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div 
      className="relative w-full h-full"
      onDragOver={handleDragOver}
    >
      {formationSlots.map(slot => (
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
