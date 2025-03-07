
import { Card, CardContent } from "@/components/ui/card";
import { FormationFormat } from "@/components/formation/types";
import { PerformanceCategory } from "@/types/player";
import { TeamSelectionCardHeader } from "./components/TeamSelectionCardHeader";
import { useState } from "react";
import { getPeriodDisplayName } from "./utils/periodUtils";
import { DraggableFormation } from "@/components/formation/draggable";
import { FormationSelector } from "@/components/FormationSelector";

interface TeamSelectionCardProps {
  team: {
    id: string;
    name: string;
    category: string;
  };
  format: FormationFormat;
  players: any[];
  selectedPlayers: Set<string>;
  performanceCategory: PerformanceCategory;
  onPerformanceCategoryChange: (value: PerformanceCategory) => void;
  onSelectionChange: (selections: Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>) => void;
  formationTemplate: string;
  onTemplateChange: (template: string) => void;
  viewMode?: "formation" | "team-sheet";
  periodNumber?: number;
  duration?: number;
  onPeriodChange?: (periodNumber: number) => void;
  onSquadSelectionChange?: (playerIds: string[]) => void;
  squadSelection?: string[];
  useDragAndDrop?: boolean;
  onToggleDragAndDrop?: (enabled: boolean) => void;
  onDurationChange?: (duration: number) => void;
  periodId?: number;
}

export const TeamSelectionCard = ({
  team,
  format,
  players,
  selectedPlayers,
  performanceCategory,
  onPerformanceCategoryChange,
  onSelectionChange,
  formationTemplate,
  onTemplateChange,
  viewMode = "team-sheet",
  periodNumber = 1,
  duration = 45,
  onPeriodChange,
  onDurationChange,
  onSquadSelectionChange,
  squadSelection = [],
  useDragAndDrop = true,
  onToggleDragAndDrop,
  periodId
}: TeamSelectionCardProps) => {
  const [localPeriod, setLocalPeriod] = useState(periodNumber);
  const [localDuration, setLocalDuration] = useState(duration);

  const periodDisplayName = getPeriodDisplayName(periodId, localPeriod);
  const squadPlayers = squadSelection.length > 0 ? squadSelection : Array.from(selectedPlayers);

  // Handle period change
  const handlePeriodChange = (period: number) => {
    setLocalPeriod(period);
    if (onPeriodChange) {
      onPeriodChange(period);
    }
  };

  // Handle duration change
  const handleDurationChange = (newDuration: number) => {
    setLocalDuration(newDuration);
    if (onDurationChange) {
      onDurationChange(newDuration);
    }
  };

  // Render substitution indicators for positions
  const renderSubstitutionIndicator = (position: string) => {
    return position.startsWith('sub-') ? (
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
        S
      </div>
    ) : null;
  };

  return (
    <Card key={team.id} className="mb-6">
      <TeamSelectionCardHeader
        teamName={team.name}
        periodDisplayName={periodDisplayName}
        viewMode={viewMode}
        performanceCategory={performanceCategory}
        onPerformanceCategoryChange={onPerformanceCategoryChange}
        useDragAndDrop={useDragAndDrop}
        onToggleDragAndDrop={onToggleDragAndDrop}
      />
      <CardContent>
        {useDragAndDrop ? (
          <DraggableFormation
            format={format}
            availablePlayers={players}
            squadPlayers={squadPlayers}
            onSelectionChange={onSelectionChange}
            performanceCategory={performanceCategory}
            onSquadPlayersChange={onSquadSelectionChange}
            formationTemplate={formationTemplate}
            onTemplateChange={onTemplateChange}
            renderSubstitutionIndicator={renderSubstitutionIndicator}
            periodNumber={localPeriod}
            periodDuration={localDuration}
            onPeriodChange={handlePeriodChange}
            onDurationChange={handleDurationChange}
            periodId={periodId}
          />
        ) : (
          <FormationSelector
            format={format}
            teamName={team.name}
            onSelectionChange={onSelectionChange}
            selectedPlayers={selectedPlayers}
            availablePlayers={players}
            performanceCategory={performanceCategory}
            formationTemplate={formationTemplate}
            onTemplateChange={onTemplateChange}
            viewMode={viewMode}
            periodNumber={localPeriod}
            duration={localDuration}
          />
        )}
      </CardContent>
    </Card>
  );
};
