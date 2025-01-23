import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface TeamSetupFormProps {
  teamIndex: number;
  onTeamUpdate: (index: number, category: string) => void;
}

export const TeamSetupForm = ({ teamIndex, onTeamUpdate }: TeamSetupFormProps) => {
  const [playerCategories, setPlayerCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    const fetchPlayerCategories = async () => {
      const { data, error } = await supabase
        .from("player_categories")
        .select("name")
        .order("name");

      if (error) {
        console.error("Error fetching player categories:", error);
        return;
      }

      setPlayerCategories(data.map(cat => cat.name));
    };

    fetchPlayerCategories();
  }, []);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    onTeamUpdate(teamIndex, value);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-medium">Team {teamIndex + 1}</h3>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor={`category-${teamIndex}`}>Player Category</Label>
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {playerCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};