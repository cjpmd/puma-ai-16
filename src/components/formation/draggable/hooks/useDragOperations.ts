
import { useState } from "react";

export const useDragOperations = () => {
  const [draggingPlayerId, setDraggingPlayerId] = useState<string | null>(null);

  // Handle the start of a drag operation
  const handleDragStart = (e: React.DragEvent, playerId: string) => {
    console.log(`Starting drag for player ${playerId}`);
    e.dataTransfer.setData('playerId', playerId);
    setDraggingPlayerId(playerId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle the end of a drag operation
  const handleDragEnd = () => {
    console.log('Drag operation ended');
    setDraggingPlayerId(null);
  };

  // Handle player selection from the available players list
  const handlePlayerSelect = (playerId: string) => {
    console.log(`Selected player ${playerId}`);
    return playerId;
  };

  return {
    draggingPlayerId,
    handleDragStart,
    handleDragEnd,
    handlePlayerSelect
  };
};
