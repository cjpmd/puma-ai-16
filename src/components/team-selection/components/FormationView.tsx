
import { FormationFormat } from "@/components/formation/types";
import { PerformanceCategory } from "@/types/player";
import { TeamsFormationList } from "./TeamsFormationList";

/**
 * FormationView props interface
 * This component handles the display of team formations in a list
 */
interface FormationViewProps {
  /** List of teams */
  teams: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  /** Formation format (5-a-side, 7-a-side, etc) */
  format: FormationFormat;
  /** Players with their attendance status */
  playersWithStatus: Array<{ 
    id: string; 
    name: string; 
    squad_number?: number;
    attendance_status?: string;
  }>;
  /** Currently selected players */
  selectedPlayers: Set<string>;
  /** Performance categories for each team */
  performanceCategories: Record<string, PerformanceCategory>;
  /** Formation templates for each team */
  teamFormationTemplates: Record<string, string>;
  /** Squad selections for each team */
  squadSelections: Record<string, string[]>;
  /** Periods for each team */
  periods: Record<string, Array<{
    id: number;
    name: string;
    duration: number;
  }>>;
  /** Handler for performance category changes */
  handlePerformanceCategoryChange: (teamId: string, value: PerformanceCategory) => void;
  /** Handler for team selection changes */
  handleTeamSelectionChange: (teamId: string, selections: Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>) => void;
  /** Handler for period-specific selection changes */
  handlePeriodSelectionChange: (teamId: string, periodId: number, selections: Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>) => void;
  /** Handler for formation template changes */
  handleTemplateChange: (teamId: string, template: string) => void;
  /** Handler for squad selection changes */
  handleSquadSelectionChange: (teamId: string, playerIds: string[]) => void;
  /** Handler for toggling drag and drop interface */
  toggleDragEnabled: (enabled: boolean) => void;
  /** Handler for period duration updates */
  handlePeriodDurationUpdate: (teamId: string, periodId: number, duration: number) => void;
  /** Whether drag and drop is forced enabled */
  forceDragEnabled: boolean;
}

/**
 * FormationView component
 * 
 * Displays a list of team formations for team selection
 * This is the main container for all team formation displays
 */
export const FormationView = ({
  teams,
  format,
  playersWithStatus,
  selectedPlayers,
  performanceCategories,
  teamFormationTemplates,
  squadSelections,
  periods,
  handlePerformanceCategoryChange,
  handleTeamSelectionChange,
  handlePeriodSelectionChange,
  handleTemplateChange,
  handleSquadSelectionChange,
  toggleDragEnabled,
  handlePeriodDurationUpdate,
  forceDragEnabled,
}: FormationViewProps) => {
  return (
    <TeamsFormationList
      teams={teams}
      format={format}
      playersWithStatus={playersWithStatus}
      selectedPlayers={selectedPlayers}
      performanceCategories={performanceCategories}
      teamFormationTemplates={teamFormationTemplates}
      squadSelections={squadSelections}
      periods={periods}
      handlePerformanceCategoryChange={handlePerformanceCategoryChange}
      handleTeamSelectionChange={handleTeamSelectionChange}
      handlePeriodSelectionChange={handlePeriodSelectionChange}
      handleTemplateChange={handleTemplateChange}
      handleSquadSelectionChange={handleSquadSelectionChange}
      toggleDragEnabled={toggleDragEnabled}
      handlePeriodDurationUpdate={handlePeriodDurationUpdate}
      forceDragEnabled={forceDragEnabled}
    />
  );
};
