import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
    'GK', 'SK', 'LB', 'CB', 'RB', 'LWB', 'RWB', 'DM', 'CM', 'LM', 'RM',
    'CAM', 'CDM', 'LW', 'RW', 'ST', 'CF'
  ];

  return (
    <div className="grid grid-cols-2 gap-1">
      <div>
        <Label className="text-xs text-muted-foreground">Position</Label>
        <Select 
          value={position} 
          onValueChange={(newPosition) => onSelectionChange(playerId, newPosition)}
        >
          <SelectTrigger className="text-left h-7 text-xs">
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent>
            {allPositions.map(pos => (
              <SelectItem key={pos} value={pos} className="text-xs">
                {pos}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Player</Label>
        <Select 
          value={playerId} 
          onValueChange={(value) => onSelectionChange(value, position)}
        >
          <SelectTrigger className="text-left h-7 text-xs">
            <SelectValue placeholder="Select player" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned" className="text-xs">None</SelectItem>
            {availablePlayers.map(player => (
              <SelectItem 
                key={player.id} 
                value={player.id}
                className={cn(
                  "text-xs",
                  selectedPlayers.has(player.id) && player.id !== playerId && "opacity-50"
                )}
              >
                {player.name} {player.squad_number ? `(${player.squad_number})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};