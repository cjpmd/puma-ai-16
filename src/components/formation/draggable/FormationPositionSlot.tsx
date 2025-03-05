
import React from "react";
import { X } from "lucide-react";

export interface FormationPositionSlotProps {
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
    style?: React.CSSProperties;
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
    }
  };

  return (
    <div
      {...dropProps}
      className={`${dropProps.className} w-16 h-16 flex items-center justify-center z-10 ${
        !player ? 'hover:cursor-pointer' : ''
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
            className="relative flex flex-col items-center justify-center w-14 h-14 bg-white rounded-full cursor-move shadow-md"
            draggable={true}
            onDragStart={handleDragStart}
          >
            <div className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full font-bold">
              {player.squad_number || player.name.charAt(0)}
            </div>
            <div className="text-[10px] mt-1 text-center font-medium">
              {player.name.split(' ')[0]}
            </div>
            
            {/* Remove player button */}
            <button 
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onRemovePlayer(slotId);
              }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          
          {/* Substitution indicator */}
          {renderSubstitutionIndicator && renderSubstitutionIndicator(position)}
        </div>
      ) : (
        <div className="flex items-center justify-center w-14 h-14 bg-gray-100 bg-opacity-70 rounded-full cursor-pointer hover:bg-white">
          <span className="text-xs font-medium">{position}</span>
        </div>
      )}
    </div>
  );
};
