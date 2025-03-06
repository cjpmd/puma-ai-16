
import { useState, useRef, useEffect } from "react";
import { FormationFormat } from "../../types";
import { PerformanceCategory } from "@/types/player";
import { useDragOperations } from "./useDragOperations";
import { useDropOperations } from "./useDropOperations";
import { useSubstitutionManager } from "./useSubstitutionManager";

export interface UseDraggableFormationProps {
  initialSelections?: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>;
  onSelectionChange: (selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>) => void;
  availablePlayers: any[];
  squadPlayers: string[];
  performanceCategory?: PerformanceCategory;
  format: FormationFormat;
  formationTemplate?: string;
  onTemplateChange?: (template: string) => void;
  onSquadPlayersChange?: (playerIds: string[]) => void;
  periodNumber?: number;
  periodDuration?: number;
  forceSquadMode?: boolean;
}

export const useDraggableFormation = ({
  initialSelections,
  onSelectionChange,
  availablePlayers,
  squadPlayers,
  performanceCategory = "MESSI",
  format,
  formationTemplate = "All",
  onTemplateChange,
  onSquadPlayersChange,
  periodNumber = 1,
  periodDuration = 45,
  forceSquadMode
}: UseDraggableFormationProps) => {
  // State for tracking selections, selected player, and active template
  const [selections, setSelections] = useState<Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>>(initialSelections || {});
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(formationTemplate);
  const [localSquadPlayers, setLocalSquadPlayers] = useState<string[]>(squadPlayers || []);
  const [squadMode, setSquadMode] = useState<boolean>(forceSquadMode !== undefined ? forceSquadMode : true);
  const [currentPeriod, setCurrentPeriod] = useState<number>(periodNumber);
  const [periodLength, setPeriodLength] = useState<number>(periodDuration);
  const formationRef = useRef<HTMLDivElement>(null);
  const previousSelectionsRef = useRef<Record<string, { playerId: string; position: string }>>({});

  // Get drag operations from the hook
  const { draggingPlayerId: draggingPlayer, handleDragStart, handleDragEnd, handlePlayerSelect } = useDragOperations();

  // Initialize substitution manager
  const { 
    addSubstitute, 
    removeSubstitute, 
    handleSubstituteDrop 
  } = useSubstitutionManager({
    selections,
    updateSelections: setSelections,
    onSelectionChange,
    performanceCategory
  });

  // Initialize drop operations with modified callbacks to prevent duplication
  const { handleDrop } = useDropOperations({
    selections,
    updateSelections: (newSelections) => {
      // Store previous state for comparison
      previousSelectionsRef.current = selections;
      setSelections(newSelections);
    },
    selectedPlayerId,
    setSelectedPlayerId,
    draggingPlayer,
    setDraggingPlayer: (playerId) => {
      if (playerId === null) handleDragEnd();
    },
    performanceCategory,
    preventDuplicates: true
  });

  // Update parent component when selections change
  useEffect(() => {
    // Check if we need to update the parent
    const needsUpdate = JSON.stringify(selections) !== JSON.stringify(previousSelectionsRef.current);
    
    if (needsUpdate) {
      onSelectionChange(selections);
      
      // Update squad players list based on selections
      if (onSquadPlayersChange) {
        const selectedPlayerIds = Object.values(selections)
          .map(selection => selection.playerId)
          .filter(id => id !== "unassigned");
        
        // Combine with existing squad players to prevent losing squad members
        const combinedPlayerIds = [...new Set([...localSquadPlayers, ...selectedPlayerIds])];
        
        // Only update if there's a change to avoid infinite loops
        if (JSON.stringify(combinedPlayerIds.sort()) !== JSON.stringify(localSquadPlayers.sort())) {
          setLocalSquadPlayers(combinedPlayerIds);
          onSquadPlayersChange(combinedPlayerIds);
        }
      }
    }
  }, [selections, onSelectionChange, onSquadPlayersChange, localSquadPlayers]);
  
  // Sync with squadPlayers prop
  useEffect(() => {
    if (squadPlayers && squadPlayers.length > 0 && JSON.stringify(squadPlayers.sort()) !== JSON.stringify(localSquadPlayers.sort())) {
      console.log("Updating local squad players:", squadPlayers);
      setLocalSquadPlayers(squadPlayers);
    }
  }, [squadPlayers]);

  // Update period settings when props change
  useEffect(() => {
    setCurrentPeriod(periodNumber);
    setPeriodLength(periodDuration);
  }, [periodNumber, periodDuration]);
  
  // Update squad mode when forceSquadMode changes
  useEffect(() => {
    if (forceSquadMode !== undefined && forceSquadMode !== squadMode) {
      console.log(`Forcing squad mode to: ${forceSquadMode}`);
      setSquadMode(forceSquadMode);
    }
  }, [forceSquadMode, squadMode]);

  // Handle player click in the available players list
  const handlePlayerClick = (playerId: string) => {
    // If player is already selected, deselect them
    if (selectedPlayerId === playerId) {
      setSelectedPlayerId(null);
    } else {
      // Otherwise, select the player
      setSelectedPlayerId(playerId);
    }
  };

  // Handle removing a player from a position
  const handleRemovePlayer = (slotId: string) => {
    const updatedSelections = { ...selections };
    delete updatedSelections[slotId];
    setSelections(updatedSelections);
  };

  // Function to get player by ID from available players
  const getPlayerById = (playerId: string) => {
    return availablePlayers.find(player => player.id === playerId);
  };

  // Function to get all available players (not yet selected)
  const getAvailablePlayers = () => {
    // Return all available players - filtering is handled in the component
    return availablePlayers;
  };

  // Function to get player from squad by ID
  const getPlayer = (playerId: string) => {
    return availablePlayers.find(player => player.id === playerId);
  };

  // Get available players for the squad
  const getAvailableSquadPlayers = () => {
    return localSquadPlayers.length > 0
      ? availablePlayers.filter(player => localSquadPlayers.includes(player.id))
      : availablePlayers;
  };

  // Handle formation template change
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    if (onTemplateChange) {
      onTemplateChange(template);
    }
  };

  // Toggle squad mode
  const toggleSquadMode = () => {
    console.log("Toggle squad mode called - current state:", squadMode);
    setSquadMode(prev => !prev);
  };

  // Add player to squad
  const addPlayerToSquad = (playerId: string) => {
    if (!localSquadPlayers.includes(playerId)) {
      const updatedSquad = [...localSquadPlayers, playerId];
      console.log("Adding player to squad:", playerId, updatedSquad);
      setLocalSquadPlayers(updatedSquad);
      
      if (onSquadPlayersChange) {
        onSquadPlayersChange(updatedSquad);
      }
    }
  };

  // Remove player from squad
  const removePlayerFromSquad = (playerId: string) => {
    if (localSquadPlayers.includes(playerId)) {
      const updatedSquad = localSquadPlayers.filter(id => id !== playerId);
      console.log("Removing player from squad:", playerId, updatedSquad);
      setLocalSquadPlayers(updatedSquad);
      
      // Also remove from selections if present
      const updatedSelections = { ...selections };
      Object.entries(updatedSelections).forEach(([key, value]) => {
        if (value.playerId === playerId) {
          delete updatedSelections[key];
        }
      });
      
      setSelections(updatedSelections);
      
      if (onSquadPlayersChange) {
        onSquadPlayersChange(updatedSquad);
      }
    }
  };

  // Finished squad selection
  const finishSquadSelection = () => {
    console.log("Finishing squad selection, setting squadMode to false");
    setSquadMode(false);
  };

  // Return to squad selection
  const returnToSquadSelection = () => {
    console.log("Returning to squad selection, setting squadMode to true");
    setSquadMode(true);
  };

  // Show all players by default
  const showPlayers = true;

  return {
    selectedPlayerId,
    draggingPlayer,
    selectedTemplate,
    selections,
    formationRef,
    squadMode,
    squadPlayers: localSquadPlayers,
    currentPeriod,
    periodLength,
    handleDrop,
    handlePlayerClick,
    handleRemovePlayer,
    handleDragStart,
    handleDragEnd,
    handleSubstituteDrop,
    handleTemplateChange,
    getPlayer,
    getPlayerById,
    getAvailablePlayers,
    getAvailableSquadPlayers,
    addSubstitute,
    removeSubstitute,
    showPlayers,
    toggleSquadMode,
    addPlayerToSquad,
    removePlayerFromSquad,
    finishSquadSelection,
    returnToSquadSelection
  };
};
