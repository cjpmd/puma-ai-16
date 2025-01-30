import { useEffect, useState } from "react";
import { useTeamSelection } from "@/hooks/useTeamSelection";
import { FormationSelector } from "@/components/FormationSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormationView } from "@/components/fixtures/FormationView";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TeamSelection {
  playerId: string;
  position: string;
  is_substitute: boolean;
  performanceCategory?: string;
}

interface FestivalTeamSelectionProps {
  teams: Array<{ id: string; name: string; category: string }>;
  format: string;
  onTeamSelectionsChange: (selections: Record<string, TeamSelection[]>) => void;
}

export const FestivalTeamSelection = ({ 
  teams, 
  format, 
  onTeamSelectionsChange,
}: FestivalTeamSelectionProps) => {
  const { toast } = useToast();
  const { selectedPlayers, clearSelectedPlayers } = useTeamSelection();
  const [teamSelections, setTeamSelections] = useState<Record<string, TeamSelection[]>>({});

  const { data: players } = useQuery({
    queryKey: ["all-players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*");
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load players",
        });
        throw error;
      }
      return data;
    },
  });

  useEffect(() => {
    clearSelectedPlayers();
  }, [teams]);

  const handleSelectionChange = (teamId: string, selections: Record<string, { playerId: string; position: string; performanceCategory?: string }>) => {
    const formattedSelections = Object.entries(selections).map(([_, value]) => ({
      playerId: value.playerId,
      position: value.position,
      is_substitute: value.position.startsWith('sub-'),
      performanceCategory: value.performanceCategory || 'MESSI'
    }));

    const newSelections = {
      ...teamSelections,
      [teamId]: formattedSelections
    };
    setTeamSelections(newSelections);
    onTeamSelectionsChange(newSelections);
  };

  const formatSelectionsForFormation = (selections: TeamSelection[]) => {
    return selections
      .filter(selection => !selection.position.startsWith('sub-'))
      .map(({ playerId, position }) => ({
        position: position.split('-')[0].toUpperCase(),
        playerId
      }));
  };

  if (!players) {
    return <div>Loading...</div>;
  }

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
                players={players}
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
                if (teamSelections[team.id]) {
                  const updatedSelections = teamSelections[team.id].map(selection => ({
                    ...selection,
                    performanceCategory: category
                  }));
                  const newSelections = {
                    ...teamSelections,
                    [team.id]: updatedSelections
                  };
                  setTeamSelections(newSelections);
                  onTeamSelectionsChange(newSelections);
                }
              }}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};