
import React from "react";
import { FormationFormat } from "../../types";

interface SubstitutesSectionProps {
  selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>;
  availablePlayers: any[];
  getPlayerById: (playerId: string) => any;
  addSubstitute: (playerId: string) => void;
  removeSubstitute: (slotId: string) => void;
  selectedPlayerId: string | null;
  onPlayerClick: (playerId: string) => void;
  handleDragStart: (e: React.DragEvent, playerId: string) => void;
  handleDragEnd: () => void;
  renderSubstitutionIndicator?: (position: string) => React.ReactNode;
  format: FormationFormat;
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
  // Maximum substitutes based on format
  const maxSubstitutes = format === '11-a-side' ? 5 : 3;
  
  // Get current substitutions
  const substitutions = Object.entries(selections)
    .filter(([_, selection]) => selection.position.startsWith('sub-'))
    .map(([slotId, selection]) => ({
      slotId,
      playerId: selection.playerId,
      position: selection.position,
      player: getPlayerById(selection.playerId)
    }));
  
  // Handle drop on substitutes area
  const handleSubstituteDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const playerId = e.dataTransfer.getData('playerId');
    
    if (playerId && substitutions.length < maxSubstitutes) {
      addSubstitute(playerId);
    }
  };
  
  // Handle substitute click
  const handleSubstituteClick = () => {
    if (selectedPlayerId && substitutions.length < maxSubstitutes) {
      addSubstitute(selectedPlayerId);
    }
  };

  return (
    <div 
      className="border rounded-md p-4 bg-white"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleSubstituteDrop}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Substitutes</h3>
        {selectedPlayerId && substitutions.length < maxSubstitutes && (
          <button 
            onClick={handleSubstituteClick}
            className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
          >
            Add as Substitute
          </button>
        )}
      </div>
      
      {substitutions.length === 0 ? (
        <div 
          className="h-16 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 text-sm"
        >
          {selectedPlayerId 
            ? "Click 'Add as Substitute' or drop player here" 
            : "Select a player and click here or drag a player here"}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {substitutions.map(({ slotId, player, position }) => (
            <div 
              key={slotId}
              className="relative flex flex-col items-center bg-gray-50 p-2 rounded-md border border-gray-200"
            >
              <div 
                className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white mb-1"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('playerId', player.id);
                  e.dataTransfer.setData('fromSlotId', slotId);
                  handleDragStart(e, player.id);
                }}
                onDragEnd={handleDragEnd}
              >
                {player.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-medium truncate w-full text-center">{player.name}</span>
              {player.squad_number && (
                <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded-full mt-1">
                  #{player.squad_number}
                </span>
              )}
              
              {/* Custom or default substitution indicator */}
              {renderSubstitutionIndicator ? (
                renderSubstitutionIndicator(position)
              ) : (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                  S
                </div>
              )}
              
              <button 
                onClick={() => removeSubstitute(slotId)}
                className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
                title="Remove substitute"
              >
                ×
              </button>
            </div>
          ))}
          
          {/* Placeholder substitution slots */}
          {Array.from({ length: maxSubstitutes - substitutions.length }).map((_, index) => (
            <div 
              key={`sub-placeholder-${index}`}
              className="h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 text-xs"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleSubstituteDrop}
            >
              {index === 0 && substitutions.length === 0 ? "Drop player here" : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
