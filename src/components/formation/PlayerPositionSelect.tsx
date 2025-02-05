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
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{position}</Label>
      <Select 
        value={playerId} 
        onValueChange={(value) => onSelectionChange(value, position)}
      >
        <SelectTrigger className="text-left h-9">
          <SelectValue placeholder="Please Select" />
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
  );
};