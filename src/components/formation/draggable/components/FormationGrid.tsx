
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
  );
};
