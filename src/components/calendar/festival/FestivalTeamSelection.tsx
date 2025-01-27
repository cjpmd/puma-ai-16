import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTeamSelection } from "@/hooks/useTeamSelection";
import { TeamPositionSelect } from "./TeamPositionSelect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FestivalTeamSelectionProps {
  teams: Array<{ id: string; name: string; category: string }>;
  format: string;
  onTeamSelectionsChange: (selections: Record<string, Record<string, string>>) => void;
}

export const FestivalTeamSelection = ({ 
  teams, 
  format, 
  onTeamSelectionsChange 
}: FestivalTeamSelectionProps) => {
  const { selectedPlayers, addSelectedPlayer, removeSelectedPlayer, clearSelectedPlayers } = useTeamSelection();

  const { data: players } = useQuery({
    queryKey: ["players", teams[0]?.category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("id, name, squad_number")
        .eq("team_category", teams[0]?.category || "")
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: Boolean(teams[0]?.category),
  });

  useEffect(() => {
    clearSelectedPlayers();
  }, [teams]);

  const handlePlayerSelection = (teamId: string, playerId: string) => {
    if (playerId) {
      addSelectedPlayer(playerId);
    }
    // Update parent component with new selections
    onTeamSelectionsChange({
      [teamId]: { playerId }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {teams.map(team => (
        <Card key={team.id}>
          <CardHeader>
            <CardTitle className="text-lg">{team.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamPositionSelect
              position="player"
              playerId=""
              availablePlayers={players}
              onSelectionChange={(playerId) => handlePlayerSelection(team.id, playerId)}
              selectedPlayers={selectedPlayers}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};