import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
}

interface Selection {
  playerId: string;
  position: string;
}

export const FormationSelector = ({ 
  format = "7-a-side", 
  teamCategory, 
  onSelectionChange 
}: FormationSelectorProps) => {
  const [selections, setSelections] = useState<Record<string, Selection>>({});

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

  const PositionSelect = ({ slotId, defaultPosition }: { slotId: string; defaultPosition: PositionType }) => {
    const currentSelection = selections[slotId] || { playerId: "unassigned", position: defaultPosition };

    return (
      <div className="grid grid-cols-2 gap-2">
        <Select
          value={currentSelection.position}
          onValueChange={(value) => handleSelectionChange(slotId, currentSelection.playerId, value)}
        >
          <SelectTrigger className="text-left">
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">None</SelectItem>
            {positionDefinitions?.map(pos => (
              <SelectItem key={pos.id} value={pos.abbreviation.toLowerCase()}>
                {pos.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={currentSelection.playerId}
          onValueChange={(value) => handleSelectionChange(slotId, value, currentSelection.position)}
        >
          <SelectTrigger className="text-left">
            <SelectValue placeholder="Select player" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">None</SelectItem>
            {availablePlayers?.map(player => (
              <SelectItem key={player.id} value={player.id}>
                {player.name} ({player.squad_number})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  const currentPositions = formatPositions[format];
  const maxSubstitutes = Math.ceil(currentPositions.length / 2);

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentPositions.map((pos, index) => (
          <PositionSelect
            key={`${pos}-${index}`}
            slotId={`${pos}-${index}`}
            defaultPosition={pos as PositionType}
          />
        ))}
      </div>
      
      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4">Substitutes ({maxSubstitutes} max)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: maxSubstitutes }).map((_, index) => (
            <PositionSelect
              key={`sub-${index}`}
              slotId={`sub-${index}`}
              defaultPosition={"sub" as PositionType}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormationSelector;