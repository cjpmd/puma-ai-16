
import React from "react";

export interface FormationHelperTextProps {
  selectedPlayerId: string | null;
  draggingPlayer: string | null;
}

export const FormationHelperText: React.FC<FormationHelperTextProps> = ({ 
  selectedPlayerId, 
  draggingPlayer 
}) => {
  if (draggingPlayer) {
    return (
      <div className="rounded-md p-3 bg-blue-50 border border-blue-200 text-blue-700">
        <p className="text-sm">
          <span className="font-medium">Dragging player</span>: Drop on any position to place the player
        </p>
      </div>
    );
  }
  
  if (selectedPlayerId) {
    return (
      <div className="rounded-md p-3 bg-green-50 border border-green-200 text-green-700">
        <p className="text-sm">
          <span className="font-medium">Player selected</span>: Click on any position to place the player
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md p-3 bg-gray-50 border border-gray-200 text-gray-700">
      <p className="text-sm">
        <span className="font-medium">Select a player</span> or drag a player onto a position
      </p>
    </div>
  );
};
