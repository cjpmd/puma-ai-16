import { useState } from "react";

type SelectionType = {
  playerId: string;
  position: string;
  isSubstitution?: boolean;
};

export const useDropOperations = (
  selections: Record<string, SelectionType>,
  updateSelections: (selections: Record<string, SelectionType>) => void,
  selectedPlayerId: string | null,
  setSelectedPlayerId: (id: string | null) => void,
  draggingPlayer: string | null,
  setDraggingPlayer: (id: string | null) => void
) => {
  // Handle drop onto a formation slot
  const handleDrop = (slotId: string, position: string, fromSlotId?: string) => {
    console.log(`handleDrop: slotId=${slotId}, position=${position}, fromSlotId=${fromSlotId}`);
    
    // Use either dragging player or selected player or fromSlotId's player
    let playerToAssign: string | null = null;
    
    if (fromSlotId && selections[fromSlotId]) {
      // If we're dragging from another slot, use that player
      playerToAssign = selections[fromSlotId].playerId;
      console.log(`Using player ${playerToAssign} from slot ${fromSlotId}`);
    } else {
      // Otherwise use either the dragging player or selected player
      playerToAssign = draggingPlayer || selectedPlayerId;
      console.log(`Using dragging/selected player ${playerToAssign}`);
    }
    
    if (!playerToAssign) {
      console.log('No player to assign, returning');
      return;
    }

    // Get the current slot that this player is assigned to (if any)
    const currentSlotId = Object.entries(selections).find(
      ([sid, selection]) => selection.playerId === playerToAssign && sid !== fromSlotId
    )?.[0];

    // Get the player currently in the target slot (if any)
    const currentPlayerInSlot = selections[slotId]?.playerId;

    // Create a new selections object
    const newSelections = { ...selections };

    // If we're dragging from another slot, clear that slot
    if (fromSlotId && selections[fromSlotId]?.playerId === playerToAssign) {
      console.log(`Removing player ${playerToAssign} from source slot ${fromSlotId}`);
      delete newSelections[fromSlotId];
    }
    // If the player is already assigned to a different slot, remove them
    else if (currentSlotId && currentSlotId !== slotId) {
      console.log(`Removing player ${playerToAssign} from current slot ${currentSlotId}`);
      delete newSelections[currentSlotId];
    }

    // Assign the player to the new slot
    newSelections[slotId] = {
      playerId: playerToAssign,
      position,
      isSubstitution: position === 'SUB'
    };
    console.log(`Assigned player ${playerToAssign} to slot ${slotId} (${position})`);

    // If there was a player in the target slot, and it's not the same player,
    // handle them appropriately (swap or make unassigned)
    if (currentPlayerInSlot && currentPlayerInSlot !== playerToAssign) {
      if (fromSlotId) {
        // If we're dragging from another slot and there's a player in the target slot,
        // put the displaced player in the source slot (swap them)
        newSelections[fromSlotId] = {
          playerId: currentPlayerInSlot,
          position: selections[fromSlotId]?.position || '',
          isSubstitution: selections[fromSlotId]?.isSubstitution
        };
        console.log(`Swapped - placed player ${currentPlayerInSlot} in slot ${fromSlotId}`);
      }
    }

    updateSelections(newSelections);
    setSelectedPlayerId(null);
    setDraggingPlayer(null);
  };

  return {
    handleDrop
  };
};
