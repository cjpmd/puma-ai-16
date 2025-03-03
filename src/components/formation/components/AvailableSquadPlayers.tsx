
import React from "react";

interface AvailableSquadPlayersProps {
  availableSquadPlayers: any[];
  handlePlayerSelect: (playerId: string) => void;
  selectedPlayerId: string | null;
  onDragStart?: (e: React.DragEvent, playerId: string) => void;
  onDragEnd?: () => void;
}

export const AvailableSquadPlayers = ({
  availableSquadPlayers,
  handlePlayerSelect,
  selectedPlayerId,
  onDragStart,
  onDragEnd
}: AvailableSquadPlayersProps) => {
  return (
    <div className="w-full bg-gray-100 p-3 rounded-md">
      <h3 className="text-sm font-medium mb-2">Squad Players</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {availableSquadPlayers.map(player => (
          <div 
            key={player.id}
            className={`flex items-center p-1 rounded-md cursor-pointer ${
              selectedPlayerId === player.id ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => handlePlayerSelect(player.id)}
            draggable={true}
            onDragStart={(e) => onDragStart?.(e, player.id)}
            onDragEnd={onDragEnd}
          >
            <div className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full text-xs font-bold mr-1">
              {player.squad_number || player.name.charAt(0)}
            </div>
            <span className="text-xs truncate">{player.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
