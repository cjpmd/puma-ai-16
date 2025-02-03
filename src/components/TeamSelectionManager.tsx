import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormationSelector } from "@/components/FormationSelector";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TeamSelectionManagerProps {
  teams: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  format: string;
  onTeamSelectionsChange?: (selections: Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>) => void;
}

export const TeamSelectionManager = ({
  teams,
  format,
  onTeamSelectionsChange 
}: TeamSelectionManagerProps) => {
  const [teamSelections, setTeamSelections] = useState<Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>>({});
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());

  const { data: players } = useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleTeamSelectionChange = (teamId: string, selections: Record<string, { playerId: string; position: string; performanceCategory?: string }>) => {
    const newSelections = {
      ...teamSelections,
      [teamId]: selections,
    };

    setTeamSelections(newSelections);

    // Update selected players
    const newSelectedPlayers = new Set<string>();
    Object.values(newSelections).forEach(teamSelection => {
      Object.values(teamSelection).forEach(selection => {
        if (selection.playerId !== "unassigned") {
          newSelectedPlayers.add(selection.playerId);
        }
      });
    });
    setSelectedPlayers(newSelectedPlayers);

    onTeamSelectionsChange?.(newSelections);
  };

  if (!players) {
    return <div>Loading players...</div>;
  }

  return (
    <div className="space-y-6">
      {teams.map(team => (
        <Card key={team.id} className="mb-6">
          <CardHeader>
            <CardTitle>{team.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <FormationSelector
              format={format as "4-a-side" | "5-a-side" | "7-a-side" | "9-a-side" | "11-a-side"}
              teamName={team.name}
              onSelectionChange={(selections) => handleTeamSelectionChange(team.id, selections)}
              selectedPlayers={selectedPlayers}
              availablePlayers={players || []}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};