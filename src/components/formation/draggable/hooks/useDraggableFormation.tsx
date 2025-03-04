import { useState, useRef, useEffect, useCallback } from "react";
import { findPositionSlotById } from "../utils/formationLayoutUtils";

export function useDraggableFormation({
  initialSelections = {},
  onSelectionChange,
  availablePlayers = [],
  squadPlayers = []
}) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, { playerId: string; position: string; isSubstitution?: boolean }>>(initialSelections);
  const [draggingPlayer, setDraggingPlayer] = useState<string | null>(null);
  const formationRef = useRef<HTMLDivElement>(null);

  // Update selections when initialSelections change
  useEffect(() => {
    if (Object.keys(initialSelections).length > 0) {
      console.log("Initializing formation with selections:", initialSelections);
      setSelections(initialSelections);
    }
  }, [initialSelections]);

  // Callback for when a player is dropped onto a slot
  const handleDrop = useCallback((slotId: string, playerId: string) => {
    console.log(`Player ${playerId} dropped onto slot ${slotId}`);
    
    // Get position for this slot
    const position = findPositionSlotById(slotId)?.position || slotId;
    
    // Create new selections and update
    const newSelections = {
      ...selections,
      [slotId]: {
        playerId,
        position,
        isSubstitution: false
      }
    };
    
    setSelections(newSelections);
    setSelectedPlayerId(null);
    setDraggingPlayer(null);
    
    // Notify parent component
    if (onSelectionChange) {
      onSelectionChange(newSelections);
    }
  }, [selections, onSelectionChange]);

  // Handle player selection
  const handlePlayerSelect = useCallback((playerId: string) => {
    console.log(`Player ${playerId} selected`);
    setSelectedPlayerId(prevId => prevId === playerId ? null : playerId);
  }, []);

  // Handle removing a player from a position
  const handleRemovePlayer = useCallback((slotId: string) => {
    console.log(`Removing player from slot ${slotId}`);
    
    const newSelections = { ...selections };
    delete newSelections[slotId];
    
    setSelections(newSelections);
    
    // Notify parent component
    if (onSelectionChange) {
      onSelectionChange(newSelections);
    }
  }, [selections, onSelectionChange]);

  // Start dragging a player
  const handleDragStart = useCallback((playerId: string) => {
    console.log(`Started dragging player ${playerId}`);
    setDraggingPlayer(playerId);
  }, []);

  // End dragging a player
  const handleDragEnd = useCallback(() => {
    console.log("Ended dragging player");
    setDraggingPlayer(null);
  }, []);

  // Handle dropping a player into the substitutes area
  const handleSubstituteDrop = useCallback((playerId: string) => {
    console.log(`Player ${playerId} dropped into substitutes`);
    
    // Find a free substitute slot
    let subSlotIndex = 0;
    while (Object.values(selections).some(sel => sel.position === `sub-${subSlotIndex}`)) {
      subSlotIndex++;
    }
    
    const slotId = `sub-${subSlotIndex}`;
    const newSelections = {
      ...selections,
      [slotId]: {
        playerId,
        position: `sub-${subSlotIndex}`,
        isSubstitution: true
      }
    };
    
    setSelections(newSelections);
    setSelectedPlayerId(null);
    setDraggingPlayer(null);
    
    // Notify parent component
    if (onSelectionChange) {
      onSelectionChange(newSelections);
    }
  }, [selections, onSelectionChange]);

  // Helper to get player by ID
  const getPlayer = useCallback((playerId: string) => {
    return availablePlayers.find(player => player.id === playerId) || null;
  }, [availablePlayers]);

  // Helper to get available squad players not already in positions
  const getAvailableSquadPlayers = useCallback(() => {
    const selectedPlayerIds = Object.values(selections).map(selection => selection.playerId);
    
    if (squadPlayers.length === 0) {
      // If no squad players specified, use all available players
      return availablePlayers.filter(player => !selectedPlayerIds.includes(player.id));
    }
    
    // Otherwise filter to only include specified squad players
    return availablePlayers.filter(player => 
      squadPlayers.includes(player.id) && !selectedPlayerIds.includes(player.id)
    );
  }, [availablePlayers, squadPlayers, selections]);

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
}
