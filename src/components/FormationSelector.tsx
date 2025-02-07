import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PlayerPositionSelect } from "./formation/PlayerPositionSelect";
import { TeamSettingsHeader } from "./formation/TeamSettingsHeader";
import { SubstitutesList } from "./formation/SubstitutesList";
import { FormationView } from "./fixtures/FormationView";
import { Button } from "@/components/ui/button";

interface FormationSelectorProps {
  format: "5-a-side" | "7-a-side" | "9-a-side" | "11-a-side";
  teamName: string;
  onSelectionChange: (selections: Record<string, { playerId: string; position: string; performanceCategory?: string }>) => void;
  selectedPlayers: Set<string>;
  availablePlayers?: Array<{ id: string; name: string; squad_number?: number }>;
  performanceCategory?: string;
  initialSelections?: Record<string, { playerId: string; position: string; performanceCategory?: string }>;
}

export const FormationSelector = ({
  format,
  teamName,
  onSelectionChange,
  selectedPlayers,
  availablePlayers: initialPlayers,
  performanceCategory = "MESSI",
  initialSelections,
}: FormationSelectorProps) => {
  const [selections, setSelections] = useState<Record<string, { playerId: string; position: string; performanceCategory?: string }>>(
    initialSelections || {}
  );
  const [captain, setCaptain] = useState<string>("unassigned");
  const [duration, setDuration] = useState<string>("20");
  const [showFormation, setShowFormation] = useState(false);
  const [localPerformanceCategory, setLocalPerformanceCategory] = useState(performanceCategory);

  const { data: fetchedPlayers } = useQuery({
    queryKey: ["available-players", teamName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("id, name, squad_number")
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
    enabled: !initialPlayers,
  });

  const players = initialPlayers || fetchedPlayers || [];

  useEffect(() => {
    if (initialSelections) {
      setSelections(initialSelections);
    }
  }, [initialSelections]);

  const handlePlayerSelection = useCallback((slotId: string, playerId: string, position: string) => {
    const newSelections = {
      ...selections,
      [slotId]: {
        playerId,
        position,
        performanceCategory: localPerformanceCategory
      }
    };
    setSelections(newSelections);
    onSelectionChange(newSelections);
  }, [selections, localPerformanceCategory, onSelectionChange]);

  useEffect(() => {
    const updatedSelections = Object.fromEntries(
      Object.entries(selections).map(([key, value]) => [
        key,
        { ...value, performanceCategory: localPerformanceCategory }
      ])
    );
    
    if (JSON.stringify(selections) !== JSON.stringify(updatedSelections)) {
      setSelections(updatedSelections);
      onSelectionChange(updatedSelections);
    }
  }, [localPerformanceCategory, onSelectionChange]);

  const getFormationSlots = () => {
    switch (format) {
      case "5-a-side":
        return [
          { id: "gk-1", label: "GK", className: "w-full" },
          { id: "def-1", label: "DEF", className: "w-full" },
          { id: "def-2", label: "DEF", className: "w-full" },
          { id: "mid-1", label: "MID", className: "w-full" },
          { id: "str-1", label: "STR", className: "w-full" },
        ];
      case "7-a-side":
        return [
          { id: "gk-1", label: "GK", className: "w-full" },
          { id: "def-1", label: "DEF", className: "w-full" },
          { id: "def-2", label: "DEF", className: "w-full" },
          { id: "mid-1", label: "MID", className: "w-full" },
          { id: "mid-2", label: "MID", className: "w-full" },
          { id: "str-1", label: "STR", className: "w-full" },
          { id: "str-2", label: "STR", className: "w-full" },
        ];
      case "9-a-side":
        return [
          { id: "gk-1", label: "GK", className: "w-full" },
          { id: "def-1", label: "DEF", className: "w-full" },
          { id: "def-2", label: "DEF", className: "w-full" },
          { id: "def-3", label: "DEF", className: "w-full" },
          { id: "mid-1", label: "MID", className: "w-full" },
          { id: "mid-2", label: "MID", className: "w-full" },
          { id: "mid-3", label: "MID", className: "w-full" },
          { id: "str-1", label: "STR", className: "w-full" },
          { id: "str-2", label: "STR", className: "w-full" },
        ];
      case "11-a-side":
        return [
          { id: "gk-1", label: "GK", className: "w-full" },
          { id: "def-1", label: "DEF", className: "w-full" },
          { id: "def-2", label: "DEF", className: "w-full" },
          { id: "def-3", label: "DEF", className: "w-full" },
          { id: "def-4", label: "DEF", className: "w-full" },
          { id: "mid-1", label: "MID", className: "w-full" },
          { id: "mid-2", label: "MID", className: "w-full" },
          { id: "mid-3", label: "MID", className: "w-full" },
          { id: "mid-4", label: "MID", className: "w-full" },
          { id: "str-1", label: "STR", className: "w-full" },
          { id: "str-2", label: "STR", className: "w-full" },
        ];
      default:
        return [];
    }
  };

  const formatSelectionsForFormation = () => {
    // Updated position mapping to match the grid in FormationView
    const positionMap: Record<string, string> = {
      'GK': 'GK',
      'DEF': 'DCL', // Left center back
      'DEF-2': 'DC',  // Center back
      'DEF-3': 'DCR', // Right center back
      'MID': 'MCL', // Left midfielder
      'MID-2': 'MC', // Center midfielder
      'MID-3': 'MCR', // Right midfielder
      'STR': 'STCL', // Left striker
      'STR-2': 'STC'  // Center striker
    };

    console.log("Current selections:", selections);

    const formattedSelections = Object.entries(selections)
      .filter(([_, value]) => value.playerId !== "unassigned" && !value.position.startsWith('sub-'))
      .map(([slotId, value]) => {
        // Determine the mapped position based on the slot ID and position
        let mappedPosition = value.position;
        if (slotId.includes('-')) {
          // If it's a numbered position (e.g., def-2), use the slot ID to determine the specific position
          mappedPosition = positionMap[`${value.position}-${slotId.split('-')[1]}`] || positionMap[value.position];
        } else {
          mappedPosition = positionMap[value.position] || value.position;
        }

        console.log(`Mapping position for slot ${slotId}:`, {
          original: value.position,
          mapped: mappedPosition,
          playerId: value.playerId
        });

        return {
          position: mappedPosition,
          playerId: value.playerId
        };
      });

    console.log("Formatted selections:", formattedSelections);
    return formattedSelections;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <TeamSettingsHeader 
          captain={captain}
          duration={duration}
          availablePlayers={players}
          onCaptainChange={setCaptain}
          onDurationChange={setDuration}
        />
        <div className="flex gap-4">
          <Button
            onClick={() => setShowFormation(!showFormation)}
            variant="outline"
            size="sm"
          >
            {showFormation ? 'Hide Formation' : 'Show Formation'}
          </Button>
        </div>
      </div>
      
      {showFormation && (
        <FormationView
          positions={formatSelectionsForFormation()}
          players={players.map(player => ({
            id: player.id,
            name: player.name,
            squad_number: player.squad_number || 0,
            age: 0,
            dateOfBirth: new Date().toISOString(),
            playerType: "OUTFIELD",
            attributes: []
          }))}
          periodNumber={1}
          duration={parseInt(duration)}
        />
      )}

      <div className="grid grid-cols-2 gap-2">
        {getFormationSlots().map((slot) => (
          <PlayerPositionSelect
            key={slot.id}
            position={selections[slot.id]?.position || slot.label}
            playerId={selections[slot.id]?.playerId || "unassigned"}
            availablePlayers={players}
            onSelectionChange={(playerId, position) => handlePlayerSelection(slot.id, playerId, position)}
            selectedPlayers={selectedPlayers}
          />
        ))}
      </div>

      <SubstitutesList
        maxSubstitutes={format === "11-a-side" ? 5 : 3}
        selections={selections}
        availablePlayers={players}
        onSelectionChange={handlePlayerSelection}
        selectedPlayers={selectedPlayers}
      />
    </div>
  );
};
