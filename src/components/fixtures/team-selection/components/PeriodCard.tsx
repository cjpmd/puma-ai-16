
import React from "react";
import { DraggableFormation } from "@/components/formation/DraggableFormation";
import { FormationFormat } from "@/components/formation/types";
import { Badge } from "@/components/ui/badge";
import { PerformanceCategory } from "@/types/player";

interface PeriodCardProps {
  period: { id: string; duration: number };
  availablePlayers: any[];
  squadPlayers: string[];
  performanceCategory: PerformanceCategory | string;
  selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>;
  onFormationChange: (selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>) => void;
  format: FormationFormat;
}

// Alternate interface to support both versions of the component
export interface AlternatePeriodCardProps {
  periodNumber: string;
  teamId: string;
  format: FormationFormat;
  duration: number;
  onDurationChange: (duration: number) => void;
  availablePlayers: any[];
  selectedPlayers: Set<string>;
  selections: Record<string, { playerId: string; position: string; performanceCategory?: string }>;
  onSelectionChange: (selections: any) => void;
  performanceCategory: PerformanceCategory | string;
}

export const PeriodCard: React.FC<PeriodCardProps> = ({
  period,
  availablePlayers,
  squadPlayers,
  performanceCategory,
  selections,
  onFormationChange,
  format
}) => {
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

// Create an alternate version of the PeriodCard that accepts different props
export const AlternatePeriodCard: React.FC<AlternatePeriodCardProps> = ({
  periodNumber,
  teamId,
  format,
  duration,
  onDurationChange,
  availablePlayers,
  selectedPlayers,
  selections,
  onSelectionChange,
  performanceCategory
}) => {
  // Convert format from string to FormationFormat if necessary
  const formationFormat = typeof format === 'string' ? format as FormationFormat : format;
  
  // Convert selectedPlayers Set to array
  const squadPlayers = Array.from(selectedPlayers);
  
  const handleFormationChange = (newSelections: any) => {
    onSelectionChange(newSelections);
  };
  
  const period = {
    id: `period-${periodNumber}`,
    duration
  };
  
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">Period {periodNumber}</h3>
        <div className="flex gap-2">
          <Badge variant="outline">{duration} min</Badge>
          <Badge>{performanceCategory}</Badge>
        </div>
      </div>
      <div className="aspect-[2/3] relative">
        <DraggableFormation
          format={formationFormat}
          availablePlayers={availablePlayers}
          squadPlayers={squadPlayers}
          initialSelections={selections}
          onSelectionChange={handleFormationChange}
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

export default PeriodCard;
