
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
  // We're only using controlled inputs now - no internal state

  const handlePositionChange = (newPosition: string) => {
    console.log(`Position selection changed to: ${newPosition}`);
    onSelectionChange(playerId, newPosition);
  };

  const handlePlayerChange = (newPlayerId: string) => {
    console.log(`Player selection changed to: ${newPlayerId}`);
    onSelectionChange(newPlayerId, position);
  };

  return (
    <div className="flex gap-3 p-2">
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground mb-1 block">Position</Label>
        <Select 
          value={position}
          onValueChange={handlePositionChange}
        >
          <SelectTrigger className="h-8 text-left">
            <SelectValue placeholder="Select position">
              {position}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white z-50 max-h-60">
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
          value={playerId}
          onValueChange={handlePlayerChange}
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
    </div>
  );
};

const getPlayerDisplay = (player: { name: string; squad_number?: number }) => {
  return player ? `${player.name}${player.squad_number ? ` (${player.squad_number})` : ''}` : 'None';
};
