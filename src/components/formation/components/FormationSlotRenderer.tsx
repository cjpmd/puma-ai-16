
import React from "react";
import { FormationSlot } from "../types";

interface FormationSlotRendererProps {
  slot: FormationSlot;
  onDrop?: (slotId: string, position: string) => void;
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
  
  const dropProps = {
    className: `absolute ${slot.className} transition-colors duration-200 z-10`,
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
      onDrop?.(slot.id, slot.label);
    }
  };
  
  return renderSlot(slot.id, slot.label, dropProps);
};
