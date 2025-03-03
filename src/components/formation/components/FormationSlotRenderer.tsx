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
  const positionClasses = `absolute ${slot.className}`;
  
  const dropProps = {
    className: `${positionClasses} z-10`,
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.add('bg-blue-200', 'bg-opacity-50');
    },
    onDragLeave: (e: React.DragEvent) => {
      e.currentTarget.classList.remove('bg-blue-200', 'bg-opacity-50');
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.remove('bg-blue-200', 'bg-opacity-50');
      
      // Get the player ID from dataTransfer
      const playerId = e.dataTransfer.getData('playerId');
      const fromSlotId = e.dataTransfer.getData('fromSlotId');
      
      // If we have a player ID in the data transfer, use that
      // Otherwise, fallback to normal drop behavior
      if (playerId) {
        onDrop?.(slot.id, slot.label, fromSlotId || undefined);
      } else {
        onDrop?.(slot.id, slot.label);
      }
    }
  };
  
  return renderSlot(slot.id, slot.label, dropProps);
};
