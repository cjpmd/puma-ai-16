
import React from "react";
import { X } from "lucide-react";

interface SubstitutesSectionProps {
  selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>;
  getPlayer: (playerId: string) => any;
  handleDragStart: (e: React.DragEvent, playerId: string) => void;
  handleDragEnd: () => void;
  handleRemovePlayer: (slotId: string) => void;
  handleSubstituteDrop: (playerId: string, fromSlotId?: string) => void;
  draggingPlayer: string | null;
}

export const SubstitutesSection: React.FC<SubstitutesSectionProps> = ({
  selections,
  getPlayer,
  handleDragStart,
  handleDragEnd,
  handleRemovePlayer,
  handleSubstituteDrop,
  draggingPlayer
}) => {
  const substitutes = Object.entries(selections)
    .filter(([slotId, selection]) => selection.isSubstitution)
    .map(([slotId, selection]) => {
      const player = getPlayer(selection.playerId);
      if (!player) return null;
      
      return (
        <div 
          key={slotId}
          className="flex items-center justify-between p-2 bg-gray-100 rounded mb-1"
          draggable
          onDragStart={(e) => handleDragStart(e, selection.playerId)}
          onDragEnd={handleDragEnd}
        >
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-2">
              {player.squad_number || player.name.charAt(0)}
            </div>
            <span>{player.name}</span>
          </div>
          <button 
            onClick={() => handleRemovePlayer(slotId)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    });

  return (
    <div className="mt-4">
      <h3 className="font-bold mb-2">Substitutes</h3>
      <div 
        className="min-h-[100px] border-2 border-dashed border-gray-300 p-2 rounded"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const playerId = e.dataTransfer.getData('playerId') || draggingPlayer;
          if (playerId) {
            // Find the slot ID this player is currently in
            const currentSlot = Object.entries(selections).find(
              ([_, selection]) => selection.playerId === playerId
            );
            handleSubstituteDrop(playerId, currentSlot?.[0]);
          }
        }}
      >
        {substitutes.length > 0 ? (
          substitutes
        ) : (
          <div className="text-gray-400 text-center py-4">
            Drag players here to add substitutes
          </div>
        )}
      </div>
    </div>
  );
};
