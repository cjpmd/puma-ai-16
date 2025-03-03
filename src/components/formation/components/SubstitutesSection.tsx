
import React from 'react';
import { X } from 'lucide-react';

interface SubstitutesSectionProps {
  selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>;
  getPlayer: (playerId: string) => any;
  handleRemovePlayer: (slotId: string) => void;
  onSubstituteDrop: (playerId: string, fromSlotId: string) => void;
}

export const SubstitutesSection: React.FC<SubstitutesSectionProps> = ({
  selections,
  getPlayer,
  handleRemovePlayer,
  onSubstituteDrop
}) => {
  // Filter substitutes from selections
  const substitutes = Object.entries(selections)
    .filter(([slotId, selection]) => slotId.startsWith('sub-') || selection.isSubstitution)
    .map(([slotId, selection]) => {
      const player = getPlayer(selection.playerId);
      return { slotId, player, selection };
    })
    .filter(sub => sub.player);

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Highlight the drop area
    e.currentTarget.classList.add('bg-blue-100', 'ring-2', 'ring-blue-400');
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-blue-100', 'ring-2', 'ring-blue-400');
  };

  // Handle drop - move player to substitutes
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-blue-100', 'ring-2', 'ring-blue-400');

    // Get player ID and current position from dataTransfer
    const playerId = e.dataTransfer.getData('playerId');
    const fromSlotId = e.dataTransfer.getData('fromSlotId');

    // Only process if we have both values
    if (playerId && fromSlotId && !fromSlotId.startsWith('sub-')) {
      onSubstituteDrop(playerId, fromSlotId);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm mb-6 p-4">
      <h3 className="text-sm font-semibold mb-2">Substitutes</h3>
      
      <div
        className="min-h-16 border-2 border-dashed border-gray-200 rounded-lg p-3 transition-colors"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {substitutes.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {substitutes.map(({ slotId, player, selection }) => (
              <div 
                key={slotId} 
                className="group relative flex items-center justify-center bg-gray-100 rounded-lg p-2"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('playerId', player.id);
                  e.dataTransfer.setData('fromSlotId', slotId);
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 flex items-center justify-center bg-blue-500 text-white rounded-full text-xs font-bold">
                    {player.squad_number || player.name.charAt(0)}
                  </div>
                  <span className="text-xs font-medium">{player.name}</span>
                  <button 
                    className="ml-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemovePlayer(slotId)}
                    title="Remove player"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic">
            No substitutes assigned
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Drag players here to designate them as substitutes
      </p>
    </div>
  );
};
