
import React from "react";
import { FormationSlot } from "../types";

interface FormationSlotRendererProps {
  slot: FormationSlot;
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

export const FormationSlotRenderer: React.FC<FormationSlotRendererProps> = ({
  slot,
  onDrop,
  renderSlot
}) => {
  if (!renderSlot) return null;
  
  // Apply proper positioning to align with the visual position markers
  const positionClasses = `absolute ${slot.className} transform -translate-x-1/2 -translate-y-1/2`;
  
  const dropProps = {
    className: `${positionClasses} z-10 cursor-pointer`,
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.add('bg-blue-200', 'bg-opacity-50');
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.remove('bg-blue-200', 'bg-opacity-50');
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.remove('bg-blue-200', 'bg-opacity-50');
      
      // Get the player ID and source slot from dataTransfer
      const playerId = e.dataTransfer.getData('playerId');
      const fromSlotId = e.dataTransfer.getData('fromSlotId');
      
      // Ensure the onDrop callback is called with correct parameters
      if (playerId) {
        console.log(`Dropping player ${playerId} to slot ${slot.id} (${slot.label})`);
        onDrop?.(slot.id, slot.label, fromSlotId || undefined);
      } else {
        onDrop?.(slot.id, slot.label);
      }
    }
  };
  
  return renderSlot(slot.id, slot.label, dropProps);
};
