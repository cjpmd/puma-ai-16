
import { TeamSelectionCard } from "../TeamSelectionCard";
import { FormationFormat } from "@/components/formation/types";
import { PerformanceCategory } from "@/types/player";

/**
 * PeriodFormationCard props interface
 * This component handles the display and functionality of a team's formation for a specific period
 */
interface PeriodFormationCardProps {
  /** Team information */
  team: {
    id: string;
    name: string;
    category: string;
  };
  /** Period information */
  period: {
    id: number;
    name: string;
    duration: number;
  };
  /** Formation format (5-a-side, 7-a-side, etc) */
  format: FormationFormat;
  /** Available players for selection */
  players: Array<{ id: string; name: string; squad_number?: number }>;
  /** Currently selected players */
  selectedPlayers: Set<string>;
  /** Current performance category setting */
  performanceCategory: PerformanceCategory;
  /** Handler for performance category changes */
  onPerformanceCategoryChange: (value: PerformanceCategory) => void;
  /** Handler for team-level selection changes */
  onSelectionChange: (selections: Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>) => void;
  /** Handler for period-specific selection changes */
  onPeriodSelectionChange: (selections: Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>) => void;
  /** Current formation template */
  formationTemplate: string;
  /** Handler for formation template changes */
  onTemplateChange: (template: string) => void;
  /** Selected squad players for this team */
  squadSelection: string[];
  /** Handler for squad selection changes */
  onSquadSelectionChange: (playerIds: string[]) => void;
  /** Whether to use drag and drop interface */
  useDragAndDrop: boolean;
  /** Handler for toggling drag and drop interface */
  onToggleDragAndDrop: (enabled: boolean) => void;
  /** Handler for changing period duration */
  onDurationChange: (duration: number) => void;
}

/**
 * PeriodFormationCard component
 * 
 * Displays the formation for a specific period of a match, allowing players 
 * to be assigned to positions for that period
 */
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
  
  /**
   * Handles selection changes for this specific period
   * Updates both period-specific and team-level selections
   */
  const handleSelectionChange = (selections: Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>) => {
    // Store selections for this specific period
    onPeriodSelectionChange(selections);
    // Also update the main team selections
    onSelectionChange(selections);
  };

  /**
   * Handles duration changes for this period
   */
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
