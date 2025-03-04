
import { useState } from "react";

export const useDragOperations = () => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [draggingPlayer, setDraggingPlayer] = useState<string | null>(null);

  // Handle player selection for dragging
  const handlePlayerSelect = (playerId: string) => {
    console.log(`Selected player: ${playerId}`);
    setSelectedPlayerId(playerId === selectedPlayerId ? null : playerId);
  };

  // Handle drag start for a player
  const handleDragStart = (e: React.DragEvent, playerId: string) => {
    console.log(`Drag start for player ${playerId}`);
    setDraggingPlayer(playerId);
    // Set dataTransfer data for compatibility
    e.dataTransfer.setData('playerId', playerId);
    // Set a custom drag image if needed
    const dragImage = document.createElement('div');
    dragImage.className = 'bg-blue-500 text-white rounded-full p-1 text-xs font-bold';
    dragImage.textContent = playerId.charAt(0);
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 15, 15);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  // Handle drag end
  const handleDragEnd = () => {
    console.log('Drag ended');
    setDraggingPlayer(null);
  };

  return {
    selectedPlayerId,
    setSelectedPlayerId,
    draggingPlayer,
    setDraggingPlayer,
    handlePlayerSelect,
    handleDragStart,
    handleDragEnd
  };
};
