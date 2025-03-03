
import React from "react";

interface FormationPositionSlotProps {
  slotId: string;
  position: string;
  selection: { playerId: string; position: string; isSubstitution?: boolean } | undefined;
  player: any | null;
  selectedPlayerId: string | null;
  onDrop: (slotId: string, position: string) => void;
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
      e.dataTransfer.setData('playerId', player.id);
      e.dataTransfer.setData('fromSlotId', slotId);
      e.stopPropagation();
    }
  };

  return (
    <div
      {...dropProps}
      className={`${dropProps.className} w-10 h-10 rounded-full flex items-center justify-center ${
        !player ? 'border-2 border-dashed border-white/50 hover:border-white/80' : ''
      }`}
      onClick={() => {
        if (selectedPlayerId) {
          onDrop(slotId, position);
        }
      }}
    >
      {selection && player ? (
        <div className="relative">
          <div
            className="relative flex items-center justify-center w-8 h-8 bg-white/90 rounded-full cursor-pointer hover:bg-white"
            draggable={true}
            onDragStart={handleDragStart}
            onClick={(e) => {
              e.stopPropagation();
              // Don't remove the player when starting a drag
              if (e.type === 'click') {
                onRemovePlayer(slotId);
              }
            }}
          >
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 flex items-center justify-center bg-blue-500 text-white rounded-full text-[9px] font-bold">
                {player.squad_number || player.name.charAt(0)}
              </div>
              <div className="text-[7px] mt-0.5 max-w-5 truncate">
                {player.name.split(' ')[0]}
                {selection.isSubstitution && (
                  <span className="ml-0.5 text-orange-500">↑</span>
                )}
              </div>
            </div>
          </div>
          {/* Substitution indicator */}
          {renderSubstitutionIndicator && renderSubstitutionIndicator(position)}
        </div>
      ) : (
        <div className="flex items-center justify-center w-8 h-8 bg-gray-200 bg-opacity-70 rounded-full cursor-pointer hover:bg-gray-300">
          <span className="text-[8px] font-medium">{position}</span>
        </div>
      )}
    </div>
  );
};
