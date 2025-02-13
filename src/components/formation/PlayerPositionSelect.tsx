
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
  return (
    <div className="flex gap-3 p-2">
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground mb-1 block">Position</Label>
        <Select 
          value={position}
          onValueChange={(newPosition) => {
            onSelectionChange(playerId, newPosition);
          }}
        >
          <SelectTrigger className="h-8 text-left">
            <SelectValue placeholder="Select position">
              {position}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {position && (
              <SelectItem value={position} className="text-sm">
                {position}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Label className="text-xs text-muted-foreground mb-1 block">Player</Label>
        <Select 
          value={playerId || "unassigned"}
          onValueChange={(value) => {
            onSelectionChange(value, position);
          }}
        >
          <SelectTrigger className="h-8 text-left">
            <SelectValue placeholder="Select player" />
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            <SelectItem value="unassigned" className="text-sm">
              None
            </SelectItem>
            {availablePlayers.map(player => (
              <SelectItem 
                key={player.id} 
                value={player.id}
                className={cn(
                  "text-sm",
                  selectedPlayers.has(player.id) && player.id !== playerId && "text-gray-500"
                )}
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

const getPlayerDisplay = (player: { name: string; squad_number?: number }) => {
  return player ? `${player.name}${player.squad_number ? ` (${player.squad_number})` : ''}` : 'None';
};

