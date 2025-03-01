
import { Card, CardContent } from "@/components/ui/card";
import { PlayerAvatar, PlayerStatSummary } from "./utils/playerDisplayUtils";

interface SquadSelectionGridProps {
  availablePlayers: Array<{ id: string; name: string; squad_number?: number }>;
  selectedPlayers: string[];
  onPlayerToggle: (playerId: string) => void;
  playersInOtherTeams?: Record<string, Array<{ id: string; name: string }>>;
}

export const SquadSelectionGrid = ({
  availablePlayers,
  selectedPlayers,
  onPlayerToggle,
  playersInOtherTeams = {}
}: SquadSelectionGridProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-semibold mb-4">Select Squad</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {availablePlayers.map((player) => {
            const isSelected = selectedPlayers.includes(player.id);
            const teamsPlaying = playersInOtherTeams[player.id] || [];
            
            return (
              <div 
                key={player.id} 
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  isSelected ? "bg-accent/30" : "hover:bg-accent/10"
                }`}
                onClick={() => onPlayerToggle(player.id)}
              >
                <PlayerAvatar
                  name={player.name}
                  squadNumber={player.squad_number}
                  isSelected={isSelected}
                  teamsPlaying={teamsPlaying}
                />
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium line-clamp-1">{player.name}</div>
                  <PlayerStatSummary player={player} />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
