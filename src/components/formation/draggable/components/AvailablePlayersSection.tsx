
import React from "react";

export interface AvailablePlayersSectionProps {
  players: any[];
  selectedPlayerId: string | null;
  onPlayerClick: (playerId: string) => void;
}

export const AvailablePlayersSection: React.FC<AvailablePlayersSectionProps> = ({
  players,
  selectedPlayerId,
  onPlayerClick
}) => {
  if (!players || players.length === 0) {
    return (
      <div className="border rounded-md p-4 bg-white">
        <h3 className="text-sm font-medium mb-2">Available Players</h3>
        <div className="text-gray-500 text-sm">No available players</div>
      </div>
    );
  }

  return (
    <div className="border rounded-md p-4 bg-white">
      <h3 className="text-sm font-medium mb-2">Available Players</h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {players.map(player => (
          <div
            key={player.id}
            onClick={() => onPlayerClick(player.id)}
            className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
              selectedPlayerId === player.id 
                ? 'bg-blue-100 border border-blue-300' 
                : 'hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                selectedPlayerId === player.id ? 'bg-blue-600' : 'bg-gray-600'
              }`}>
                {player.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <span className="font-medium text-sm">{player.name}</span>
            </div>
            {player.squad_number && (
              <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                #{player.squad_number}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
