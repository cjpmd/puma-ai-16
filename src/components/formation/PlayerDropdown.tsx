
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getPlayerDisplay } from "./utils/playerUtils";

interface PlayerDropdownProps {
  playerId: string;
  availablePlayers: Array<{ id: string; name: string; squad_number?: number }>;
  onPlayerChange: (newPlayerId: string) => void;
  selectedPlayers: Set<string>;
}

export const PlayerDropdown = ({ 
  playerId, 
  availablePlayers, 
  onPlayerChange, 
  selectedPlayers 
}: PlayerDropdownProps) => {
  return (
    <div className="flex-1">
      <Label className="text-xs text-muted-foreground mb-1 block">Player</Label>
      <Select 
        value={playerId}
        onValueChange={onPlayerChange}
      >
        <SelectTrigger className="h-8 text-left">
          <SelectValue placeholder="Select player" />
        </SelectTrigger>
        <SelectContent className="bg-white z-50 max-h-60">
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
  );
};
