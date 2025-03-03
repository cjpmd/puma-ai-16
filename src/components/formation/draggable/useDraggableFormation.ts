import { useState, useRef, useEffect } from "react";

interface UseDraggableFormationProps {
  initialSelections?: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>;
  onSelectionChange?: (selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>) => void;
  availablePlayers: any[];
  squadPlayers?: string[];
}

export const useDraggableFormation = ({
  initialSelections = {},
  onSelectionChange,
  availablePlayers,
  squadPlayers = []
}: UseDraggableFormationProps) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, { playerId: string; position: string; isSubstitution?: boolean }>>(initialSelections || {});
  const formationRef = useRef<HTMLDivElement>(null);
  const [draggingPlayer, setDraggingPlayer] = useState<string | null>(null);

  // Update state when initialSelections change
  useEffect(() => {
    if (initialSelections && Object.keys(initialSelections).length > 0) {
      setSelections(initialSelections);
    }
  }, [initialSelections]);

  // Get player object from ID
  const getPlayer = (playerId: string) => {
    return availablePlayers.find(p => p.id === playerId);
  };

  // Handle drop onto a formation slot
  const handleDrop = (slotId: string, position: string, fromSlotId?: string) => {
    // Use either dragging player or selected player or fromSlotId's player
    let playerToAssign: string | null = null;
    
    if (fromSlotId && selections[fromSlotId]) {
      // If we're dragging from another slot, use that player
      playerToAssign = selections[fromSlotId].playerId;
    } else {
      // Otherwise use either the dragging player or selected player
      playerToAssign = draggingPlayer || selectedPlayerId;
    }
    
    if (!playerToAssign) return;

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
      delete newSelections[fromSlotId];
    }
    // If the player is already assigned to a different slot, remove them
    else if (currentSlotId && currentSlotId !== slotId) {
      delete newSelections[currentSlotId];
    }

    // Assign the player to the new slot
    newSelections[slotId] = {
      playerId: playerToAssign,
      position,
      isSubstitution: position.includes('SUB')
    };

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
      } else {
        // If we're not doing a direct swap, make sure this player isn't assigned elsewhere
        Object.entries(newSelections).forEach(([sid, sel]) => {
          if (sid !== slotId && sel.playerId === currentPlayerInSlot) {
            delete newSelections[sid];
          }
        });
      }
    }

    setSelections(newSelections);
    setSelectedPlayerId(null);
    setDraggingPlayer(null);

    // Notify parent of change
    onSelectionChange?.(newSelections);
  };

  // Handle player selection for dragging
  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayerId(playerId === selectedPlayerId ? null : playerId);
  };

  // Handle removing a player from a position
  const handleRemovePlayer = (slotId: string) => {
    const newSelections = { ...selections };
    delete newSelections[slotId];
    
    setSelections(newSelections);
    onSelectionChange?.(newSelections);
  };

  // Handle drag start for a player
  const handleDragStart = (e: React.DragEvent, playerId: string) => {
    setDraggingPlayer(playerId);
    // Set dataTransfer data for compatibility
    e.dataTransfer.setData('playerId', playerId);
    // Set a custom drag image if needed
    const player = getPlayer(playerId);
    if (player) {
      const dragImage = document.createElement('div');
      dragImage.className = 'bg-blue-500 text-white rounded-full p-1 text-xs font-bold';
      dragImage.textContent = player.squad_number?.toString() || player.name.charAt(0);
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 15, 15);
      setTimeout(() => document.body.removeChild(dragImage), 0);
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggingPlayer(null);
  };

  // Get all players assigned to positions
  const getAssignedPlayers = () => {
    return Object.values(selections).map(s => s.playerId);
  };

  // Get squad players that haven't been assigned yet
  const getAvailableSquadPlayers = () => {
    const assignedPlayerIds = new Set(getAssignedPlayers());
    // If squadPlayers is provided, filter by that, otherwise use all available players
    if (squadPlayers.length > 0) {
      return availablePlayers.filter(player => 
        squadPlayers.includes(player.id) && !assignedPlayerIds.has(player.id)
      );
    } else {
      return availablePlayers.filter(player => !assignedPlayerIds.has(player.id));
    }
  };

  return {
    selectedPlayerId,
    selections,
    formationRef,
    draggingPlayer,
    handleDrop,
    handlePlayerSelect,
    handleRemovePlayer,
    handleDragStart,
    handleDragEnd,
    getPlayer,
    getAvailableSquadPlayers
  };
};
