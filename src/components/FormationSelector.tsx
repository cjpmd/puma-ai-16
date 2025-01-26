import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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

export const FormationSelector = ({ 
  format = "7-a-side", 
  teamCategory, 
  onSelectionChange 
}: FormationSelectorProps) => {
  const [selectedPositions, setSelectedPositions] = useState<Record<string, string>>({});

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

  const handlePositionChange = (position: string, value: string) => {
    const newSelections = {
      ...selectedPositions,
      [position]: value
    };
    setSelectedPositions(newSelections);
    onSelectionChange?.(newSelections);
  };

  const PositionSelect = ({ position, label }: { position: string; label: PositionType }) => (
    <div className="space-y-2">
      <Label>
        {positionDefinitions?.find(p => p.abbreviation.toLowerCase() === label)?.full_name || label.toUpperCase()}
      </Label>
      <Select
        value={selectedPositions[position] || "unassigned"}
        onValueChange={(value) => handlePositionChange(position, value)}
      >
        <SelectTrigger className="w-full">
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

  const currentPositions = formatPositions[format];
  const maxSubstitutes = Math.ceil(currentPositions.length / 2);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentPositions.map((pos, index) => (
          <PositionSelect
            key={`${pos}-${index}`}
            position={`${pos}-${index}`}
            label={pos as PositionType}
          />
        ))}
      </div>
      
      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4">Substitutes ({maxSubstitutes} max)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: maxSubstitutes }).map((_, index) => (
            <PositionSelect
              key={`sub-${index}`}
              position={`sub-${index}`}
              label={"sub" as PositionType}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormationSelector;