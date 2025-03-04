
import React, { useRef, useEffect } from "react";
import { useDraggableFormation } from "./hooks/useDraggableFormation";
import { FormationPositionSlot } from "./FormationPositionSlot";
import { FormationHelperText } from "./FormationHelperText";
import { FormationFormat } from "../types";

interface DraggableFormationProps {
  format: FormationFormat;
  availablePlayers: any[];
  squadPlayers?: string[];
  initialSelections?: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>;
  onSelectionChange?: (selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>) => void;
  renderSubstitutionIndicator?: (position: string) => React.ReactNode;
}

export const DraggableFormation: React.FC<DraggableFormationProps> = ({
  format,
  availablePlayers = [],
  squadPlayers = [],
  initialSelections = {},
  onSelectionChange,
  renderSubstitutionIndicator
}) => {
  const {
    selectedPlayerId,
    selections,
    formationRef,
    draggingPlayer,
    handleDrop,
    handlePlayerSelect,
    handleRemovePlayer,
    handleDragStart,
    handleDragEnd,
    handleSubstituteDrop,
    getPlayer,
    getAvailableSquadPlayers
  } = useDraggableFormation({
    initialSelections,
    onSelectionChange,
    availablePlayers,
    squadPlayers
  });

  // Get formation layout based on format
  const getFormationLayout = () => {
    switch (format) {
      case '5-a-side':
        return {
          positions: ['GK', 'DEF', 'DEF', 'MID', 'ATT'],
          layout: 'grid-cols-3 grid-rows-3',
          slots: [
            { id: 'gk', position: 'GK', gridArea: 'col-start-2 row-start-3' },
            { id: 'def-l', position: 'DEF', gridArea: 'col-start-1 row-start-2' },
            { id: 'def-r', position: 'DEF', gridArea: 'col-start-3 row-start-2' },
            { id: 'mid', position: 'MID', gridArea: 'col-start-2 row-start-2' },
            { id: 'att', position: 'ATT', gridArea: 'col-start-2 row-start-1' },
          ]
        };
      case '7-a-side':
        return {
          positions: ['GK', 'DEF', 'DEF', 'MID', 'MID', 'ATT', 'ATT'],
          layout: 'grid-cols-3 grid-rows-4',
          slots: [
            { id: 'gk', position: 'GK', gridArea: 'col-start-2 row-start-4' },
            { id: 'def-l', position: 'DEF', gridArea: 'col-start-1 row-start-3' },
            { id: 'def-r', position: 'DEF', gridArea: 'col-start-3 row-start-3' },
            { id: 'mid-l', position: 'MID', gridArea: 'col-start-1 row-start-2' },
            { id: 'mid-r', position: 'MID', gridArea: 'col-start-3 row-start-2' },
            { id: 'att-l', position: 'ATT', gridArea: 'col-start-1 row-start-1' },
            { id: 'att-r', position: 'ATT', gridArea: 'col-start-3 row-start-1' },
          ]
        };
      case '9-a-side':
        return {
          positions: ['GK', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'ATT', 'ATT'],
          layout: 'grid-cols-5 grid-rows-4',
          slots: [
            { id: 'gk', position: 'GK', gridArea: 'col-start-3 row-start-4' },
            { id: 'def-l', position: 'DEF', gridArea: 'col-start-1 row-start-3' },
            { id: 'def-c', position: 'DEF', gridArea: 'col-start-3 row-start-3' },
            { id: 'def-r', position: 'DEF', gridArea: 'col-start-5 row-start-3' },
            { id: 'mid-l', position: 'MID', gridArea: 'col-start-1 row-start-2' },
            { id: 'mid-c', position: 'MID', gridArea: 'col-start-3 row-start-2' },
            { id: 'mid-r', position: 'MID', gridArea: 'col-start-5 row-start-2' },
            { id: 'att-l', position: 'ATT', gridArea: 'col-start-2 row-start-1' },
            { id: 'att-r', position: 'ATT', gridArea: 'col-start-4 row-start-1' },
          ]
        };
      case '11-a-side':
        return {
          positions: ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'ATT', 'ATT'],
          layout: 'grid-cols-5 grid-rows-4',
          slots: [
            { id: 'gk', position: 'GK', gridArea: 'col-start-3 row-start-4' },
            { id: 'def-l', position: 'DEF', gridArea: 'col-start-1 row-start-3' },
            { id: 'def-cl', position: 'DEF', gridArea: 'col-start-2 row-start-3' },
            { id: 'def-cr', position: 'DEF', gridArea: 'col-start-4 row-start-3' },
            { id: 'def-r', position: 'DEF', gridArea: 'col-start-5 row-start-3' },
            { id: 'mid-l', position: 'MID', gridArea: 'col-start-1 row-start-2' },
            { id: 'mid-cl', position: 'MID', gridArea: 'col-start-2 row-start-2' },
            { id: 'mid-cr', position: 'MID', gridArea: 'col-start-4 row-start-2' },
            { id: 'mid-r', position: 'MID', gridArea: 'col-start-5 row-start-2' },
            { id: 'att-l', position: 'ATT', gridArea: 'col-start-2 row-start-1' },
            { id: 'att-r', position: 'ATT', gridArea: 'col-start-4 row-start-1' },
          ]
        };
      default:
        return {
          positions: ['GK', 'DEF', 'DEF', 'MID', 'MID', 'ATT', 'ATT'],
          layout: 'grid-cols-3 grid-rows-4',
          slots: [
            { id: 'gk', position: 'GK', gridArea: 'col-start-2 row-start-4' },
            { id: 'def-l', position: 'DEF', gridArea: 'col-start-1 row-start-3' },
            { id: 'def-r', position: 'DEF', gridArea: 'col-start-3 row-start-3' },
            { id: 'mid-l', position: 'MID', gridArea: 'col-start-1 row-start-2' },
            { id: 'mid-r', position: 'MID', gridArea: 'col-start-3 row-start-2' },
            { id: 'att-l', position: 'ATT', gridArea: 'col-start-1 row-start-1' },
            { id: 'att-r', position: 'ATT', gridArea: 'col-start-3 row-start-1' },
          ]
        };
    }
  };

  const formationLayout = getFormationLayout();

  // Render substitutes section
  const renderSubstitutes = () => {
    const substitutes = Object.entries(selections)
      .filter(([slotId, selection]) => selection.isSubstitution)
      .map(([slotId, selection]) => {
        const player = getPlayer(selection.playerId);
        if (!player) return null;
        
        return (
          <div 
            key={slotId}
            className="flex items-center justify-between p-2 bg-gray-100 rounded mb-1"
            draggable
            onDragStart={(e) => handleDragStart(e, selection.playerId)}
            onDragEnd={handleDragEnd}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-2">
                {player.squad_number || player.name.charAt(0)}
              </div>
              <span>{player.name}</span>
            </div>
            <button 
              onClick={() => handleRemovePlayer(slotId)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        );
      });

    return (
      <div className="mt-4">
        <h3 className="font-bold mb-2">Substitutes</h3>
        <div 
          className="min-h-[100px] border-2 border-dashed border-gray-300 p-2 rounded"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const playerId = e.dataTransfer.getData('playerId') || draggingPlayer;
            if (playerId) {
              // Find the slot ID this player is currently in
              const currentSlot = Object.entries(selections).find(
                ([_, selection]) => selection.playerId === playerId
              );
              handleSubstituteDrop(playerId, currentSlot?.[0]);
            }
          }}
        >
          {substitutes.length > 0 ? (
            substitutes
          ) : (
            <div className="text-gray-400 text-center py-4">
              Drag players here to add substitutes
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render available players section
  const renderAvailablePlayers = () => {
    const availableSquadPlayers = getAvailableSquadPlayers();
    
    if (availableSquadPlayers.length === 0) {
      return (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Available Players</h3>
          <div className="text-gray-400 text-center py-4 border-2 border-dashed border-gray-300 rounded">
            All players have been assigned
          </div>
        </div>
      );
    }

    return (
      <div className="mt-4">
        <h3 className="font-bold mb-2">Available Players</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {availableSquadPlayers.map(player => (
            <div
              key={player.id}
              className={`p-2 rounded cursor-pointer flex items-center ${
                selectedPlayerId === player.id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => handlePlayerSelect(player.id)}
              draggable
              onDragStart={(e) => handleDragStart(e, player.id)}
              onDragEnd={handleDragEnd}
            >
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-2">
                {player.squad_number || player.name.charAt(0)}
              </div>
              <span className="truncate">{player.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <FormationHelperText 
        draggingPlayer={draggingPlayer}
        selectedPlayerId={selectedPlayerId}
      />
      
      {/* Formation grid */}
      <div 
        ref={formationRef}
        className={`grid ${formationLayout.layout} gap-4 max-w-3xl mx-auto h-[400px] bg-green-100 rounded-lg p-4 relative`}
      >
        {/* Field markings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/2 h-1/2 border-2 border-white rounded-full opacity-30"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/3 h-1/4 border-2 border-white border-b-0 opacity-30"></div>
        </div>
        
        {/* Position slots */}
        {formationLayout.slots.map(slot => (
          <FormationPositionSlot
            key={slot.id}
            slotId={slot.id}
            position={slot.position}
            selection={selections[slot.id]}
            player={selections[slot.id] ? getPlayer(selections[slot.id].playerId) : null}
            selectedPlayerId={selectedPlayerId}
            onDrop={handleDrop}
            onRemovePlayer={handleRemovePlayer}
            renderSubstitutionIndicator={renderSubstitutionIndicator}
            dropProps={{
              className: `absolute ${slot.gridArea}`,
              onDragOver: (e) => e.preventDefault(),
              onDragLeave: (e) => e.preventDefault(),
              onDrop: (e) => {
                e.preventDefault();
                const playerId = e.dataTransfer.getData('playerId');
                const fromSlotId = e.dataTransfer.getData('fromSlotId');
                if (playerId) {
                  handleDrop(slot.id, slot.position, fromSlotId);
                } else if (selectedPlayerId) {
                  handleDrop(slot.id, slot.position);
                }
              }
            }}
          />
        ))}
      </div>
      
      {renderSubstitutes()}
      {renderAvailablePlayers()}
    </div>
  );
};
