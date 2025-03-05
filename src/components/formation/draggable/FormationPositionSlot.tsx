
import React from "react";

interface FormationPositionSlotProps {
  slotId: string;
  position: string;
  selection?: { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string };
  player: any | null;
  selectedPlayerId: string | null;
  onDrop: (slotId: string, position: string, fromSlotId?: string) => void;
  onRemovePlayer: (slotId: string) => void;
  dropProps?: React.HTMLProps<HTMLDivElement> & { style?: React.CSSProperties };
  handleDragStart: (e: React.DragEvent, playerId: string) => void;
  handleDragEnd: () => void;
  renderSubstitutionIndicator?: (position: string) => React.ReactNode;
}

export const FormationPositionSlot: React.FC<FormationPositionSlotProps> = ({
  slotId,
  position,
  selection,
  player,
  selectedPlayerId,
  onDrop,
  onRemovePlayer,
  dropProps,
  handleDragStart,
  handleDragEnd,
  renderSubstitutionIndicator,
}) => {
  const hasPlayer = !!selection?.playerId && !!player;
  const isSelected = selectedPlayerId === selection?.playerId;
  
  // Determine the background color based on the player selection status
  const bgColor = isSelected 
    ? 'bg-blue-700' 
    : (hasPlayer ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-200 hover:bg-gray-300');
  
  // Determine text color based on selection
  const textColor = hasPlayer ? 'text-white' : 'text-gray-600';
  
  // Handle drop zone style when a player is selected
  const dropZoneStyle = selectedPlayerId && !hasPlayer
    ? 'ring-2 ring-green-500 ring-offset-1'
    : '';

  // Check if the position is a substitution position
  const isSubstitution = selection?.isSubstitution || position.startsWith('sub-');

  return (
    <div {...dropProps} 
      className={`${dropProps?.className || ''} ${dropZoneStyle}`}
    >
      <div 
        className={`relative w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${bgColor} ${textColor}`}
        onClick={() => {
          if (hasPlayer) {
            onRemovePlayer(slotId);
          } else if (selectedPlayerId) {
            onDrop(slotId, position);
          }
        }}
        draggable={hasPlayer}
        onDragStart={(e) => {
          if (hasPlayer) {
            e.dataTransfer.setData('playerId', selection.playerId);
            e.dataTransfer.setData('fromSlotId', slotId);
            handleDragStart(e, selection.playerId);
          }
        }}
        onDragEnd={handleDragEnd}
      >
        {hasPlayer ? (
          <>
            {player.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
            
            {player.squad_number && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white text-blue-800 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {player.squad_number}
              </div>
            )}
            
            {/* Custom substitution indicator */}
            {isSubstitution && renderSubstitutionIndicator ? (
              renderSubstitutionIndicator(position)
            ) : isSubstitution ? (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                S
              </div>
            ) : null}
          </>
        ) : (
          <span className="text-xs font-semibold">{position}</span>
        )}
      </div>
    </div>
  );
};
