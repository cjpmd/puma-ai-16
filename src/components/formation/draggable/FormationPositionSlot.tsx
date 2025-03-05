
import React from "react";

interface FormationPositionSlotProps {
  slotId: string;
  position: string;
  selection?: { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string };
  player?: any;
  selectedPlayerId: string | null;
  onDrop: (slotId: string, position: string, fromSlotId?: string) => void;
  onRemovePlayer: (slotId: string) => void;
  renderSubstitutionIndicator?: (position: string) => React.ReactNode;
  dropProps?: React.HTMLAttributes<HTMLDivElement>;
  handleDragStart?: (e: React.DragEvent, playerId: string) => void;
  handleDragEnd?: () => void;
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
  dropProps,
  handleDragStart,
  handleDragEnd
}) => {
  const hasPlayer = selection && selection.playerId && selection.playerId !== "unassigned";
  const isSelected = selectedPlayerId === (selection?.playerId || null);

  // Determine what to display in the circle - player initials or position
  const displayText = hasPlayer && player 
    ? player.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : position.substring(0, 2);

  // Handle removing a player when clicking on an assigned position
  const handleClick = () => {
    if (hasPlayer) {
      onRemovePlayer(slotId);
    }
  };

  // Handle click on an empty position to drop the selected player
  const handleEmptySlotClick = () => {
    if (selectedPlayerId) {
      onDrop(slotId, position);
    }
  };

  return (
    <div
      {...dropProps}
      data-position={position}
      data-slot-id={slotId}
      className={`${dropProps?.className || ''}`}
      style={{
        ...dropProps?.style,
      }}
    >
      {hasPlayer ? (
        // Show player in position
        <div
          className={`relative w-12 h-12 rounded-full flex items-center justify-center text-white font-bold cursor-pointer ${
            isSelected ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
          } ${selection?.isSubstitution ? 'bg-amber-600' : 'bg-blue-600'} hover:bg-opacity-90`}
          onClick={handleClick}
          draggable={true}
          onDragStart={(e) => {
            e.dataTransfer.setData('playerId', selection?.playerId || '');
            e.dataTransfer.setData('fromSlotId', slotId);
            if (handleDragStart) handleDragStart(e, selection?.playerId || '');
          }}
          onDragEnd={handleDragEnd}
        >
          {displayText}
          {renderSubstitutionIndicator && selection && renderSubstitutionIndicator(selection.position)}
          {player?.squad_number && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white text-blue-800 text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {player.squad_number}
            </div>
          )}
        </div>
      ) : (
        // Show empty position
        <div
          className={`w-12 h-12 rounded-full border-2 border-dashed border-white/60 flex items-center justify-center text-xs text-white font-medium cursor-pointer hover:bg-white/20 ${
            selectedPlayerId ? 'bg-white/10' : ''
          }`}
          onClick={handleEmptySlotClick}
        >
          {position}
        </div>
      )}
    </div>
  );
};
