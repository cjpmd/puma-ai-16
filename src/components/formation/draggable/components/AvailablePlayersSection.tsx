
import React from "react";

interface AvailablePlayersSectionProps {
  availableSquadPlayers: any[];
  selectedPlayerId: string | null;
  handlePlayerSelect: (playerId: string) => void;
  handleDragStart: (e: React.DragEvent, playerId: string) => void;
  handleDragEnd: () => void;
}

export const AvailablePlayersSection: React.FC<AvailablePlayersSectionProps> = ({
  availableSquadPlayers,
  selectedPlayerId,
  handlePlayerSelect,
  handleDragStart,
  handleDragEnd
}) => {
  if (availableSquadPlayers.length === 0) {
    return (
      <div className="mt-4">
        <h3 className="font-bold mb-2">Available Players</h3>
        <div className="text-gray-400 text-center py-4 border-2 border-dashed border-gray-300 rounded">
          All players have been assigned
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="font-bold mb-2">Available Players</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {availableSquadPlayers.map(player => (
          <div
            key={player.id}
            className={`p-2 rounded cursor-pointer flex items-center ${
              selectedPlayerId === player.id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => handlePlayerSelect(player.id)}
            draggable
            onDragStart={(e) => handleDragStart(e, player.id)}
            onDragEnd={handleDragEnd}
          >
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-2">
              {player.squad_number || player.name.charAt(0)}
            </div>
            <span className="truncate">{player.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
