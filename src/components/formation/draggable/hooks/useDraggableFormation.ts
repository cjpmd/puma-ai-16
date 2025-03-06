
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

  const { draggingPlayerId: draggingPlayer, handleDragStart, handleDragEnd, handlePlayerSelect } = useDragOperations();

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

  const { handleDrop } = useDropOperations({
    selections,
    updateSelections: (newSelections) => {
      previousSelectionsRef.current = selections;
      setSelections(newSelections);
    },
    selectedPlayerId,
    setSelectedPlayerId,
    draggingPlayer,
    setDraggingPlayer: handleDragEnd, // Fixed: using handleDragEnd instead of undefined setDraggingPlayer
    performanceCategory,
    preventDuplicates: true
  });

  useEffect(() => {
    const needsUpdate = JSON.stringify(selections) !== JSON.stringify(previousSelectionsRef.current);
    
    if (needsUpdate) {
      onSelectionChange(selections);
      
      if (onSquadPlayersChange) {
        const selectedPlayerIds = Object.values(selections)
          .map(selection => selection.playerId)
          .filter(id => id !== "unassigned");
        
        // Don't lose existing squad players when adding a new one
        const combinedPlayerIds = Array.from(new Set([...localSquadPlayers, ...selectedPlayerIds]));
        
        if (JSON.stringify(combinedPlayerIds.sort()) !== JSON.stringify(localSquadPlayers.sort())) {
          console.log("Updating squad players:", combinedPlayerIds);
          setLocalSquadPlayers(combinedPlayerIds);
          onSquadPlayersChange(combinedPlayerIds);
        }
      }
    }
  }, [selections, onSelectionChange, onSquadPlayersChange, localSquadPlayers]);

  useEffect(() => {
    if (squadPlayers && squadPlayers.length > 0) {
      const sortedSquadPlayers = [...squadPlayers].sort();
      const sortedLocalPlayers = [...localSquadPlayers].sort();
      
      if (JSON.stringify(sortedSquadPlayers) !== JSON.stringify(sortedLocalPlayers)) {
        console.log("Syncing squad players:", squadPlayers);
        setLocalSquadPlayers(squadPlayers);
      }
    }
  }, [squadPlayers]);

  useEffect(() => {
    setCurrentPeriod(periodNumber);
    setPeriodLength(periodDuration);
  }, [periodNumber, periodDuration]);
  
  useEffect(() => {
    if (forceSquadMode !== undefined && forceSquadMode !== squadMode) {
      console.log(`Forcing squad mode to: ${forceSquadMode}`);
      setSquadMode(forceSquadMode);
    }
  }, [forceSquadMode, squadMode]);

  const handlePlayerClick = (playerId: string) => {
    if (selectedPlayerId === playerId) {
      setSelectedPlayerId(null);
    } else {
      setSelectedPlayerId(playerId);
    }
  };

  const handleRemovePlayer = (slotId: string) => {
    const updatedSelections = { ...selections };
    delete updatedSelections[slotId];
    setSelections(updatedSelections);
  };

  const getPlayerById = (playerId: string) => {
    return availablePlayers.find(player => player.id === playerId);
  };

  const getAvailablePlayers = () => {
    return availablePlayers;
  };

  const getPlayer = (playerId: string) => {
    return availablePlayers.find(player => player.id === playerId);
  };

  const getAvailableSquadPlayers = () => {
    return localSquadPlayers.length > 0
      ? availablePlayers.filter(player => localSquadPlayers.includes(player.id))
      : availablePlayers;
  };

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    if (onTemplateChange) {
      onTemplateChange(template);
    }
  };

  const toggleSquadMode = () => {
    console.log("Toggle squad mode called - current state:", squadMode);
    setSquadMode(prev => !prev);
  };

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

  const removePlayerFromSquad = (playerId: string) => {
    if (localSquadPlayers.includes(playerId)) {
      const updatedSquad = localSquadPlayers.filter(id => id !== playerId);
      console.log("Removing player from squad:", playerId, updatedSquad);
      setLocalSquadPlayers(updatedSquad);
      
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

  const returnToSquadSelection = () => {
    console.log("Returning to squad selection");
    setSquadMode(true);
    setSelectedPlayerId(null);
    handleDragEnd(); // Fixed: using handleDragEnd instead of undefined setDraggingPlayer
  };

  const finishSquadSelection = () => {
    console.log("Finishing squad selection");
    if (localSquadPlayers.length > 0) {
      setSquadMode(false);
      setSelectedPlayerId(null);
      handleDragEnd(); // Fixed: using handleDragEnd instead of undefined setDraggingPlayer
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
