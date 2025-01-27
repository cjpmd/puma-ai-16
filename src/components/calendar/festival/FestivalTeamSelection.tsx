import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTeamSelection } from "@/hooks/useTeamSelection";
import { FormationSelector } from "@/components/FormationSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FestivalTeamSelectionProps {
  teams: Array<{ id: string; name: string; category: string }>;
  format: string;
  onTeamSelectionsChange: (selections: Record<string, Record<string, { playerId: string; position: string }>>) => void;
}

export const FestivalTeamSelection = ({ 
  teams, 
  format, 
  onTeamSelectionsChange,
}: FestivalTeamSelectionProps) => {
  const { selectedPlayers, clearSelectedPlayers } = useTeamSelection();

  useEffect(() => {
    clearSelectedPlayers();
  }, [teams]);

  const handleSelectionChange = (teamId: string, selections: Record<string, { playerId: string; position: string }>) => {
    onTeamSelectionsChange({
      [teamId]: selections
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {teams.map(team => (
        <Card key={team.id} className="w-full">
          <CardHeader>
            <CardTitle className="text-lg">{team.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <FormationSelector
              format={format as any}
              teamCategory={team.category}
              onSelectionChange={(selections) => handleSelectionChange(team.id, selections)}
              performanceCategory={team.category}
              selectedPlayers={selectedPlayers}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};