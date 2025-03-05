
import React, { useMemo } from "react";
import { FormationFormat } from "../../types";
import { getFormationLayout } from "../utils/formationLayoutUtils";
import { FormationPositionSlot } from "../FormationPositionSlot";

interface FormationGridProps {
  format: FormationFormat;
  template: string;
  selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>;
  selectedPlayerId: string | null;
  onDrop: (slotId: string, position: string, fromSlotId?: string) => void;
  onRemovePlayer: (slotId: string) => void;
  getPlayerById: (playerId: string) => any;
  handleDragStart: (e: React.DragEvent, playerId: string) => void;
  handleDragEnd: () => void;
  renderSubstitutionIndicator?: (position: string) => React.ReactNode;
}

export const FormationGrid: React.FC<FormationGridProps> = ({
  format,
  template,
  selections,
  selectedPlayerId,
  onDrop,
  onRemovePlayer,
  getPlayerById,
  handleDragStart,
  handleDragEnd,
  renderSubstitutionIndicator
}) => {
  // Get formation layout based on format and template
  const formationLayout = useMemo(() => {
    return getFormationLayout(format, template);
  }, [format, template]);

  // Handle drop event on the position slot
  const handlePositionDrop = (e: React.DragEvent<HTMLDivElement>, slotId: string, position: string) => {
    e.preventDefault();
    const playerId = e.dataTransfer.getData('playerId');
    const fromSlotId = e.dataTransfer.getData('fromSlotId');
    
    // Only process if we have a valid playerId
    if (playerId) {
      onDrop(slotId, position, fromSlotId || undefined);
    }
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border shadow-sm">
      {/* Football pitch background */}
      <div className="absolute inset-0 bg-green-600">
        {/* Field markings */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Center line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/70 transform -translate-y-1/2"></div>
          
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white/70 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Goal areas */}
          <div className="absolute top-0 left-1/2 w-48 h-24 border-b-2 border-l-2 border-r-2 border-white/70 transform -translate-x-1/2 rounded-b-lg"></div>
          <div className="absolute bottom-0 left-1/2 w-48 h-24 border-t-2 border-l-2 border-r-2 border-white/70 transform -translate-x-1/2 rounded-t-lg"></div>
          
          {/* Penalty areas */}
          <div className="absolute top-0 left-1/2 w-80 h-36 border-b-2 border-l-2 border-r-2 border-white/70 transform -translate-x-1/2 rounded-b-lg"></div>
          <div className="absolute bottom-0 left-1/2 w-80 h-36 border-t-2 border-l-2 border-r-2 border-white/70 transform -translate-x-1/2 rounded-t-lg"></div>
          
          {/* Goal posts */}
          <div className="absolute top-0 left-1/2 w-24 h-2 bg-white/90 transform -translate-x-1/2"></div>
          <div className="absolute bottom-0 left-1/2 w-24 h-2 bg-white/90 transform -translate-x-1/2"></div>
        </div>
        
        {/* Position slots */}
        <div className="absolute inset-0 p-6">
          {formationLayout.slots.map(slot => {
            const slotId = slot.id.toLowerCase();
            const selection = selections[slotId];
            const player = selection ? getPlayerById(selection.playerId) : null;
            
            return (
              <div
                key={slotId}
                className="absolute"
                style={{
                  left: slot.x,
                  top: slot.y,
                  transform: 'translate(-50%, -50%)'
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handlePositionDrop(e, slotId, slot.position)}
              >
                <FormationPositionSlot
                  slotId={slotId}
                  position={slot.position}
                  selection={selection}
                  player={player}
                  selectedPlayerId={selectedPlayerId}
                  onDrop={onDrop}
                  onRemovePlayer={onRemovePlayer}
                  handleDragStart={handleDragStart}
                  handleDragEnd={handleDragEnd}
                  renderSubstitutionIndicator={renderSubstitutionIndicator}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
