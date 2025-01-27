import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface PlayerPositionSelectProps {
  slotId: string;
  position: string;
  playerId: string;
  positionDefinitions?: any[];
  availablePlayers?: any[];
  onSelectionChange: (slotId: string, playerId: string, position: string) => void;
}

export const PlayerPositionSelect = ({
  slotId,
  position,
  playerId,
  positionDefinitions,
  availablePlayers,
  onSelectionChange,
}: PlayerPositionSelectProps) => {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground">Position</Label>
          <Select
            value={position}
            onValueChange={(value) => onSelectionChange(slotId, playerId, value)}
          >
            <SelectTrigger className="text-left h-9">
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">None</SelectItem>
              {positionDefinitions?.map(pos => (
                <SelectItem key={pos.id} value={pos.abbreviation.toLowerCase()}>
                  {pos.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Player</Label>
          <Select
            value={playerId}
            onValueChange={(value) => onSelectionChange(slotId, value, position)}
          >
            <SelectTrigger className="text-left h-9">
              <SelectValue placeholder="Select player" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">None</SelectItem>
              {availablePlayers?.map(player => (
                <SelectItem key={player.id} value={player.id}>
                  {player.name} ({player.squad_number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};