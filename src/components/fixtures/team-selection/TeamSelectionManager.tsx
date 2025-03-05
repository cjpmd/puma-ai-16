
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Fixture } from "@/types/fixture";
import { FormationFormat } from "@/components/formation/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormationSelector } from "@/components/FormationSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamSelectionManagerProps } from "./types";

export const TeamSelectionManager = ({ 
  fixture, 
  onSuccess 
}: TeamSelectionManagerProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [performanceCategory, setPerformanceCategory] = useState("MESSI");
  const [formationTemplate, setFormationTemplate] = useState("All");
  
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

  const handleSelectionChange = (selections: Record<string, { playerId: string; position: string }>) => {
    console.log("Team selections changed:", selections);
    
    // Update selected players set
    const newSelectedPlayers = new Set<string>();
    Object.values(selections).forEach(selection => {
      if (selection.playerId && selection.playerId !== "unassigned") {
        newSelectedPlayers.add(selection.playerId);
      }
    });
    setSelectedPlayers(newSelectedPlayers);
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

  if (isLoading) {
    return <div>Loading players...</div>;
  }

  if (error) {
    return <div>Error loading players: {error instanceof Error ? error.message : 'Unknown error'}</div>;
  }

  if (!fixture) {
    return <div>No fixture information provided</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{fixture.category || "Team"}</CardTitle>
          <Select value={performanceCategory} onValueChange={setPerformanceCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MESSI">Messi</SelectItem>
              <SelectItem value="RONALDO">Ronaldo</SelectItem>
              <SelectItem value="JAGS">Jags</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <FormationSelector
            format={format}
            teamName={fixture.category || "Team"}
            onSelectionChange={handleSelectionChange}
            selectedPlayers={selectedPlayers}
            availablePlayers={players}
            performanceCategory={performanceCategory}
            formationTemplate={formationTemplate}
            onTemplateChange={setFormationTemplate}
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
