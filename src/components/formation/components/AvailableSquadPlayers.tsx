
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
  // Handle dropping players back to squad
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('bg-green-100', 'ring-2', 'ring-green-500');
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-green-100', 'ring-2', 'ring-green-500');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-green-100', 'ring-2', 'ring-green-500');
    
    // Get the source slot ID
    const fromSlotId = e.dataTransfer.getData('fromSlotId');
    const playerId = e.dataTransfer.getData('playerId');
    
    console.log(`Player ${playerId} dropped back to squad from slot ${fromSlotId}`);
    
    if (fromSlotId) {
      // Call the drag end handler which will unassign the player
      onDragEnd?.();
    }
  };

  return (
    <div 
      className="w-full bg-gray-100 p-3 rounded-md"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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
