
import React from "react";
import { X } from "lucide-react";

interface SubstitutesSectionProps {
  selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>;
  getPlayer: (playerId: string) => any;
  handleRemovePlayer: (slotId: string) => void;
  onSubstituteDrop: (playerId: string) => void;
}

export const SubstitutesSection: React.FC<SubstitutesSectionProps> = ({
  selections,
  getPlayer,
  handleRemovePlayer,
  onSubstituteDrop
}) => {
  // Get all substitutes from selections
  const substitutes = Object.entries(selections)
    .filter(([_, selection]) => selection.isSubstitution)
    .map(([slotId, selection]) => ({
      slotId,
      ...selection,
      player: getPlayer(selection.playerId)
    }));

  // Handle drag over for substitute drop zone
  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('playerId')) {
      e.preventDefault();
      e.currentTarget.classList.add('bg-blue-100', 'border-blue-300');
    }
  };

  // Handle drag leave for substitute drop zone
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-blue-100', 'border-blue-300');
  };

  // Handle drop on substitute section
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-100', 'border-blue-300');
    
    const playerId = e.dataTransfer.getData('playerId');
    const fromSlotId = e.dataTransfer.getData('fromSlotId');
    
    if (playerId && !fromSlotId) {
      // If it's coming directly from available players
      onSubstituteDrop(playerId);
    } else if (playerId && fromSlotId) {
      // If it's coming from an existing position
      // Check if it's not already a substitute
      const isAlreadySubstitute = selections[fromSlotId]?.isSubstitution;
      
      if (!isAlreadySubstitute) {
        // Remove from current position and add as substitute
        handleRemovePlayer(fromSlotId);
        onSubstituteDrop(playerId);
      }
    }
  };

  return (
    <div 
      className="w-[40%] mx-auto mb-4 p-3 border-2 border-dashed border-gray-300 rounded-md transition-colors"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h3 className="text-sm font-semibold mb-2 text-center">Substitutes</h3>
      
      {substitutes.length > 0 ? (
        <div className="flex flex-wrap gap-2 justify-center">
          {substitutes.map(({ slotId, player, position }) => (
            <div key={slotId} className="relative group">
              <div 
                className="flex flex-col items-center justify-center w-16 h-16 bg-gray-100 rounded-lg p-1"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('playerId', player.id);
                  e.dataTransfer.setData('fromSlotId', slotId);
                }}
              >
                <div className="w-10 h-10 flex items-center justify-center bg-amber-500 text-white rounded-full text-xs font-bold">
                  {player.squad_number || player.name.charAt(0)}
                </div>
                <div className="text-[10px] mt-1 max-w-14 truncate text-center">
                  {player.name.split(' ')[0]}
                </div>
                <div className="text-[8px] text-gray-500">({position})</div>
                
                <button 
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemovePlayer(slotId)}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-gray-500 italic text-center py-2">
          Drag players here to add substitutes
        </div>
      )}
    </div>
  );
};
