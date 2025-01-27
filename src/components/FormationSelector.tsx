import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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

  const { data: categories } = useQuery({
    queryKey: ["player-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
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
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">Position</Label>
            <Select
              value={currentSelection.position}
              onValueChange={(value) => handleSelectionChange(slotId, currentSelection.playerId, value)}
            >
              <SelectTrigger className="text-left h-9">
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
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Player</Label>
            <Select
              value={currentSelection.playerId}
              onValueChange={(value) => handleSelectionChange(slotId, value, currentSelection.position)}
            >
              <SelectTrigger className="text-left h-9">
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
        </div>
      </div>
    );
  };

  const currentPositions = formatPositions[format];
  const maxSubstitutes = Math.ceil(currentPositions.length / 2);

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label className="text-sm font-medium">Captain</Label>
          <Select
            value={captain}
            onValueChange={setCaptain}
          >
            <SelectTrigger className="text-left h-9">
              <SelectValue placeholder="Select captain" />
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
        <div>
          <Label className="text-sm font-medium">Duration (minutes)</Label>
          <Input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
            className="h-9"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Performance Category</Label>
          <Select
            value={performanceCategory}
            onValueChange={(value) => onCategoryChange?.(value)}
          >
            <SelectTrigger className="text-left h-9">
              <SelectValue placeholder="Select performance category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map(category => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        {currentPositions.map((pos, index) => (
          <PositionSelect
            key={`${pos}-${index}`}
            slotId={`${pos}-${index}`}
            defaultPosition={pos as PositionType}
          />
        ))}
      </div>
      
      <div className="border-t pt-6">
        <Label className="text-sm font-medium mb-4">Substitutes ({maxSubstitutes} max)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
          {Array.from({ length: maxSubstitutes }).map((_, index) => (
            <div key={`sub-${index}`}>
              <Label className="text-xs text-muted-foreground">Substitute {index + 1}</Label>
              <Select
                value={selections[`sub-${index}`]?.playerId || "unassigned"}
                onValueChange={(value) => handleSelectionChange(`sub-${index}`, value, "sub")}
              >
                <SelectTrigger className="text-left h-9">
                  <SelectValue placeholder="Select substitute" />
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormationSelector;