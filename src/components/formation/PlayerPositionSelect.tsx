
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

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
  // Using refs to track previous values
  const prevPositionRef = useRef(position);
  const prevPlayerIdRef = useRef(playerId);
  
  // Internal state
  const [currentPosition, setCurrentPosition] = useState(position || "GK");
  const [currentPlayerId, setCurrentPlayerId] = useState(playerId || "unassigned");
  
  // Log initial props for debugging
  useEffect(() => {
    console.log("PlayerPositionSelect initialized with:", { position, playerId });
  }, []);

  // Update internal state when props change
  useEffect(() => {
    if (position !== prevPositionRef.current) {
      console.log(`Position prop changed from ${prevPositionRef.current} to ${position}`);
      setCurrentPosition(position || "GK");
      prevPositionRef.current = position;
    }
    
    if (playerId !== prevPlayerIdRef.current) {
      console.log(`Player ID prop changed from ${prevPlayerIdRef.current} to ${playerId}`);
      setCurrentPlayerId(playerId || "unassigned");
      prevPlayerIdRef.current = playerId;
    }
  }, [position, playerId]);

  // Handle position selection
  const handlePositionChange = (newPosition: string) => {
    console.log(`Position changed to: ${newPosition}`);
    setCurrentPosition(newPosition);
    // Propagate change to parent
    onSelectionChange(currentPlayerId, newPosition);
  };

  // Handle player selection
  const handlePlayerChange = (newPlayerId: string) => {
    console.log(`Player changed to: ${newPlayerId}`);
    setCurrentPlayerId(newPlayerId);
    // Propagate change to parent
    onSelectionChange(newPlayerId, currentPosition);
  };

  return (
    <div className="flex gap-3 p-2">
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground mb-1 block">Position</Label>
        <Select 
          value={currentPosition}
          defaultValue={currentPosition}
          onValueChange={handlePositionChange}
        >
          <SelectTrigger className="h-8 text-left">
            <SelectValue placeholder="Select position">
              {currentPosition}
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
          value={currentPlayerId}
          defaultValue={currentPlayerId}
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
                  selectedPlayers.has(player.id) && player.id !== currentPlayerId && "text-gray-500"
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
