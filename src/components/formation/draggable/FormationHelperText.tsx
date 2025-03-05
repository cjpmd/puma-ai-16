
import React from "react";

export interface FormationHelperTextProps {
  draggingPlayer: string | null;
  selectedPlayerId: string | null;
}

export const FormationHelperText: React.FC<FormationHelperTextProps> = ({ 
  draggingPlayer, 
  selectedPlayerId 
}) => {
  if (draggingPlayer) {
    return (
      <div className="text-blue-600 p-2 bg-blue-50 rounded mb-4">
        Drag player to a position on the formation or to the substitutes area
      </div>
    );
  }

  if (selectedPlayerId) {
    return (
      <div className="text-blue-600 p-2 bg-blue-50 rounded mb-4">
        Click on a position to place the selected player
      </div>
    );
  }

  return (
    <div className="text-gray-500 p-2 bg-gray-50 rounded mb-4">
      Select a player from the list below or drag players directly to positions
    </div>
  );
};
