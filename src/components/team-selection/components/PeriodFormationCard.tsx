
import { TeamSelectionCard } from "../TeamSelectionCard";
import { FormationFormat } from "@/components/formation/types";
import { PerformanceCategory } from "@/types/player";

interface PeriodFormationCardProps {
  team: {
    id: string;
    name: string;
    category: string;
  };
  period: {
    id: number;
    name: string;
    duration: number;
  };
  format: FormationFormat;
  players: any[];
  selectedPlayers: Set<string>;
  performanceCategory: PerformanceCategory;
  onPerformanceCategoryChange: (value: PerformanceCategory) => void;
  onSelectionChange: (selections: any) => void;
  onPeriodSelectionChange: (selections: any) => void;
  formationTemplate: string;
  onTemplateChange: (template: string) => void;
  squadSelection: string[];
  onSquadSelectionChange: (playerIds: string[]) => void;
  useDragAndDrop: boolean;
  onToggleDragAndDrop: (enabled: boolean) => void;
  onDurationChange: (duration: number) => void;
}

export const PeriodFormationCard = ({
  team,
  period,
  format,
  players,
  selectedPlayers,
  performanceCategory,
  onPerformanceCategoryChange,
  onSelectionChange,
  onPeriodSelectionChange,
  formationTemplate,
  onTemplateChange,
  squadSelection,
  onSquadSelectionChange,
  useDragAndDrop,
  onToggleDragAndDrop,
  onDurationChange
}: PeriodFormationCardProps) => {
  const handleSelectionChange = (selections: any) => {
    // Store selections for this specific period
    onPeriodSelectionChange(selections);
    // Also update the main team selections
    onSelectionChange(selections);
  };

  const handleDurationChange = (duration: number) => {
    if (onDurationChange) {
      onDurationChange(duration);
    }
  };

  return (
    <TeamSelectionCard
      key={`${team.id}-${period.id}`}
      team={team}
      format={format}
      players={players}
      selectedPlayers={selectedPlayers}
      performanceCategory={performanceCategory}
      onPerformanceCategoryChange={onPerformanceCategoryChange}
      onSelectionChange={handleSelectionChange}
      formationTemplate={formationTemplate}
      onTemplateChange={onTemplateChange}
      viewMode="formation"
      periodNumber={Math.floor(period.id / 100)}
      duration={period.duration}
      onDurationChange={handleDurationChange}
      squadSelection={squadSelection}
      onSquadSelectionChange={onSquadSelectionChange}
      useDragAndDrop={useDragAndDrop}
      onToggleDragAndDrop={onToggleDragAndDrop}
      periodId={period.id}
    />
  );
};
