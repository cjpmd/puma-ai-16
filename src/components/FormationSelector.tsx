import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PlayerPositionSelect } from "./formation/PlayerPositionSelect";
import { SubstitutesList } from "./formation/SubstitutesList";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FormationSelectorProps {
  format: "4-a-side" | "5-a-side" | "6-a-side" | "7-a-side" | "9-a-side" | "11-a-side";
  teamCategory?: string;
  onSelectionChange: (selections: Record<string, { playerId: string; position: string; performanceCategory?: string }>) => void;
  onCategoryChange?: (category: string) => void;
  performanceCategory?: string;
  selectedPlayers?: Set<string>;
}

export const FormationSelector = ({
  format,
  teamCategory,
  onSelectionChange,
  onCategoryChange,
  performanceCategory = 'MESSI',
  selectedPlayers = new Set()
}: FormationSelectorProps) => {
  const [selections, setSelections] = useState<Record<string, { playerId: string; position: string; performanceCategory?: string }>>({});

  const { data: players } = useQuery({
    queryKey: ["players", teamCategory],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("team_category", teamCategory || "")
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: Boolean(teamCategory),
  });

  const { data: positions } = useQuery({
    queryKey: ["positions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("position_definitions")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const handlePositionChange = (slotId: string, playerId: string, position: string) => {
    const newSelections = {
      ...selections,
      [slotId]: { 
        playerId, 
        position,
        performanceCategory 
      }
    };
    setSelections(newSelections);
    onSelectionChange(newSelections);
  };

  const handleCategoryChange = (category: string) => {
    if (onCategoryChange) {
      onCategoryChange(category);
      // Update all existing selections with the new category
      const updatedSelections = Object.entries(selections).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: { ...value, performanceCategory: category }
      }), {});
      setSelections(updatedSelections);
      onSelectionChange(updatedSelections);
    }
  };

  const getMaxSubstitutes = () => {
    const formatMap: Record<string, number> = {
      "4-a-side": 2,
      "5-a-side": 3,
      "6-a-side": 3,
      "7-a-side": 4,
      "9-a-side": 5,
      "11-a-side": 5
    };
    return formatMap[format] || 3;
  };

  return (
    <div className="space-y-6">
      {performanceCategory && (
        <div>
          <Label>Performance Category</Label>
          <Select value={performanceCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MESSI">Messi</SelectItem>
              <SelectItem value="RONALDO">Ronaldo</SelectItem>
              <SelectItem value="NEYMAR">Neymar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: Number(format.split('-')[0]) }).map((_, index) => (
          <PlayerPositionSelect
            key={`pos-${index}`}
            slotId={`pos-${index}`}
            position={selections[`pos-${index}`]?.position || ""}
            playerId={selections[`pos-${index}`]?.playerId || "unassigned"}
            positionDefinitions={positions}
            availablePlayers={players}
            onSelectionChange={(playerId, position) => handlePositionChange(`pos-${index}`, playerId, position)}
            selectedPlayers={selectedPlayers}
          />
        ))}
      </div>

      <SubstitutesList
        maxSubstitutes={getMaxSubstitutes()}
        selections={selections}
        availablePlayers={players}
        onSelectionChange={(slotId, playerId) => handlePositionChange(slotId, playerId, slotId)}
        selectedPlayers={selectedPlayers}
      />
    </div>
  );
};