
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";

interface PlayerPositionSelectProps {
  position: string;
  playerId: string;
  availablePlayers?: Array<{ id: string; name: string; squad_number?: number }>;
  onSelectionChange: (playerId: string, position: string) => void;
  selectedPlayers: Set<string>;
}

// List of all available positions
const ALL_POSITIONS = [
  "GK", // Goalkeeper
  "DL", "DCL", "DC", "DCR", "DR", // Defenders
  "WBL", "WBR", // Wing Backs
  "DM", // Defensive Midfielder
  "ML", "MCL", "MC", "MCR", "MR", // Midfielders
  "AML", "AMC", "AMR", // Attacking Midfielders
  "STC", "STL", "STR" // Strikers
];

export const PlayerPositionSelect = ({
  position,
  playerId,
  availablePlayers = [],
  onSelectionChange,
  selectedPlayers,
}: PlayerPositionSelectProps) => {
  // State to track the current position
  const [currentPosition, setCurrentPosition] = useState(position || ALL_POSITIONS[0]);

  // Update the local state when the prop changes
  useEffect(() => {
    if (position && position !== currentPosition) {
      setCurrentPosition(position);
    }
  }, [position]);

  // Memoized handler to avoid recreating on every render
  const handlePositionChange = useCallback((newPosition: string) => {
    setCurrentPosition(newPosition);
    // Notify parent about the position change with the current player
    onSelectionChange(playerId, newPosition);
  }, [playerId, onSelectionChange]);

  // Handler for player changes
  const handlePlayerChange = useCallback((newPlayerId: string) => {
    // Notify parent about the player change with the current position
    onSelectionChange(newPlayerId, currentPosition);
  }, [currentPosition, onSelectionChange]);

  return (
    <div className="flex gap-3 p-2">
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground mb-1 block">Position</Label>
        <Select 
          value={currentPosition}
          onValueChange={handlePositionChange}
          defaultValue={currentPosition}
        >
          <SelectTrigger className="h-8 text-left">
            <SelectValue placeholder="Select position">
              {currentPosition}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            {ALL_POSITIONS.map((pos) => (
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
          value={playerId || "unassigned"}
          onValueChange={handlePlayerChange}
          defaultValue={playerId || "unassigned"}
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
