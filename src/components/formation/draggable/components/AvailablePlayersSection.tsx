
import React from "react";

interface AvailablePlayersSectionProps {
  availablePlayers: any[];
  handlePlayerSelect: (playerId: string) => void;
  selectedPlayerId: string | null;
  onSquadPlayersChange?: (playerIds: string[]) => void;
}

export const AvailablePlayersSection: React.FC<AvailablePlayersSectionProps> = ({
  availablePlayers,
  handlePlayerSelect,
  selectedPlayerId,
  onSquadPlayersChange
}) => {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium mb-2">Available Players</h3>
      
      <div className="flex flex-wrap gap-3 border rounded-lg p-4">
        {availablePlayers.length === 0 ? (
          <div className="w-full text-center text-gray-500 py-4">
            No available players. All players are assigned to positions.
          </div>
        ) : (
          availablePlayers.map(player => (
            <div key={player.id} className="relative">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold cursor-pointer ${
                  selectedPlayerId === player.id 
                    ? 'bg-blue-700 text-white ring-2 ring-blue-400 ring-offset-2' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                onClick={() => handlePlayerSelect(player.id)}
              >
                {player.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                
                {player.squad_number && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white text-blue-800 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {player.squad_number}
                  </div>
                )}
              </div>
              <div className="mt-1 text-center text-xs text-gray-600 w-12 truncate">
                {player.name.split(' ')[0]}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
