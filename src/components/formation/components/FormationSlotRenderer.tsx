
import React from "react";
import { FormationSlot } from "../types";
import { getPositionStyle } from "../utils/positionDefinitions";

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
      style?: React.CSSProperties;
    }
  ) => React.ReactNode;
}

export const FormationSlotRenderer: React.FC<FormationSlotRendererProps> = ({
  slot,
  onDrop,
  renderSlot
}) => {
  if (!renderSlot) return null;
  
  // Use the style helper to ensure accurate positioning
  const positionStyle = getPositionStyle(slot.label);
  
  const dropProps = {
    className: `z-10 cursor-pointer`,
    style: positionStyle,
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Make drop target more visible
      e.currentTarget.classList.add('bg-blue-200', 'bg-opacity-50', 'ring-2', 'ring-blue-400');
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.remove('bg-blue-200', 'bg-opacity-50', 'ring-2', 'ring-blue-400');
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.remove('bg-blue-200', 'bg-opacity-50', 'ring-2', 'ring-blue-400');
      
      // Get the player ID and source slot from dataTransfer
      const playerId = e.dataTransfer.getData('playerId');
      const fromSlotId = e.dataTransfer.getData('fromSlotId');
      
      console.log(`Dropping player ${playerId} to slot ${slot.id} (${slot.label}), from slot: ${fromSlotId || 'none'}`);
      
      // Ensure the onDrop callback is called with correct parameters
      if (onDrop) {
        if (playerId && fromSlotId) {
          onDrop(slot.id, slot.label, fromSlotId);
        } else if (playerId) {
          onDrop(slot.id, slot.label);
        } else {
          onDrop(slot.id, slot.label);
        }
      }
    }
  };
  
  return renderSlot(slot.id, slot.label, dropProps);
};
