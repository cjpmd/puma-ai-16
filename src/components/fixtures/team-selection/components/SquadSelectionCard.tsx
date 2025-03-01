
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { SquadSelectionGrid } from "@/components/formation/SquadSelectionGrid";

interface SquadSelectionCardProps {
  availablePlayers: any[];
  selectedPlayers: string[];
  onSelectionChange: (playerIds: string[]) => void;
  getPlayerTeams: (playerId: string) => string[];
}

export const SquadSelectionCard = ({
  availablePlayers,
  selectedPlayers,
  onSelectionChange,
  getPlayerTeams
}: SquadSelectionCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Squad Selection</CardTitle>
      </CardHeader>
      <CardContent>
        <SquadSelectionGrid
          availablePlayers={availablePlayers}
          selectedPlayers={selectedPlayers}
          onSelectionChange={onSelectionChange}
          getPlayerTeams={getPlayerTeams}
        />
      </CardContent>
    </Card>
  );
};
