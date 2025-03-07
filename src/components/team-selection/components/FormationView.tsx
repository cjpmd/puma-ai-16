
import { FormationFormat } from "@/components/formation/types";
import { PerformanceCategory } from "@/types/player";
import { TeamsFormationList } from "./TeamsFormationList";

interface FormationViewProps {
  teams: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  format: FormationFormat;
  playersWithStatus: any[];
  selectedPlayers: Set<string>;
  performanceCategories: Record<string, PerformanceCategory>;
  teamFormationTemplates: Record<string, string>;
  squadSelections: Record<string, string[]>;
  periods: Record<string, any[]>;
  handlePerformanceCategoryChange: (teamId: string, value: PerformanceCategory) => void;
  handleTeamSelectionChange: (teamId: string, selections: any) => void;
  handlePeriodSelectionChange: (teamId: string, periodId: number, selections: any) => void;
  handleTemplateChange: (teamId: string, template: string) => void;
  handleSquadSelectionChange: (teamId: string, playerIds: string[]) => void;
  toggleDragEnabled: (enabled: boolean) => void;
  handlePeriodDurationUpdate: (teamId: string, periodId: number, duration: number) => void;
  forceDragEnabled: boolean;
}

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
