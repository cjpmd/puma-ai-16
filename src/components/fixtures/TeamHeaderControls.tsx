
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TeamHeaderControlsProps {
  teamId: string;
  teamCaptains: Record<string, string>;
  availablePlayers: any[];
  onCaptainChange: (teamId: string, playerId: string) => void;
  performanceCategory: string;
  onPerformanceCategoryChange: (value: string) => void;
  onAddPeriod: () => void;
}

export const TeamHeaderControls = ({
  teamId,
  teamCaptains,
  availablePlayers,
  onCaptainChange,
  performanceCategory,
  onPerformanceCategoryChange,
  onAddPeriod
}: TeamHeaderControlsProps) => {
  const [categories, setCategories] = useState<{name: string, value: string}[]>([
    { name: "Messi", value: "MESSI" },
    { name: "Ronaldo", value: "RONALDO" },
    { name: "Jags", value: "JAGS" }
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('performance_categories')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching performance categories:', error);
          return;
        }

        if (data && data.length > 0) {
          const formattedCategories = data.map(cat => ({
            name: cat.name,
            value: cat.id.toUpperCase()
          }));
          setCategories(formattedCategories);
        }
      } catch (error) {
        console.error('Error in fetchCategories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="flex justify-end items-center gap-4 mb-4">
      <div className="flex-1 flex items-center gap-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Crown className="h-4 w-4" />
          Captain
        </Label>
        <Select
          value={teamCaptains[teamId] || "unassigned"}
          onValueChange={(value) => onCaptainChange(teamId, value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select captain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">None</SelectItem>
            {availablePlayers?.map(player => (
              <SelectItem 
                key={player.id} 
                value={player.id}
              >
                {player.name} {player.squad_number ? `(${player.squad_number})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Select
        value={performanceCategory || "MESSI"}
        onValueChange={onPerformanceCategoryChange}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map(category => (
            <SelectItem key={category.value} value={category.value}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button 
        onClick={onAddPeriod}
        variant="outline"
      >
        Add Period
      </Button>
    </div>
  );
};
