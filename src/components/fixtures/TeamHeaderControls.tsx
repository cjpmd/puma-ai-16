
// Update imports as needed
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { PerformanceCategory } from "@/types/player";

// Default categories if table doesn't exist
const DEFAULT_CATEGORIES = [
  { id: "MESSI", name: "Messi" },
  { id: "RONALDO", name: "Ronaldo" },
  { id: "JAGS", name: "Jags" }
];

interface TeamHeaderControlsProps {
  teamId: string;
  teamCaptains: Record<string, string>;
  availablePlayers: any[];
  onCaptainChange: (teamId: string, playerId: string) => void;
  performanceCategory: PerformanceCategory;
  onPerformanceCategoryChange: (teamId: string, periodId: string, category: string) => void;
  onAddPeriod: () => void;
  currentPeriodId?: string;
}

export const TeamHeaderControls = ({ 
  teamId, 
  teamCaptains,
  availablePlayers,
  onCaptainChange,
  performanceCategory,
  onPerformanceCategoryChange,
  onAddPeriod,
  currentPeriodId = ""
}: TeamHeaderControlsProps) => {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('performance_categories')
          .select('*')
          .order('name');
        
        if (error) {
          console.error("Error fetching performance categories:", error);
          // If table doesn't exist, continue with defaults
          return;
        }
        
        if (data && data.length > 0) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Exception fetching categories:", error);
      }
    };
    
    fetchCategories();
  }, []);
  
  return (
    <Card className="mb-4">
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select
            value={performanceCategory}
            onValueChange={(value) => onPerformanceCategoryChange(teamId, currentPeriodId, value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={teamCaptains[teamId] || ""}
            onValueChange={(value) => onCaptainChange(teamId, value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select captain" />
            </SelectTrigger>
            <SelectContent>
              {availablePlayers.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" size="sm" onClick={onAddPeriod}>
          <Plus className="h-4 w-4 mr-2" />
          Add Period
        </Button>
      </CardContent>
    </Card>
  );
};
