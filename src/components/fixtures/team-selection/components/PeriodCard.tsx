
import React from "react";
import { DraggableFormation } from "@/components/formation/DraggableFormation";
import { FormationFormat } from "@/components/formation/types";
import { Badge } from "@/components/ui/badge";

interface PeriodCardProps {
  period: { id: string; duration: number };
  availablePlayers: any[];
  squadPlayers: string[];
  performanceCategory: string;
  selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>;
  onFormationChange: (selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>) => void;
  format: FormationFormat;
}

export const PeriodCard = ({
  period,
  availablePlayers,
  squadPlayers,
  performanceCategory,
  selections,
  onFormationChange,
  format
}: PeriodCardProps) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">
          {period.id.replace('period-', 'Period ')}
        </h3>
        <div className="flex gap-2">
          <Badge variant="outline">{period.duration} min</Badge>
          <Badge>{performanceCategory}</Badge>
        </div>
      </div>
      <div className="aspect-[2/3] relative">
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
    </div>
  );
};
