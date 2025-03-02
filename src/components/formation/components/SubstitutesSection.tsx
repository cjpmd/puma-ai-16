
import React from "react";

interface SubstitutesSectionProps {
  selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>;
  getPlayer: (playerId: string) => any;
  handleRemovePlayer: (slotId: string) => void;
}

export const SubstitutesSection = ({
  selections,
  getPlayer,
  handleRemovePlayer
}: SubstitutesSectionProps) => {
  return (
    <div className="w-full bg-gray-100 p-3 rounded-md mb-4">
      <h3 className="text-sm font-medium mb-2">Substitutes</h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(selections)
          .filter(([_, selection]) => selection.isSubstitution)
          .map(([slotId, selection]) => {
            const player = getPlayer(selection.playerId);
            if (!player) return null;
            
            return (
              <div
                key={slotId}
                className="bg-white rounded-md p-1 flex items-center gap-1 shadow-sm"
                onClick={() => handleRemovePlayer(slotId)}
              >
                <div className="w-5 h-5 flex items-center justify-center bg-amber-500 text-white rounded-full text-[9px] font-bold">
                  {player.squad_number || player.name.charAt(0)}
                </div>
                <span className="text-xs">{player.name}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
};
