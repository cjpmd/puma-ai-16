
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
  formationTemplate?: string;
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
  renderSubstitutionIndicator,
  formationTemplate
}) => {
  const formationLayout = getFormationLayout(format, formationTemplate);

  return (
    <div 
      ref={formationRef}
      className="relative w-full h-[400px] bg-green-600 rounded-lg p-4"
    >
      {/* Field markings */}
      <div className="absolute inset-0 rounded-lg">
        {/* Pitch outline */}
        <div className="absolute inset-0 border-2 border-white/70 rounded-lg"></div>
        
        {/* Center circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 border-2 border-white/70 rounded-full"></div>
          <div className="absolute w-2 h-2 bg-white/70 rounded-full"></div>
        </div>
        
        {/* Center line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/70 -translate-y-1/2"></div>
        
        {/* Penalty areas */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-16 border-b-2 border-l-2 border-r-2 border-white/70"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-16 border-t-2 border-l-2 border-r-2 border-white/70"></div>
        
        {/* Goal areas */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 border-b-2 border-l-2 border-r-2 border-white/70"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-6 border-t-2 border-l-2 border-r-2 border-white/70"></div>
        
        {/* Penalty spots */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white/70 rounded-full"></div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white/70 rounded-full"></div>
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
            className: `absolute`,
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
