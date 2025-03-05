
import React from "react";

export interface FormationHelperTextProps {
  selectedPlayerId: string | null;
  draggingPlayer: string | null;
  squadMode?: boolean;
  periodNumber?: number;
}

export const FormationHelperText: React.FC<FormationHelperTextProps> = ({ 
  selectedPlayerId, 
  draggingPlayer,
  squadMode = false,
  periodNumber = 1
}) => {
  if (squadMode) {
    return (
      <div className="rounded-md p-3 bg-indigo-50 border border-indigo-200 text-indigo-700">
        <p className="text-sm">
          <span className="font-medium">Squad Selection Mode</span>: Drag players from the available list to build your squad
        </p>
      </div>
    );
  }
  
  const getPeriodText = () => {
    if (periodNumber === 1) return "First Half";
    if (periodNumber === 2) return "Second Half";
    return `Period ${periodNumber}`;
  };
  
  const periodText = getPeriodText();
  
  if (draggingPlayer) {
    return (
      <div className="rounded-md p-3 bg-blue-50 border border-blue-200 text-blue-700">
        <p className="text-sm">
          <span className="font-medium">{periodText} - Dragging player</span>: Drop on any position to place the player
        </p>
      </div>
    );
  }
  
  if (selectedPlayerId) {
    return (
      <div className="rounded-md p-3 bg-green-50 border border-green-200 text-green-700">
        <p className="text-sm">
          <span className="font-medium">{periodText} - Player selected</span>: Drag to any position or click on a position to place the player
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md p-3 bg-gray-50 border border-gray-200 text-gray-700">
      <p className="text-sm">
        <span className="font-medium">{periodText}</span>: Drag a player onto a position to place them
      </p>
    </div>
  );
};
