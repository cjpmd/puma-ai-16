
import React from "react";

interface FormationSlotProps {
  slotId: string;
  position: string;
  handleDrop: (slotId: string, position: string) => void;
  selection?: { playerId: string; position: string; isSubstitution?: boolean };
  player?: any;
  selectedPlayerId: string | null;
  handleRemovePlayer: (slotId: string) => void;
  renderSubstitutionIndicator?: (position: string) => React.ReactNode;
}

export const FormationSlot = ({
  slotId,
  position,
  handleDrop,
  selection,
  player,
  selectedPlayerId,
  handleRemovePlayer,
  renderSubstitutionIndicator
}: FormationSlotProps) => {
  return (
    <div
      className={`absolute flex items-center justify-center w-10 h-10 -translate-x-1/2 -translate-y-1/2 ${
        !player ? 'border-2 border-dashed border-white/50 hover:border-white/80' : ''
      }`}
      onClick={() => {
        if (selectedPlayerId) {
          handleDrop(slotId, position);
        }
      }}
    >
      {selection && player ? (
        <div className="relative">
          <div
            className="relative flex items-center justify-center w-8 h-8 bg-white/90 rounded-full cursor-pointer hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              handleRemovePlayer(slotId);
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
