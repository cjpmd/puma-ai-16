
import React from "react";
import { UserPlus, Users, MoveHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AvailablePlayersSectionProps {
  players: any[];
  selectedPlayerId: string | null;
  onPlayerClick: (playerId: string) => void;
  squadPlayers?: string[];
  onAddToSquad?: (playerId: string) => void;
  squadMode?: boolean;
}

export const AvailablePlayersSection: React.FC<AvailablePlayersSectionProps> = ({
  players,
  selectedPlayerId,
  onPlayerClick,
  squadPlayers = [],
  onAddToSquad,
  squadMode = false
}) => {
  if (!players || players.length === 0) {
    return (
      <div className="border rounded-md p-4 bg-white">
        <h3 className="text-sm font-medium mb-2">Available Players</h3>
        <div className="text-gray-500 text-sm">No available players</div>
      </div>
    );
  }

  // Filter out players who are already in the squad when in squad mode
  const availablePlayers = squadMode 
    ? players.filter(player => !squadPlayers.includes(player.id)) 
    : players;

  return (
    <div className="border rounded-md p-4 bg-white">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Available Players</h3>
        {squadMode && (
          <div className="text-xs text-gray-500 flex items-center">
            <UserPlus size={14} className="mr-1" />
            Select to add to squad
          </div>
        )}
      </div>
      
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {availablePlayers.map(player => (
          <div
            key={player.id}
            onClick={() => squadMode && onAddToSquad ? onAddToSquad(player.id) : onPlayerClick(player.id)}
            className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
              selectedPlayerId === player.id 
                ? 'bg-blue-100 border border-blue-300' 
                : 'hover:bg-gray-100 border border-gray-200'
            }`}
            draggable={!squadMode}
            onDragStart={(e) => {
              if (squadMode) return;
              e.dataTransfer.setData('playerId', player.id);
              e.dataTransfer.setData('playerName', player.name);
              e.dataTransfer.effectAllowed = 'move';
            }}
          >
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                selectedPlayerId === player.id ? 'bg-blue-600' : 'bg-gray-600'
              }`}>
                {player.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <span className="font-medium text-sm">{player.name}</span>
            </div>
            <div className="flex items-center">
              {player.squad_number && (
                <span className="text-xs bg-gray-200 px-2 py-1 rounded-full mr-2">
                  #{player.squad_number}
                </span>
              )}
              {squadMode && onAddToSquad && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-full hover:bg-blue-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToSquad(player.id);
                  }}
                >
                  <UserPlus size={14} className="text-blue-600" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
