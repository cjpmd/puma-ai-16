
import React from "react";
import { FormationSlot, FormationFormat } from "../types";
import { FormationSlotRenderer } from "./FormationSlotRenderer";
import { PitchMarkings } from "./PitchMarkings";
import { ALL_POSITIONS } from "../constants/positions";

interface DragDropFormationProps {
  formationSlots: FormationSlot[];
  format?: FormationFormat;
  onDrop?: (slotId: string, position: string) => void;
  renderSlot: (
    slotId: string, 
    position: string, 
    dropProps: {
      className: string;
      onDragOver: (e: React.DragEvent) => void;
      onDragLeave: (e: React.DragEvent) => void;
      onDrop: (e: React.DragEvent) => void;
    }
  ) => React.ReactNode;
}

export const DragDropFormation: React.FC<DragDropFormationProps> = ({
  formationSlots,
  format = "7-a-side",
  onDrop,
  renderSlot
}) => {
  // Generate position shadows for ALL positions
  const renderPositionShadows = () => {
    // Show all positions regardless of format
    return (
      <div className="absolute inset-0 z-0">
        {/* GK Position */}
        <div className="absolute bottom-[5%] left-1/2 transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
          GK
        </div>
        
        {/* Defender Positions */}
        <div className="absolute bottom-[20%] left-[20%] transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
          DL
        </div>
        <div className="absolute bottom-[20%] left-[35%] transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
          DCL
        </div>
        <div className="absolute bottom-[20%] left-1/2 transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
          DC
        </div>
        <div className="absolute bottom-[20%] left-[65%] transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
          DCR
        </div>
        <div className="absolute bottom-[20%] left-[80%] transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
          DR
        </div>
        
        {/* Wingback Positions */}
        <div className="absolute bottom-[35%] left-[15%] transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
          WBL
        </div>
        <div className="absolute bottom-[35%] left-[85%] transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
          WBR
        </div>
        
        {/* Defensive Midfielder */}
        <div className="absolute bottom-[35%] left-1/2 transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
          DM
        </div>
        
        {/* Midfield Positions */}
        <div className="absolute top-1/2 left-[20%] transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
          ML
        </div>
        <div className="absolute top-1/2 left-[35%] transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
          MCL
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
          MC
        </div>
        <div className="absolute top-1/2 left-[65%] transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
          MCR
        </div>
        <div className="absolute top-1/2 left-[80%] transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
          MR
        </div>
        
        {/* Attacking Midfield */}
        <div className="absolute top-[35%] left-[20%] transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
          AML
        </div>
        <div className="absolute top-[35%] left-1/2 transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
          AMC
        </div>
        <div className="absolute top-[35%] left-[80%] transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
          AMR
        </div>
        
        {/* Strikers */}
        <div className="absolute top-[20%] left-[35%] transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
          STL
        </div>
        <div className="absolute top-[20%] left-1/2 transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
          STC
        </div>
        <div className="absolute top-[20%] left-[65%] transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
          STR
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full aspect-[2/3] bg-emerald-500 rounded-lg overflow-hidden">
      {/* Pitch gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-30"></div>
      
      {/* Pitch markings */}
      <PitchMarkings format={format} />
      
      {/* Position shadows */}
      {renderPositionShadows()}

      {/* Formation slots */}
      {formationSlots.map((slot: FormationSlot) => (
        <FormationSlotRenderer
          key={slot.id}
          slot={slot}
          onDrop={onDrop}
          renderSlot={renderSlot}
        />
      ))}
    </div>
  );
};
