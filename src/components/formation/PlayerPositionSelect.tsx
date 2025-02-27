
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

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
  const [currentPosition, setCurrentPosition] = useState(position);

  // Ensure position state is updated if prop changes
  useEffect(() => {
    setCurrentPosition(position);
  }, [position]);

  const handlePositionChange = (newPosition: string) => {
    setCurrentPosition(newPosition);
    onSelectionChange(playerId, newPosition);
  };

  return (
    <div className="flex gap-3 p-2">
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground mb-1 block">Position</Label>
        <Select 
          value={currentPosition}
          onValueChange={handlePositionChange}
        >
          <SelectTrigger className="h-8 text-left">
            <SelectValue placeholder="Select position">
              {currentPosition}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
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
          onValueChange={(value) => {
            onSelectionChange(value, currentPosition);
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
