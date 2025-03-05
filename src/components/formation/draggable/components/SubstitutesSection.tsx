
import React from 'react';
import { FormationFormat } from '../../types';

export interface SubstitutesSectionProps {
  selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>;
  availablePlayers: any[];
  getPlayerById: (playerId: string) => any;
  addSubstitute: (playerId: string, substitutePosition?: string) => void;
  removeSubstitute: (playerPosition: string) => void;
  selectedPlayerId: string | null;
  onPlayerClick: (playerId: string) => void;
  handleDragStart: (e: React.DragEvent, playerId: string) => void;
  handleDragEnd: (e: React.DragEvent) => void;
  renderSubstitutionIndicator?: (position: string) => React.ReactNode;
  format?: FormationFormat;
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
  renderSubstitutionIndicator,
  format
}) => {
  // Find all positions marked as substitutions
  const substitutes = Object.entries(selections)
    .filter(([_, value]) => value.position.startsWith('sub-'))
    .map(([_, value]) => ({
      position: value.position,
      playerId: value.playerId,
      player: getPlayerById(value.playerId)
    }));

  const handleAdd = () => {
    if (selectedPlayerId) {
      addSubstitute(selectedPlayerId);
    }
  };

  return (
    <div className="border rounded-md p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Substitutes</h3>
        <button
          onClick={handleAdd}
          disabled={!selectedPlayerId}
          className={`px-2 py-1 rounded text-xs ${
            selectedPlayerId 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Add Substitute
        </button>
      </div>

      {substitutes.length === 0 ? (
        <div className="text-gray-500 text-sm">No substitutes added yet</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {substitutes.map(sub => (
            <div
              key={sub.position}
              className="relative flex flex-col items-center border rounded p-2 bg-gray-50"
              draggable
              onDragStart={(e) => handleDragStart(e, sub.playerId)}
              onDragEnd={handleDragEnd}
            >
              {renderSubstitutionIndicator && renderSubstitutionIndicator(sub.position)}
              
              <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold mb-1">
                {sub.player?.squad_number || 'S'}
              </div>
              
              <div className="text-xs font-medium text-center truncate w-full">
                {sub.player?.name || 'Unknown'}
              </div>
              
              <button
                onClick={() => removeSubstitute(sub.position)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                title="Remove substitute"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
