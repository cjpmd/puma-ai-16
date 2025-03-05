
import { useState, useCallback } from "react";

export const useDragOperations = () => {
  const [draggingPlayerId, setDraggingPlayerId] = useState<string | null>(null);

  // Handle the start of a drag operation
  const handleDragStart = useCallback((e: React.DragEvent, playerId: string) => {
    console.log(`Starting drag for player ${playerId}`);
    e.dataTransfer.setData('playerId', playerId);
    setDraggingPlayerId(playerId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Add a drag image (optional enhancement)
    const dragIcon = document.createElement('div');
    dragIcon.className = 'w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white';
    dragIcon.textContent = 'P';
    document.body.appendChild(dragIcon);
    
    try {
      e.dataTransfer.setDragImage(dragIcon, 20, 20);
    } finally {
      // Clean up - remove after a short delay
      setTimeout(() => {
        document.body.removeChild(dragIcon);
      }, 0);
    }
  }, []);

  // Handle the end of a drag operation
  const handleDragEnd = useCallback(() => {
    console.log('Drag operation ended');
    setDraggingPlayerId(null);
  }, []);

  // Handle player selection from the available players list
  const handlePlayerSelect = useCallback((playerId: string) => {
    console.log(`Selected player ${playerId}`);
    return playerId;
  }, []);

  return {
    draggingPlayerId,
    handleDragStart,
    handleDragEnd,
    handlePlayerSelect
  };
};
