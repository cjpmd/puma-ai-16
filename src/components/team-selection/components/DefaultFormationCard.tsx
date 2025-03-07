
import { TeamSelectionCard } from "../TeamSelectionCard";
import { FormationFormat } from "@/components/formation/types";
import { PerformanceCategory } from "@/types/player";

/**
 * DefaultFormationCard props interface
 * This component handles the display and functionality of a team's default formation
 */
interface DefaultFormationCardProps {
  /** Team information */
  team: {
    id: string;
    name: string;
    category: string;
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
  /** Handler for player selection changes */
  onSelectionChange: (selections: Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>) => void;
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
  /** Current team captain's ID (if any) */
  captain?: string;
  /** Whether captain selection mode is active */
  captainSelectionMode?: boolean;
  /** Handler for toggling captain selection mode */
  onToggleCaptainSelection?: () => void;
  /** Handler for setting a player as captain */
  onSetCaptain?: (playerId: string) => void;
}

/**
 * DefaultFormationCard component
 * 
 * Displays the default formation for a team, allowing players to be assigned to positions
 * This is used for the primary formation view (not period-specific)
 */
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
  onToggleDragAndDrop,
  captain,
  captainSelectionMode,
  onToggleCaptainSelection,
  onSetCaptain
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
      captain={captain}
      captainSelectionMode={captainSelectionMode}
      onToggleCaptainSelection={onToggleCaptainSelection}
      onSetCaptain={onSetCaptain}
    />
  );
};
