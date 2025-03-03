
import React from "react";
import { X } from "lucide-react";

interface FormationPositionSlotProps {
  slotId: string;
  position: string;
  selection: { playerId: string; position: string; isSubstitution?: boolean } | undefined;
  player: any | null;
  selectedPlayerId: string | null;
  onDrop: (slotId: string, position: string, fromSlotId?: string) => void;
  onRemovePlayer: (slotId: string) => void;
  renderSubstitutionIndicator?: (position: string) => React.ReactNode;
  dropProps: {
    className: string;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
}

export const FormationPositionSlot: React.FC<FormationPositionSlotProps> = ({
  slotId,
  position,
  selection,
  player,
  selectedPlayerId,
  onDrop,
  onRemovePlayer,
  renderSubstitutionIndicator,
  dropProps
}) => {
  // Make the player slot draggable when player exists
  const handleDragStart = (e: React.DragEvent) => {
    if (player) {
      console.log(`Starting drag for player ${player.id} from slot ${slotId} (${position})`);
      e.dataTransfer.setData('playerId', player.id);
      e.dataTransfer.setData('fromSlotId', slotId);
      e.dataTransfer.effectAllowed = 'move';
      
      // Set a custom drag image
      const dragImage = document.createElement('div');
      dragImage.className = 'bg-blue-500 text-white rounded-full p-2 text-xs font-bold';
      dragImage.textContent = player.squad_number?.toString() || player.name.charAt(0);
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 15, 15);
      setTimeout(() => document.body.removeChild(dragImage), 0);
    }
  };

  return (
    <div
      {...dropProps}
      className={`${dropProps.className} w-22 h-22 rounded-full flex items-center justify-center ${
        !player ? 'border-2 border-dashed border-white/50 hover:border-white/80' : ''
      }`}
      onClick={() => {
        if (selectedPlayerId) {
          onDrop(slotId, position);
        }
      }}
    >
      {selection && player ? (
        <div className="relative group">
          <div
            className="relative flex items-center justify-center w-20 h-20 bg-white/90 rounded-full cursor-move hover:bg-white"
            draggable={true}
            onDragStart={handleDragStart}
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-500 text-white rounded-full text-[14px] font-bold">
                {player.squad_number || player.name.charAt(0)}
              </div>
              <div className="text-[11px] mt-0.5 max-w-16 truncate font-medium">
                {player.name.split(' ')[0]}
                {selection.isSubstitution && (
                  <span className="ml-0.5 text-orange-500">↑</span>
                )}
              </div>
            </div>
            
            {/* Remove player button */}
            <button 
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onRemovePlayer(slotId);
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Substitution indicator */}
          {renderSubstitutionIndicator && renderSubstitutionIndicator(position)}
        </div>
      ) : (
        <div className="flex items-center justify-center w-20 h-20 bg-gray-200 bg-opacity-70 rounded-full cursor-pointer hover:bg-gray-300">
          <span className="text-[12px] font-medium">{position}</span>
        </div>
      )}
    </div>
  );
};
