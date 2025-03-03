
import React from "react";
import { DraggableFormation } from "@/components/formation/DraggableFormation";
import { FormationFormat } from "@/components/formation/types";

interface SinglePeriodViewProps {
  period: { id: string; duration: number };
  isActive: boolean;
  format: FormationFormat;
  availablePlayers: any[];
  squadPlayers: string[];
  selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>;
  onFormationChange: (selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>) => void;
}

export const SinglePeriodView = ({
  period,
  isActive,
  format,
  availablePlayers,
  squadPlayers,
  selections,
  onFormationChange
}: SinglePeriodViewProps) => {
  if (!isActive) return null;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">{period.id.replace('period-', 'Period ')} ({period.duration} minutes)</h3>
      </div>
      <DraggableFormation
        format={format}
        availablePlayers={availablePlayers}
        squadPlayers={squadPlayers}
        initialSelections={selections}
        onSelectionChange={onFormationChange}
        renderSubstitutionIndicator={(position) => (
          position.includes('SUB') ? (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-white text-[8px] flex items-center justify-center">
              S
            </span>
          ) : null
        )}
      />
    </div>
  );
};
