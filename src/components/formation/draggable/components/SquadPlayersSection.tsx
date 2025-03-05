
import React from "react";
import { UserMinus, Users, MoveHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SquadPlayersSectionProps {
  players: any[];
  squadPlayers: string[];
  onRemoveFromSquad: (playerId: string) => void;
  selectedPlayerId: string | null;
  onPlayerClick: (playerId: string) => void;
  squadMode: boolean;
}

export const SquadPlayersSection: React.FC<SquadPlayersSectionProps> = ({
  players,
  squadPlayers,
  onRemoveFromSquad,
  selectedPlayerId,
  onPlayerClick,
  squadMode
}) => {
  // Get the full player data for squad players
  const squadPlayerList = players.filter(player => squadPlayers.includes(player.id));
  
  if (squadPlayerList.length === 0) {
    return (
      <div className="border rounded-md p-4 bg-white mt-4">
        <h3 className="text-sm font-medium mb-2">
          <div className="flex items-center">
            <Users size={16} className="mr-2" />
            Team Squad
          </div>
        </h3>
        <div className="p-4 border border-dashed rounded-md bg-gray-50 flex flex-col items-center justify-center">
          <p className="text-sm text-gray-500 mb-2">No players in squad yet</p>
          <p className="text-xs text-gray-400">Select players from the list above to build your squad</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-md p-4 bg-white mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium flex items-center">
          <Users size={16} className="mr-2" />
          Team Squad ({squadPlayerList.length} players)
        </h3>
        {!squadMode && (
          <div className="text-xs text-gray-500 flex items-center">
            <MoveHorizontal size={14} className="mr-1" />
            Drag to positions
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {squadPlayerList.map(player => (
          <div
            key={player.id}
            onClick={() => !squadMode && onPlayerClick(player.id)}
            className={`flex items-center justify-between p-2 rounded-md ${
              !squadMode ? 'cursor-grab' : 'cursor-default'
            } ${
              selectedPlayerId === player.id 
                ? 'bg-blue-100 border border-blue-300' 
                : 'hover:bg-gray-50 border border-gray-200'
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
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${
                selectedPlayerId === player.id ? 'bg-blue-600' : 'bg-gray-600'
              }`}>
                {player.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <span className="font-medium text-xs">{player.name}</span>
            </div>
            <div className="flex items-center">
              {player.squad_number && (
                <span className="text-xs bg-gray-200 px-2 py-1 rounded-full mr-2">
                  #{player.squad_number}
                </span>
              )}
              {squadMode && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-full hover:bg-red-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromSquad(player.id);
                  }}
                >
                  <UserMinus size={14} className="text-red-600" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
