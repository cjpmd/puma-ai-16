import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamSettingsHeader } from "./formation/TeamSettingsHeader";
import { PlayerPositionSelect } from "./formation/PlayerPositionSelect";
import { SubstitutesList } from "./formation/SubstitutesList";

type PositionType = "gk" | "dl" | "dcl" | "dc" | "dcr" | "dr" | "ml" | "mc" | "mr" | "amc" | "st";

const formatPositions = {
  "4-a-side": ["gk", "dc", "mc", "st"],
  "5-a-side": ["gk", "dc", "mc", "amc", "st"],
  "6-a-side": ["gk", "dcl", "dcr", "mc", "amc", "st"],
  "7-a-side": ["gk", "dcl", "dc", "dcr", "mc", "amc", "st"],
  "9-a-side": ["gk", "dl", "dcl", "dcr", "dr", "mc", "amc", "st"],
  "11-a-side": ["gk", "dl", "dcl", "dc", "dcr", "dr", "ml", "mc", "mr", "amc", "st"]
} as const;

interface FormationSelectorProps {
  format?: keyof typeof formatPositions;
  teamCategory?: string;
  onSelectionChange?: (selections: Record<string, string>) => void;
  onCategoryChange?: (category: string) => void;
  performanceCategory?: string;
}

interface Selection {
  playerId: string;
  position: string;
}

export const FormationSelector = ({ 
  format = "7-a-side", 
  teamCategory, 
  onSelectionChange,
  onCategoryChange,
  performanceCategory = "Ronaldo"
}: FormationSelectorProps) => {
  const [selections, setSelections] = useState<Record<string, Selection>>({});
  const [captain, setCaptain] = useState<string>("unassigned");
  const [duration, setDuration] = useState<string>("20");

  const { data: positionDefinitions } = useQuery({
    queryKey: ["position-definitions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("position_definitions")
        .select("*");

      if (error) throw error;
      return data;
    },
  });

  const { data: availablePlayers } = useQuery({
    queryKey: ["available-players", teamCategory],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("team_category", teamCategory);

      if (error) throw error;
      return data;
    },
    enabled: !!teamCategory,
  });

  const handleSelectionChange = (slotId: string, playerId: string, position: string) => {
    const newSelections = {
      ...selections,
      [slotId]: {
        playerId,
        position
      }
    };
    setSelections(newSelections);
    
    const formattedSelections = Object.entries(newSelections).reduce((acc, [key, value]) => {
      acc[key] = value.playerId;
      return acc;
    }, {} as Record<string, string>);
    
    onSelectionChange?.(formattedSelections);
  };

  const currentPositions = formatPositions[format];
  const maxSubstitutes = Math.ceil(currentPositions.length / 2);

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto p-4">
      <TeamSettingsHeader
        captain={captain}
        duration={duration}
        performanceCategory={performanceCategory}
        availablePlayers={availablePlayers}
        onCaptainChange={setCaptain}
        onDurationChange={setDuration}
        onCategoryChange={onCategoryChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        {currentPositions.map((pos, index) => (
          <PlayerPositionSelect
            key={`${pos}-${index}`}
            slotId={`${pos}-${index}`}
            position={selections[`${pos}-${index}`]?.position || pos}
            playerId={selections[`${pos}-${index}`]?.playerId || "unassigned"}
            positionDefinitions={positionDefinitions}
            availablePlayers={availablePlayers}
            onSelectionChange={handleSelectionChange}
          />
        ))}
      </div>
      
      <SubstitutesList
        maxSubstitutes={maxSubstitutes}
        selections={selections}
        availablePlayers={availablePlayers}
        onSelectionChange={handleSelectionChange}
      />
    </div>
  );
};

export default FormationSelector;