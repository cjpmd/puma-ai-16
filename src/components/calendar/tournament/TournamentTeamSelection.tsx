import { useEffect, useState } from "react";
import { useTeamSelection } from "@/hooks/useTeamSelection";
import { FormationSelector } from "@/components/FormationSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormationView } from "@/components/fixtures/FormationView";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TeamSelection {
  playerId: string;
  position: string;
  is_substitute: boolean;
  performanceCategory?: string;
}

interface TournamentTeamSelectionProps {
  teams: Array<{ id: string; name: string; category: string }>;
  format: string;
  onTeamSelectionsChange: (selections: Record<string, TeamSelection[]>) => void;
}

export const TournamentTeamSelection = ({ 
  teams, 
  format, 
  onTeamSelectionsChange,
}: TournamentTeamSelectionProps) => {
  const { selectedPlayers, clearSelectedPlayers } = useTeamSelection();
  const [teamSelections, setTeamSelections] = useState<Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>>({});

  const { data: players } = useQuery({
    queryKey: ["all-players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    clearSelectedPlayers();
  }, [teams]);

  const handleSelectionChange = (teamId: string, selections: Record<string, { playerId: string; position: string }>) => {
    const formattedSelections = Object.entries(selections).map(([positionKey, value]) => ({
      playerId: value.playerId,
      position: value.position.split('-')[0],
      is_substitute: positionKey.startsWith('sub-'),
      performanceCategory: value.performanceCategory || 'MESSI'
    }));

    onTeamSelectionsChange({
      [teamId]: formattedSelections
    });

    setTeamSelections(prev => ({
      ...prev,
      [teamId]: selections
    }));
  };

  const formatSelectionsForFormation = (selections: Record<string, { playerId: string; position: string }>) => {
    return Object.entries(selections)
      .filter(([key]) => !key.startsWith('sub-'))
      .map(([_, { playerId, position }]) => ({
        position: position.split('-')[0].toUpperCase(),
        playerId
      }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
      {teams.map(team => (
        <Card key={team.id} className="w-full">
          <CardHeader>
            <CardTitle className="text-lg">{team.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamSelections[team.id] && (
              <FormationView
                positions={formatSelectionsForFormation(teamSelections[team.id])}
                players={players || []}
                periodNumber={1}
                duration={20}
              />
            )}
            <FormationSelector
              format={format as any}
              teamCategory={team.category}
              onSelectionChange={(selections) => handleSelectionChange(team.id, selections)}
              performanceCategory={team.category}
              selectedPlayers={selectedPlayers}
              onCategoryChange={(category) => {
                const currentSelections = teamSelections[team.id] || {};
                const updatedSelections = Object.entries(currentSelections).reduce((acc, [key, value]) => ({
                  ...acc,
                  [key]: { ...value, performanceCategory: category }
                }), {});
                handleSelectionChange(team.id, updatedSelections);
              }}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};