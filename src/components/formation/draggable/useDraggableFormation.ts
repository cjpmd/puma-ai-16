
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
  
  // Substitution counter for generating unique slot IDs
  const subCounterRef = useRef<number>(0);

  // Update state when initialSelections change
  useEffect(() => {
    if (initialSelections && Object.keys(initialSelections).length > 0) {
      setSelections(initialSelections);
      
      // Calculate the highest sub-X ID to continue numbering from there
      const subIds = Object.keys(initialSelections)
        .filter(id => id.startsWith('sub-'))
        .map(id => parseInt(id.replace('sub-', ''), 10));
      
      if (subIds.length > 0) {
        subCounterRef.current = Math.max(...subIds) + 1;
      }
    }
  }, [initialSelections]);

  // Get player object from ID
  const getPlayer = (playerId: string) => {
    return availablePlayers.find(p => p.id === playerId);
  };

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

    setSelections(newSelections);
    setSelectedPlayerId(null);
    setDraggingPlayer(null);

    // Notify parent of change
    onSelectionChange?.(newSelections);
  };

  // Handle player selection for dragging
  const handlePlayerSelect = (playerId: string) => {
    console.log(`Selected player: ${playerId}`);
    setSelectedPlayerId(playerId === selectedPlayerId ? null : playerId);
  };

  // Handle removing a player from a position
  const handleRemovePlayer = (slotId: string) => {
    console.log(`Removing player from slot ${slotId}`);
    const newSelections = { ...selections };
    delete newSelections[slotId];
    
    setSelections(newSelections);
    onSelectionChange?.(newSelections);
  };

  // Handle drag start for a player
  const handleDragStart = (e: React.DragEvent, playerId: string) => {
    console.log(`Drag start for player ${playerId}`);
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
    console.log('Drag ended');
    setDraggingPlayer(null);
  };

  // Handle dragging to substitutes section
  const handleSubstituteDrop = (playerId: string, fromSlotId: string) => {
    console.log(`Player ${playerId} dropped to substitutes section from ${fromSlotId}`);
    
    // Generate a new substitute slot ID
    const subSlotId = `sub-${subCounterRef.current++}`;
    
    // Get the player's current position for debugging
    const currentPosition = selections[fromSlotId]?.position;
    console.log(`Moving player from position ${currentPosition} to SUB`);
    
    // Create a new selections object
    const newSelections = { ...selections };
    
    // Remove the player from their current position
    if (selections[fromSlotId]) {
      delete newSelections[fromSlotId];
    }
    
    // Add them to the substitutes
    newSelections[subSlotId] = {
      playerId,
      position: 'SUB',
      isSubstitution: true
    };
    
    console.log('New selections:', newSelections);
    
    setSelections(newSelections);
    onSelectionChange?.(newSelections);
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
    handleSubstituteDrop,
    getPlayer,
    getAvailableSquadPlayers
  };
};
