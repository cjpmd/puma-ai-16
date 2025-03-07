
import React from "react";
import { AvailablePlayersSection } from "./AvailablePlayersSection";
import { SquadPlayersSection } from "./SquadPlayersSection";

interface SquadModeViewProps {
  getAvailablePlayers: () => any[];
  selectedPlayerId: string | null;
  onPlayerClick: (playerId: string) => void;
  squadPlayers: string[];
  onAddToSquad: (playerId: string) => void;
  handleDragStart: (e: React.DragEvent, playerId: string) => void;
  handleDragEnd: () => void;
  onRemoveFromSquad: (playerId: string) => void;
}

export const SquadModeView: React.FC<SquadModeViewProps> = ({
  getAvailablePlayers,
  selectedPlayerId,
  onPlayerClick,
  squadPlayers,
  onAddToSquad,
  handleDragStart,
  handleDragEnd,
  onRemoveFromSquad
}) => {
  return (
    <div className="space-y-4">
      <AvailablePlayersSection
        players={getAvailablePlayers()}
        selectedPlayerId={selectedPlayerId}
        onPlayerClick={onPlayerClick}
        squadPlayers={squadPlayers}
        onAddToSquad={onAddToSquad}
        squadMode={true}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
      />
      
      <SquadPlayersSection
        players={getAvailablePlayers()}
        squadPlayers={squadPlayers}
        onRemoveFromSquad={onRemoveFromSquad}
        selectedPlayerId={selectedPlayerId}
        onPlayerClick={onPlayerClick}
        squadMode={true}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
      />
    </div>
  );
};
