import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TeamSettingsHeaderProps {
  captain: string;
  duration: string;
  performanceCategory?: string;
  availablePlayers?: any[];
  onCaptainChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  onCategoryChange?: (category: string) => void;
}

export const TeamSettingsHeader = ({
  captain,
  duration,
  performanceCategory = "Ronaldo",
  availablePlayers,
  onCaptainChange,
  onDurationChange,
  onCategoryChange,
}: TeamSettingsHeaderProps) => {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <Label className="text-sm font-medium">Captain</Label>
        <Select value={captain} onValueChange={onCaptainChange}>
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
          onChange={(e) => onDurationChange(e.target.value)}
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
  );
};