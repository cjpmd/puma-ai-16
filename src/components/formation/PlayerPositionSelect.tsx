import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PlayerPositionSelectProps {
  slotId: string;
  position: string;
  playerId: string;
  availablePlayers?: Array<{ id: string; name: string; squad_number?: number }>;
  onSelectionChange: (playerId: string) => void;
  selectedPlayers: Set<string>;
}

export const PlayerPositionSelect = ({
  position,
  playerId,
  availablePlayers = [],
  onSelectionChange,
  selectedPlayers,
}: PlayerPositionSelectProps) => {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground">Position</Label>
          <Select value={position}>
            <SelectTrigger className="text-left h-9">
              <SelectValue>{position}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={position}>{position}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Player</Label>
          <Select value={playerId} onValueChange={onSelectionChange}>
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
    </div>
  );
};