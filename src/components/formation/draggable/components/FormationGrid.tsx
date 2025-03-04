
import React from "react";
import { FormationFormat } from "../../types";
import { FormationPositionSlot } from "../FormationPositionSlot";
import { getFormationLayout } from "../utils/formationLayoutUtils";

interface FormationGridProps {
  format: FormationFormat;
  formationRef: React.RefObject<HTMLDivElement>;
  selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean; performanceCategory?: string }>;
  selectedPlayerId: string | null;
  handleDrop: (slotId: string, position: string, fromSlotId?: string) => void;
  handleRemovePlayer: (slotId: string) => void;
  getPlayer: (playerId: string) => any;
  handleDragStart: (e: React.DragEvent, playerId: string) => void;
  handleDragEnd: () => void;
  renderSubstitutionIndicator?: (position: string) => React.ReactNode;
}

export const FormationGrid: React.FC<FormationGridProps> = ({
  format,
  formationRef,
  selections,
  selectedPlayerId,
  handleDrop,
  handleRemovePlayer,
  getPlayer,
  handleDragStart,
  handleDragEnd,
  renderSubstitutionIndicator
}) => {
  const formationLayout = getFormationLayout(format);

  return (
    <div 
      ref={formationRef}
      className="relative w-full h-[400px] bg-green-600 rounded-lg p-4"
    >
      {/* Field markings */}
      <div className="absolute inset-0 rounded-lg">
        <div className="absolute top-0 left-0 right-0 border-t-4 border-white/70"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 border-b-4 border-white/70 rounded-b-full"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 border-4 border-white/70 border-b-0"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-12 border-4 border-white/70 border-b-0"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/70"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/3 h-1/3 border-2 border-white/70 rounded-full"></div>
        </div>
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
            style: { left: slot.x, top: slot.y, transform: 'translate(-50%, -50%)' },
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
  );
};
