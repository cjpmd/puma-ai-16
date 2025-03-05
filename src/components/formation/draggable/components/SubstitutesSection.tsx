
import React from "react";
import { FormationFormat } from "../../types";

export interface SubstitutesSectionProps {
  format?: FormationFormat;
  selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>;
  availablePlayers: any[];
  getPlayerById: (playerId: string) => any;
  addSubstitute: (playerId: string, fromSlotId?: string) => void;
  removeSubstitute: (slotId: string) => void;
  selectedPlayerId: string | null;
  onPlayerClick: (playerId: string) => void;
  handleDragStart: (e: React.DragEvent, playerId: string) => void;
  handleDragEnd: () => void;
  renderSubstitutionIndicator?: (position: string) => React.ReactNode;
}

export const SubstitutesSection: React.FC<SubstitutesSectionProps> = ({
  selections,
  availablePlayers,
  getPlayerById,
  addSubstitute,
  removeSubstitute,
  selectedPlayerId,
  onPlayerClick,
  handleDragStart,
  handleDragEnd,
  renderSubstitutionIndicator
}) => {
  // Filter for substitutes
  const substitutes = Object.entries(selections)
    .filter(([_, value]) => value.isSubstitution)
    .map(([slotId, value]) => ({
      slotId,
      ...value,
      player: getPlayerById(value.playerId)
    }));

  // Handle dropping a player into the substitutes area
  const handleSubDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    // Check for dragged player
    const playerId = e.dataTransfer.getData('playerId');
    const fromSlotId = e.dataTransfer.getData('fromSlotId');
    
    if (playerId) {
      addSubstitute(playerId, fromSlotId);
    } else if (selectedPlayerId) {
      // Or use the selected player
      addSubstitute(selectedPlayerId);
    }
  };

  // Handle click on the area when a player is selected
  const handleSubAreaClick = () => {
    if (selectedPlayerId) {
      addSubstitute(selectedPlayerId);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Substitutes</h3>
      
      <div 
        className={`border-2 ${selectedPlayerId ? 'border-green-500 bg-green-50' : 'border-dashed border-gray-300'} rounded-lg p-4 min-h-[100px] transition-colors`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleSubDrop}
        onClick={handleSubAreaClick}
      >
        {substitutes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            {selectedPlayerId ? 'Click to add selected player as substitute' : 'Drag players here to add as substitutes'}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {substitutes.map(({ slotId, player, position }) => (
              <div key={slotId} className="relative">
                <div
                  className="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold cursor-pointer hover:bg-amber-700"
                  onClick={() => removeSubstitute(slotId)}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('playerId', player.id);
                    e.dataTransfer.setData('fromSlotId', slotId);
                    handleDragStart(e, player.id);
                  }}
                  onDragEnd={handleDragEnd}
                >
                  {player ? player.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : '?'}
                  
                  {player?.squad_number && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white text-amber-800 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {player.squad_number}
                    </div>
                  )}
                </div>
                <div className="mt-1 text-center text-xs text-gray-600 w-12 truncate">
                  {player ? player.name.split(' ')[0] : 'Unknown'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
