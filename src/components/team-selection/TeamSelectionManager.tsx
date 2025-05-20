import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FormationFormat } from "@/components/formation/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamSelectionManagerProps } from "./types";
import { PerformanceCategory } from "@/types/player";
import { DraggableFormation } from "@/components/formation/draggable";
import { useTeamSelectionsState } from "./hooks/useTeamSelectionsState";

export const TeamSelectionManager = ({ 
  fixture, 
  onSuccess 
}: TeamSelectionManagerProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [performanceCategory, setPerformanceCategory] = useState<PerformanceCategory>(PerformanceCategory.MESSI);
  const [formationTemplate, setFormationTemplate] = useState("All");
  const [selections, setSelections] = useState<Record<string, { playerId: string; position: string; isSubstitution?: boolean }>>({});
  
  // Always use drag and drop mode
  const [forceDragEnabled] = useState(true);
  
  // Use the hook for state management
  const teamSelectionsState = useTeamSelectionsState({
    onTeamSelectionsChange: (selections) => {
      console.log("Team selections changed:", selections);
    },
    fixtureId: fixture?.id
  });
  
  // Get format from fixture, default to 7-a-side
  const format = (fixture?.format || "7-a-side") as FormationFormat;
  
  // Get players with attendance status
  const { data: players, isLoading, error } = useQuery({
    queryKey: ["players-with-attendance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleSelectionChange = (newSelections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>) => {
    console.log("Team selections changed:", newSelections);
    setSelections(newSelections);
    
    // Update selected players set
    const newSelectedPlayers = new Set<string>();
    Object.values(newSelections).forEach(selection => {
      if (selection.playerId && selection.playerId !== "unassigned") {
        newSelectedPlayers.add(selection.playerId);
      }
    });
    setSelectedPlayers(newSelectedPlayers);
  };

  // Custom substitution indicator for positions
  const renderSubstitutionIndicator = (position: string) => {
    return position.startsWith('sub-') ? (
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
        S
      </div>
    ) : null;
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Save logic would go here
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      toast({
        title: "Success",
        description: "Team selections saved successfully",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving team selections:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save team selections",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSquadSelectionChange = (playerIds: string[]) => {
    console.log("Squad selection changed:", playerIds);
    // Update the selected players set
    setSelectedPlayers(new Set(playerIds));
  };

  if (isLoading) {
    return <div>Loading players...</div>;
  }

  if (error) {
    return <div>Error loading players: {error instanceof Error ? error.message : 'Unknown error'}</div>;
  }

  if (!fixture) {
    return <div>No fixture information provided</div>;
  }

  const squadPlayers = Array.from(selectedPlayers);

  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{fixture?.category || "Team"}</CardTitle>
          <Select 
            value={performanceCategory} 
            onValueChange={(value) => setPerformanceCategory(value as PerformanceCategory)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PerformanceCategory.MESSI}>Messi</SelectItem>
              <SelectItem value={PerformanceCategory.RONALDO}>Ronaldo</SelectItem>
              <SelectItem value={PerformanceCategory.JAGS}>Jags</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <DraggableFormation 
            format={format}
            availablePlayers={players || []}
            squadPlayers={squadPlayers}
            initialSelections={selections}
            onSelectionChange={handleSelectionChange}
            performanceCategory={performanceCategory}
            formationTemplate={formationTemplate}
            onTemplateChange={setFormationTemplate}
            renderSubstitutionIndicator={renderSubstitutionIndicator}
            onSquadPlayersChange={handleSquadSelectionChange}
          />
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Team Selections'}
        </Button>
      </div>
    </div>
  );
};
