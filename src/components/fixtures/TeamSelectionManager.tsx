import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormationSelector } from "@/components/FormationSelector";
import { useToast } from "@/hooks/use-toast";
import type { Fixture } from "@/types/fixture";

interface TeamSelectionManagerProps {
  fixture: Fixture;
  onSave?: (selectedPlayers: string[], captainId: string | null) => void;
}

export const TeamSelectionManager = ({ fixture }: TeamSelectionManagerProps) => {
  const { toast } = useToast();
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());

  const { data: availablePlayers } = useQuery({
    queryKey: ["available-players", fixture.team_name],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("id, name, squad_number")
        .eq("team_category", fixture.team_name.toUpperCase())
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!fixture,
  });

  const { data: existingSelections } = useQuery({
    queryKey: ["team-selections", fixture.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixture_team_selections")
        .select("*")
        .eq("fixture_id", fixture.id);

      if (error) throw error;
      return data;
    },
  });

  const handleSelectionChange = async (selections: Record<string, { playerId: string; position: string; performanceCategory?: string }>) => {
    try {
      // Delete existing selections
      await supabase
        .from("fixture_team_selections")
        .delete()
        .eq("fixture_id", fixture.id);

      // Insert new selections
      const { error } = await supabase
        .from("fixture_team_selections")
        .insert(
          Object.values(selections).map(({ playerId, performanceCategory }) => ({
            fixture_id: fixture.id,
            player_id: playerId,
            performance_category: performanceCategory || 'MESSI'
          }))
        );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team selection saved successfully",
      });

      // Update selected players set
      setSelectedPlayers(new Set(Object.values(selections).map(s => s.playerId)));
    } catch (error) {
      console.error("Error saving team selection:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save team selection",
      });
    }
  };

  if (!availablePlayers) {
    return <div>Loading players...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Selection - {fixture.opponent}</CardTitle>
      </CardHeader>
      <CardContent>
        <FormationSelector
          format={fixture.format as "7-a-side"}
          teamName={fixture.team_name}
          onSelectionChange={handleSelectionChange}
          selectedPlayers={selectedPlayers}
          availablePlayers={availablePlayers}
        />
      </CardContent>
    </Card>
  );
};