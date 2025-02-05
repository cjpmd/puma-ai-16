import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PlayerPositionSelectProps {
  slotId: string;
  position: string;
  playerId: string;
  availablePlayers?: Array<{ id: string; name: string; squad_number?: number }>;
  onSelectionChange: (playerId: string, position: string) => void;
  selectedPlayers: Set<string>;
}

export const PlayerPositionSelect = ({
  slotId,
  position,
  playerId,
  availablePlayers = [],
  onSelectionChange,
  selectedPlayers,
}: PlayerPositionSelectProps) => {
  const positions = {
    'GK': ['GK'],
    'DEF': ['LB', 'CB', 'RB'],
    'MID': ['LM', 'CM', 'RM'],
    'STR': ['LW', 'ST', 'RW']
  };

  const basePosition = position.split('-')[0].toUpperCase();
  const availablePositions = positions[basePosition as keyof typeof positions] || [position];

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{basePosition}</Label>
      <div className="grid grid-cols-2 gap-2">
        <Select 
          value={position} 
          onValueChange={(newPosition) => onSelectionChange(playerId, newPosition)}
        >
          <SelectTrigger className="text-left h-9">
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent>
            {availablePositions.map(pos => (
              <SelectItem key={pos} value={pos}>
                {pos}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={playerId} 
          onValueChange={(value) => onSelectionChange(value, position)}
        >
          <SelectTrigger className="text-left h-9">
            <SelectValue placeholder="Select player" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">None</SelectItem>
            {availablePlayers.map(player => (
              <SelectItem 
                key={player.id} 
                value={player.id}
                className={cn(
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