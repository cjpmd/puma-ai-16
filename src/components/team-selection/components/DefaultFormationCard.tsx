
import { TeamSelectionCard } from "../TeamSelectionCard";
import { FormationFormat } from "@/components/formation/types";
import { PerformanceCategory } from "@/types/player";

interface DefaultFormationCardProps {
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
  onSelectionChange: (selections: any) => void;
  formationTemplate: string;
  onTemplateChange: (template: string) => void;
  squadSelection: string[];
  onSquadSelectionChange: (playerIds: string[]) => void;
  useDragAndDrop: boolean;
  onToggleDragAndDrop: (enabled: boolean) => void;
}

export const DefaultFormationCard = ({
  team,
  format,
  players,
  selectedPlayers,
  performanceCategory,
  onPerformanceCategoryChange,
  onSelectionChange,
  formationTemplate,
  onTemplateChange,
  squadSelection,
  onSquadSelectionChange,
  useDragAndDrop,
  onToggleDragAndDrop
}: DefaultFormationCardProps) => {
  return (
    <TeamSelectionCard
      key={`${team.id}-default`}
      team={team}
      format={format}
      players={players}
      selectedPlayers={selectedPlayers}
      performanceCategory={performanceCategory}
      onPerformanceCategoryChange={onPerformanceCategoryChange}
      onSelectionChange={onSelectionChange}
      formationTemplate={formationTemplate}
      onTemplateChange={onTemplateChange}
      viewMode="formation"
      squadSelection={squadSelection}
      onSquadSelectionChange={onSquadSelectionChange}
      useDragAndDrop={useDragAndDrop}
      onToggleDragAndDrop={onToggleDragAndDrop}
    />
  );
};
