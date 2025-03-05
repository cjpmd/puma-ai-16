
import { useState, useEffect, useRef } from "react";
import { PositionDropdown } from "./PositionDropdown";
import { PlayerDropdown } from "./PlayerDropdown";

interface PlayerPositionSelectProps {
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
  // Track internal state to ensure component renders correctly
  const [currentPosition, setCurrentPosition] = useState(position);
  const [currentPlayerId, setCurrentPlayerId] = useState(playerId);
  
  // Use refs to compare previous values and prevent unnecessary renders
  const prevPositionRef = useRef(position);
  const prevPlayerIdRef = useRef(playerId);
  
  // Update internal state when props change
  useEffect(() => {
    // Only update if values actually changed
    if (position !== prevPositionRef.current || playerId !== prevPlayerIdRef.current) {
      console.log(`PlayerPositionSelect: Props changed - position: ${position}, playerId: ${playerId}`);
      setCurrentPosition(position);
      setCurrentPlayerId(playerId);
      
      // Update refs
      prevPositionRef.current = position;
      prevPlayerIdRef.current = playerId;
    }
  }, [position, playerId]);

  const handlePositionChange = (newPosition: string) => {
    console.log(`Position selection changed from ${currentPosition} to: ${newPosition}`);
    setCurrentPosition(newPosition);
    // We're simplifying this component to only handle player selection
    // Position changes are handled at a higher level
  };

  const handlePlayerChange = (newPlayerId: string) => {
    console.log(`Player selection changed from ${currentPlayerId} to: ${newPlayerId}`);
    setCurrentPlayerId(newPlayerId);
    onSelectionChange(newPlayerId);
  };

  return (
    <div className="flex gap-3 p-2">
      <PositionDropdown 
        position={currentPosition} 
        onPositionChange={handlePositionChange} 
      />
      <PlayerDropdown 
        playerId={currentPlayerId} 
        availablePlayers={availablePlayers} 
        onPlayerChange={handlePlayerChange} 
        selectedPlayers={selectedPlayers} 
      />
    </div>
  );
};
