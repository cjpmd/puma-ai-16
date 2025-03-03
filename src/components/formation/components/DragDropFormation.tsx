
import React from "react";
import { FormationSlot, FormationFormat } from "../types";
import { FormationSlotRenderer } from "./FormationSlotRenderer";
import { PitchMarkings } from "./PitchMarkings";

interface DragDropFormationProps {
  formationSlots: FormationSlot[];
  format?: FormationFormat;
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
  format = "7-a-side",
  onDrop,
  renderSlot
}) => {
  return (
    <div className="relative w-full aspect-[2/3] bg-emerald-500 rounded-lg overflow-hidden">
      {/* Pitch gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-30"></div>
      
      {/* Pitch markings */}
      <PitchMarkings format={format} />

      {/* Formation slots */}
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
