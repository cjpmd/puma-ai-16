import { useEffect } from "react";
import { useTeamSelection } from "@/hooks/useTeamSelection";
import { FormationSelector } from "@/components/FormationSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TeamSelection {
  playerId: string;
  position: string;
  is_substitute: boolean;
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

  useEffect(() => {
    clearSelectedPlayers();
  }, [teams]);

  const handleSelectionChange = (teamId: string, selections: Record<string, { playerId: string; position: string }>) => {
    const formattedSelections = Object.entries(selections).map(([positionKey, value]) => ({
      playerId: value.playerId,
      position: value.position.split('-')[0],
      is_substitute: positionKey.startsWith('sub-')
    }));

    onTeamSelectionsChange({
      [teamId]: formattedSelections
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