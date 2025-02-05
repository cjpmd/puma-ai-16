import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PlayerPositionSelect } from "./formation/PlayerPositionSelect";
import { TeamSettingsHeader } from "./formation/TeamSettingsHeader";
import { SubstitutesList } from "./formation/SubstitutesList";
import { FormationView } from "./fixtures/FormationView";
import { cn } from "@/lib/utils";
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
          { id: "str-1", label: "STR", className: "w-full" },
          { id: "str-2", label: "STR", className: "w-full" },
        ];
      default:
        return [];
    }
  };

  const formatSelectionsForFormation = () => {
    return Object.entries(selections)
      .filter(([_, value]) => value.playerId !== "unassigned" && !value.position.startsWith('sub-'))
      .map(([_, value]) => ({
        position: value.position,
        playerId: value.playerId
      }));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <TeamSettingsHeader 
          captain={captain}
          duration={duration}
          availablePlayers={players}
          onCaptainChange={setCaptain}
          onDurationChange={setDuration}
          performanceCategory={localPerformanceCategory}
          onCategoryChange={setLocalPerformanceCategory}
        />
        <div className="flex gap-4">
          <Button
            onClick={() => setShowFormation(!showFormation)}
            variant="outline"
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

      <div className="max-w-md mx-auto space-y-4">
        {getFormationSlots().map((slot) => (
          <div key={slot.id} className={cn("space-y-2", slot.className)}>
            <PlayerPositionSelect
              key={slot.id}
              slotId={slot.id}
              position={selections[slot.id]?.position || slot.label}
              playerId={selections[slot.id]?.playerId || "unassigned"}
              availablePlayers={players}
              onSelectionChange={(playerId, position) => handlePlayerSelection(slot.id, playerId, position)}
              selectedPlayers={selectedPlayers}
            />
          </div>
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