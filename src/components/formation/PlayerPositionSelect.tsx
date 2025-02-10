
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface PlayerPositionSelectProps {
  position: string;
  playerId: string;
  availablePlayers?: Array<{ id: string; name: string; squad_number?: number }>;
  onSelectionChange: (playerId: string, position: string) => void;
  selectedPlayers: Set<string>;
}

export const PlayerPositionSelect = ({
  position,
  playerId,
  availablePlayers = [],
  onSelectionChange,
  selectedPlayers,
}: PlayerPositionSelectProps) => {
  const allPositions = [
    'GK',     // Goalkeeper
    'DL',     // Left Back
    'DCL',    // Left Center Back
    'DC',     // Center Back
    'DCR',    // Right Center Back
    'DR',     // Right Back
    'WBL',    // Left Wing Back
    'WBR',    // Right Wing Back
    'DMC',    // Defensive Midfielder
    'ML',     // Left Midfielder
    'MCL',    // Left Center Midfielder
    'MC',     // Center Midfielder
    'MCR',    // Right Center Midfielder
    'MR',     // Right Midfielder
    'AML',    // Left Attacking Midfielder
    'AMC',    // Attacking Midfielder
    'AMR',    // Right Attacking Midfielder
    'STC',    // Striker
  ];

  // Find the currently selected player
  const selectedPlayer = availablePlayers?.find(player => player.id === playerId);

  // Debug logs
  useEffect(() => {
    console.log("PlayerPositionSelect - Position:", position);
    console.log("PlayerPositionSelect - PlayerId:", playerId);
    console.log("PlayerPositionSelect - Selected player:", selectedPlayer);
  }, [position, playerId, selectedPlayer]);

  const getPlayerDisplay = (player: { name: string; squad_number?: number }) => {
    return `${player.name}${player.squad_number ? ` (${player.squad_number})` : ''}`;
  };

  return (
    <div className="flex gap-3 p-2">
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground mb-1 block">Position</Label>
        <Select 
          defaultValue={position}
          value={position} 
          onValueChange={(newPosition) => onSelectionChange(playerId, newPosition)}
        >
          <SelectTrigger className="h-8">
            <SelectValue>{position}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {allPositions.map(pos => (
              <SelectItem key={pos} value={pos} className="text-sm">
                {pos}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Label className="text-xs text-muted-foreground mb-1 block">Player</Label>
        <Select 
          defaultValue={playerId}
          value={playerId || "unassigned"} 
          onValueChange={(value) => onSelectionChange(value, position)}
        >
          <SelectTrigger className="h-8">
            <SelectValue>
              {selectedPlayer ? getPlayerDisplay(selectedPlayer) : 'None'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned" className="text-sm">None</SelectItem>
            {availablePlayers.map(player => (
              <SelectItem 
                key={player.id} 
                value={player.id}
                className={cn(
                  "text-sm",
                  selectedPlayers.has(player.id) && player.id !== playerId && "opacity-50"
                )}
                disabled={selectedPlayers.has(player.id) && player.id !== playerId}
              >
                {getPlayerDisplay(player)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
