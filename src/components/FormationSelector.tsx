import { useState } from "react";
import { PlayerPositionSelect } from "./formation/PlayerPositionSelect";
import { SubstitutesList } from "./formation/SubstitutesList";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FormationSelectorProps {
  format: "4-a-side" | "5-a-side" | "6-a-side" | "7-a-side" | "9-a-side" | "11-a-side";
  teamCategory?: string;
  onSelectionChange: (selections: Record<string, { playerId: string; position: string; performanceCategory?: string }>) => void;
  selectedPlayers?: Set<string>;
  availablePlayers: Array<{ id: string; name: string; squad_number?: number }>;
}

export const FormationSelector = ({
  format,
  teamCategory,
  onSelectionChange,
  selectedPlayers = new Set(),
  availablePlayers
}: FormationSelectorProps) => {
  const [selections, setSelections] = useState<Record<string, { playerId: string; position: string; performanceCategory?: string }>>({});
  const [performanceCategory, setPerformanceCategory] = useState('MESSI');

  const { data: positions, isError } = useQuery({
    queryKey: ["positions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("position_definitions")
        .select("*");
      if (error) throw error;
      return data || [];
    },
    initialData: [],
  });

  const handlePositionChange = (slotId: string, playerId: string, position: string) => {
    if (!playerId || !position) return;
    
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
    setPerformanceCategory(category);
    // Update all existing selections with the new category
    const updatedSelections = Object.entries(selections).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: { ...value, performanceCategory: category }
    }), {});
    setSelections(updatedSelections);
    onSelectionChange(updatedSelections);
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

  const numPlayers = Number(format.split('-')[0]);

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: numPlayers }).map((_, index) => (
          <PlayerPositionSelect
            key={`pos-${index}`}
            slotId={`pos-${index}`}
            position={selections[`pos-${index}`]?.position || ""}
            playerId={selections[`pos-${index}`]?.playerId || "unassigned"}
            positionDefinitions={positions}
            availablePlayers={availablePlayers}
            onSelectionChange={(playerId, position) => handlePositionChange(`pos-${index}`, playerId, position)}
            selectedPlayers={selectedPlayers}
          />
        ))}
      </div>

      <SubstitutesList
        maxSubstitutes={getMaxSubstitutes()}
        selections={selections}
        availablePlayers={availablePlayers}
        onSelectionChange={(slotId, playerId) => handlePositionChange(slotId, playerId, slotId)}
        selectedPlayers={selectedPlayers}
      />
    </div>
  );
};