
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
  // Generate position shadows based on format
  const renderPositionShadows = () => {
    // Filter positions based on format
    let availablePositions = ALL_POSITIONS;
    
    if (format === "5-a-side") {
      availablePositions = ALL_POSITIONS.filter(pos => 
        ["GK", "DL", "DR", "MC", "STC"].includes(pos)
      );
    } else if (format === "7-a-side") {
      availablePositions = ALL_POSITIONS.filter(pos => 
        ["GK", "DL", "DC", "DR", "MC", "AML", "AMR"].includes(pos)
      );
    } else if (format === "9-a-side") {
      availablePositions = ALL_POSITIONS.filter(pos => 
        ["GK", "DL", "DCL", "DCR", "DR", "ML", "MC", "MR", "STC"].includes(pos)
      );
    }
    
    return (
      <div className="absolute inset-0 z-0">
        {/* GK Position */}
        <div className="absolute bottom-[5%] left-1/2 transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
          GK
        </div>
        
        {/* Defender Positions */}
        {availablePositions.includes("DL") && (
          <div className="absolute bottom-[20%] left-[20%] transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
            DL
          </div>
        )}
        {availablePositions.includes("DCL") && (
          <div className="absolute bottom-[20%] left-[35%] transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
            DCL
          </div>
        )}
        {availablePositions.includes("DC") && (
          <div className="absolute bottom-[20%] left-1/2 transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
            DC
          </div>
        )}
        {availablePositions.includes("DCR") && (
          <div className="absolute bottom-[20%] left-[65%] transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
            DCR
          </div>
        )}
        {availablePositions.includes("DR") && (
          <div className="absolute bottom-[20%] left-[80%] transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
            DR
          </div>
        )}
        
        {/* Wingback Positions */}
        {availablePositions.includes("WBL") && (
          <div className="absolute bottom-[35%] left-[15%] transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
            WBL
          </div>
        )}
        {availablePositions.includes("WBR") && (
          <div className="absolute bottom-[35%] left-[85%] transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
            WBR
          </div>
        )}
        
        {/* Defensive Midfielder */}
        {availablePositions.includes("DM") && (
          <div className="absolute bottom-[35%] left-1/2 transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
            DM
          </div>
        )}
        
        {/* Midfield Positions */}
        {availablePositions.includes("ML") && (
          <div className="absolute top-1/2 left-[20%] transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
            ML
          </div>
        )}
        {availablePositions.includes("MCL") && (
          <div className="absolute top-1/2 left-[35%] transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
            MCL
          </div>
        )}
        {availablePositions.includes("MC") && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
            MC
          </div>
        )}
        {availablePositions.includes("MCR") && (
          <div className="absolute top-1/2 left-[65%] transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
            MCR
          </div>
        )}
        {availablePositions.includes("MR") && (
          <div className="absolute top-1/2 left-[80%] transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
            MR
          </div>
        )}
        
        {/* Attacking Midfield */}
        {availablePositions.includes("AML") && (
          <div className="absolute top-[35%] left-[20%] transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
            AML
          </div>
        )}
        {availablePositions.includes("AMC") && (
          <div className="absolute top-[35%] left-1/2 transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
            AMC
          </div>
        )}
        {availablePositions.includes("AMR") && (
          <div className="absolute top-[35%] left-[80%] transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
            AMR
          </div>
        )}
        
        {/* Strikers */}
        {availablePositions.includes("STL") && (
          <div className="absolute top-[20%] left-[35%] transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
            STL
          </div>
        )}
        {availablePositions.includes("STC") && (
          <div className="absolute top-[20%] left-1/2 transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
            STC
          </div>
        )}
        {availablePositions.includes("STR") && (
          <div className="absolute top-[20%] left-[65%] transform -translate-x-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
            STR
          </div>
        )}
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
