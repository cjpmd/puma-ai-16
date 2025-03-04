
import React from "react";

interface FormationHelperTextProps {
  draggingPlayer: string | null;
  selectedPlayerId: string | null;
}

export const FormationHelperText: React.FC<FormationHelperTextProps> = ({
  draggingPlayer,
  selectedPlayerId
}) => {
  return (
    <div className="absolute top-2 left-0 right-0 text-center z-20">
      <span className="px-2 py-1 bg-white/80 rounded text-xs text-gray-700">
        {draggingPlayer 
          ? "Drag player to a position" 
          : selectedPlayerId 
            ? "Now click on a position to place player" 
            : "Select or drag a player from below"}
      </span>
    </div>
  );
};
