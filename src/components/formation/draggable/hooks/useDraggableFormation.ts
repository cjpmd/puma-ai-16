
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
  const [selections, setSelections] = useState<Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>>(initialSelections || {});
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(formationTemplate);
  const [localSquadPlayers, setLocalSquadPlayers] = useState<string[]>(squadPlayers || []);
  const [squadMode, setSquadMode] = useState<boolean>(forceSquadMode !== undefined ? forceSquadMode : true);
  const [currentPeriod, setCurrentPeriod] = useState<number>(periodNumber);
  const [periodLength, setPeriodLength] = useState<number>(periodDuration);
  const formationRef = useRef<HTMLDivElement>(null);
  const previousSelectionsRef = useRef<Record<string, { playerId: string; position: string }>>({});

  // Get drag operations
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

  // Initialize drop operations
  const { handleDrop } = useDropOperations({
    selections,
    updateSelections: (newSelections) => {
      previousSelectionsRef.current = selections;
      setSelections(newSelections);
    },
    selectedPlayerId,
    setSelectedPlayerId,
    draggingPlayer,
    setDraggingPlayer: handleDragEnd,
    performanceCategory,
    preventDuplicates: true
  });

  // Update parent when selections change
  useEffect(() => {
    const needsUpdate = JSON.stringify(selections) !== JSON.stringify(previousSelectionsRef.current);
    
    if (needsUpdate) {
      // Notify parent of selection changes
      onSelectionChange(selections);
      
      if (onSquadPlayersChange) {
        // Get all currently selected players
        const selectedPlayerIds = Object.values(selections)
          .map(selection => selection.playerId)
          .filter(id => id !== "unassigned");
        
        // IMPORTANT: Don't lose existing squad players when updating
        // This is key to fixing the issue
        const newSquadPlayers = [...localSquadPlayers];
        
        // Only add new players that aren't already in the squad
        selectedPlayerIds.forEach(id => {
          if (!newSquadPlayers.includes(id)) {
            newSquadPlayers.push(id);
          }
        });
        
        // Only update if something actually changed
        if (JSON.stringify([...newSquadPlayers].sort()) !== JSON.stringify([...localSquadPlayers].sort())) {
          console.log("Updating squad players from selections:", newSquadPlayers);
          setLocalSquadPlayers(newSquadPlayers);
          onSquadPlayersChange(newSquadPlayers);
        }
      }
    }
  }, [selections, onSelectionChange, onSquadPlayersChange, localSquadPlayers]);

  // Sync squad players from props
  useEffect(() => {
    if (squadPlayers && squadPlayers.length > 0) {
      // Sort for consistent comparison
      const sortedSquadPlayers = [...squadPlayers].sort();
      const sortedLocalPlayers = [...localSquadPlayers].sort();
      
      // Only update if there's an actual difference
      if (JSON.stringify(sortedSquadPlayers) !== JSON.stringify(sortedLocalPlayers)) {
        console.log("Syncing squad players from props:", squadPlayers);
        setLocalSquadPlayers(squadPlayers);
      }
    }
  }, [squadPlayers]);

  // Sync period data from props
  useEffect(() => {
    setCurrentPeriod(periodNumber);
    setPeriodLength(periodDuration);
  }, [periodNumber, periodDuration]);
  
  // Sync squad mode from props
  useEffect(() => {
    if (forceSquadMode !== undefined && forceSquadMode !== squadMode) {
      console.log(`Forcing squad mode to: ${forceSquadMode}`);
      setSquadMode(forceSquadMode);
    }
  }, [forceSquadMode, squadMode]);

  // Handle player selection
  const handlePlayerClick = (playerId: string) => {
    if (selectedPlayerId === playerId) {
      setSelectedPlayerId(null);
    } else {
      setSelectedPlayerId(playerId);
    }
  };

  // Handle player removal
  const handleRemovePlayer = (slotId: string) => {
    const updatedSelections = { ...selections };
    delete updatedSelections[slotId];
    setSelections(updatedSelections);
  };

  // Get player data by ID
  const getPlayerById = (playerId: string) => {
    return availablePlayers.find(player => player.id === playerId);
  };

  // Get all available players
  const getAvailablePlayers = () => {
    return availablePlayers;
  };

  // Get player data
  const getPlayer = (playerId: string) => {
    return availablePlayers.find(player => player.id === playerId);
  };

  // Get players available for squad selection
  const getAvailableSquadPlayers = () => {
    return localSquadPlayers.length > 0
      ? availablePlayers.filter(player => localSquadPlayers.includes(player.id))
      : availablePlayers;
  };

  // Handle formation template changes
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    if (onTemplateChange) {
      onTemplateChange(template);
    }
  };

  // Toggle between squad selection and formation modes
  const toggleSquadMode = () => {
    console.log("Toggle squad mode called - current state:", squadMode);
    setSquadMode(prev => !prev);
  };

  // Add a player to the squad
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

  // Remove a player from the squad
  const removePlayerFromSquad = (playerId: string) => {
    if (localSquadPlayers.includes(playerId)) {
      const updatedSquad = localSquadPlayers.filter(id => id !== playerId);
      console.log("Removing player from squad:", playerId, updatedSquad);
      setLocalSquadPlayers(updatedSquad);
      
      // Also remove player from any positions they might be in
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

  // Return to squad selection mode
  const returnToSquadSelection = () => {
    console.log("Returning to squad selection");
    setSquadMode(true);
    setSelectedPlayerId(null);
    handleDragEnd();
  };

  // Finish squad selection and move to position assignment
  const finishSquadSelection = () => {
    console.log("Finishing squad selection");
    if (localSquadPlayers.length > 0) {
      setSquadMode(false);
      setSelectedPlayerId(null);
      handleDragEnd();
    }
  };

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
