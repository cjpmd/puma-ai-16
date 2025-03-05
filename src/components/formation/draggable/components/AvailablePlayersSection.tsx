
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
  return (
    <div className="mt-4">
      <h3 className="font-bold mb-2">Available Players</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {availableSquadPlayers.map(player => (
          <div
            key={player.id}
            className={`
              flex flex-col items-center p-2 border rounded cursor-pointer
              ${selectedPlayerId === player.id ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
            `}
            draggable
            onDragStart={(e) => handleDragStart(e, player.id)}
            onDragEnd={handleDragEnd}
            onClick={() => handlePlayerSelect(player.id)}
          >
            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center mb-1">
              {player.squad_number || player.name.charAt(0)}
            </div>
            <span className="text-xs font-medium text-center">{player.name}</span>
            {player.squad_number && (
              <span className="text-xs text-gray-500">#{player.squad_number}</span>
            )}
          </div>
        ))}
        
        {availableSquadPlayers.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-4">
            No available players. All players are assigned to positions.
          </div>
        )}
      </div>
    </div>
  );
};
