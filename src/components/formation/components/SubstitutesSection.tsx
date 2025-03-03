
import React from "react";

interface SubstitutesSectionProps {
  selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>;
  getPlayer: (playerId: string) => any;
  handleRemovePlayer: (slotId: string) => void;
  onSubstituteDrop?: (playerId: string, fromSlotId: string) => void;
}

export const SubstitutesSection = ({
  selections,
  getPlayer,
  handleRemovePlayer,
  onSubstituteDrop
}: SubstitutesSectionProps) => {
  // Handle dropping players back to substitutes
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('bg-yellow-100', 'ring-2', 'ring-yellow-500');
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-yellow-100', 'ring-2', 'ring-yellow-500');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-yellow-100', 'ring-2', 'ring-yellow-500');
    
    // Get the player ID and source slot from dataTransfer
    const playerId = e.dataTransfer.getData('playerId');
    const fromSlotId = e.dataTransfer.getData('fromSlotId');
    
    console.log(`Dropping player ${playerId} to substitutes from slot ${fromSlotId}`);
    
    // Check if we have both playerId and fromSlotId - needed for substitutes
    if (playerId && fromSlotId && onSubstituteDrop) {
      onSubstituteDrop(playerId, fromSlotId);
    }
  };

  const substitutes = Object.entries(selections)
    .filter(([_, selection]) => selection.isSubstitution)
    .map(([slotId, selection]) => {
      const player = getPlayer(selection.playerId);
      return { slotId, player, selection };
    })
    .filter(item => item.player); // Filter out null players

  return (
    <div 
      className="w-full bg-gray-100 p-3 rounded-md mb-4 transition-colors"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h3 className="text-sm font-medium mb-2">
        Substitutes {substitutes.length > 0 ? `(${substitutes.length})` : ''}
      </h3>
      
      {substitutes.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {substitutes.map(({ slotId, player, selection }) => (
            <div
              key={slotId}
              className="bg-white rounded-md p-1 flex items-center gap-1 shadow-sm cursor-pointer"
              onClick={() => handleRemovePlayer(slotId)}
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('playerId', player.id);
                e.dataTransfer.setData('fromSlotId', slotId);
                e.dataTransfer.effectAllowed = 'move';
                
                // Set a custom drag image
                const dragImage = document.createElement('div');
                dragImage.className = 'bg-amber-500 text-white rounded-full p-1 text-xs font-bold';
                dragImage.textContent = player.squad_number?.toString() || player.name.charAt(0);
                document.body.appendChild(dragImage);
                e.dataTransfer.setDragImage(dragImage, 15, 15);
                setTimeout(() => document.body.removeChild(dragImage), 0);
              }}
            >
              <div className="w-5 h-5 flex items-center justify-center bg-amber-500 text-white rounded-full text-[9px] font-bold">
                {player.squad_number || player.name.charAt(0)}
              </div>
              <span className="text-xs">{player.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-gray-500 italic">
          No substitutes assigned - drag players here to add substitutes
        </div>
      )}
    </div>
  );
};
