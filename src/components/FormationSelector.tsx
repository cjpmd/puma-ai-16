
import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PlayerPositionSelect } from "./formation/PlayerPositionSelect";
import { SubstitutesList } from "./formation/SubstitutesList";
import { FormationView } from "@/components/fixtures/FormationView";

interface FormationSelectorProps {
  format: "5-a-side" | "7-a-side" | "9-a-side" | "11-a-side";
  teamName: string;
  onSelectionChange: (selections: Record<string, { playerId: string; position: string; performanceCategory?: string }>) => void;
  selectedPlayers: Set<string>;
  availablePlayers?: Array<{ id: string; name: string; squad_number?: number }>;
  performanceCategory?: string;
  initialSelections?: Record<string, { playerId: string; position: string; performanceCategory?: string }>;
  viewMode?: "team-sheet" | "formation";
  duration?: number;
  periodNumber?: number;
}

export const FormationSelector = ({
  format,
  teamName,
  onSelectionChange,
  selectedPlayers,
  availablePlayers: initialPlayers,
  performanceCategory = "MESSI",
  initialSelections,
  viewMode = "team-sheet",
  duration = 20,
  periodNumber = 1
}: FormationSelectorProps) => {
  const [selections, setSelections] = useState<Record<string, { playerId: string; position: string; performanceCategory?: string }>>(
    initialSelections || {}
  );
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
          { id: "def-1", label: "DL", className: "w-full" },
          { id: "def-2", label: "DC", className: "w-full" },
          { id: "def-3", label: "DR", className: "w-full" },
          { id: "str-1", label: "STC", className: "w-full" },
        ];
      case "7-a-side":
        return [
          { id: "gk-1", label: "GK", className: "w-full" },
          { id: "def-1", label: "DL", className: "w-full" },
          { id: "def-2", label: "DC", className: "w-full" },
          { id: "def-3", label: "DR", className: "w-full" },
          { id: "mid-1", label: "MC", className: "w-full" },
          { id: "str-1", label: "STC", className: "w-full" },
          { id: "str-2", label: "AMC", className: "w-full" },
        ];
      case "9-a-side":
        return [
          { id: "gk-1", label: "GK", className: "w-full" },
          { id: "def-1", label: "DL", className: "w-full" },
          { id: "def-2", label: "DC", className: "w-full" },
          { id: "def-3", label: "DR", className: "w-full" },
          { id: "mid-1", label: "ML", className: "w-full" },
          { id: "mid-2", label: "MC", className: "w-full" },
          { id: "mid-3", label: "MR", className: "w-full" },
          { id: "str-1", label: "AMC", className: "w-full" },
          { id: "str-2", label: "STC", className: "w-full" },
        ];
      case "11-a-side":
        return [
          { id: "gk-1", label: "GK", className: "w-full" },
          { id: "def-1", label: "DL", className: "w-full" },
          { id: "def-2", label: "DCL", className: "w-full" },
          { id: "def-3", label: "DC", className: "w-full" },
          { id: "def-4", label: "DR", className: "w-full" },
          { id: "mid-1", label: "ML", className: "w-full" },
          { id: "mid-2", label: "MCL", className: "w-full" },
          { id: "mid-3", label: "MC", className: "w-full" },
          { id: "mid-4", label: "MR", className: "w-full" },
          { id: "str-1", label: "AMC", className: "w-full" },
          { id: "str-2", label: "STC", className: "w-full" },
        ];
      default:
        return [];
    }
  };

  const formatSelectionsForFormation = () => {
    const formattedSelections = Object.entries(selections)
      .filter(([_, value]) => value.playerId !== "unassigned" && !value.position.startsWith('sub-'))
      .map(([_, value]) => {
        return {
          position: value.position,
          playerId: value.playerId
        };
      });

    return formattedSelections;
  };

  if (viewMode === "formation") {
    return (
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
        periodNumber={periodNumber}
        duration={duration}
      />
    );
  }

  return (
    <div className="space-y-4">
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
