import { TeamSelectionCard } from "../TeamSelectionCard";
import { FormationFormat } from "@/components/formation/types";
import { PerformanceCategory } from "@/types/player";

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
    <>
      {teams.map(team => {
        const teamPeriods = periods[team.id] || [];
        
        // Show default first half if no periods
        if (teamPeriods.length === 0) {
          return (
            <TeamSelectionCard
              key={`${team.id}-default`}
              team={team}
              format={format}
              players={playersWithStatus}
              selectedPlayers={selectedPlayers}
              performanceCategory={performanceCategories[team.id] || "MESSI" as PerformanceCategory}
              onPerformanceCategoryChange={(value) => handlePerformanceCategoryChange(team.id, value)}
              onSelectionChange={(selections) => handleTeamSelectionChange(team.id, selections)}
              formationTemplate={teamFormationTemplates[team.id] || "All"}
              onTemplateChange={(template) => handleTemplateChange(team.id, template)}
              viewMode="formation"
              squadSelection={squadSelections[team.id]}
              onSquadSelectionChange={(playerIds) => handleSquadSelectionChange(team.id, playerIds)}
              useDragAndDrop={forceDragEnabled}
              onToggleDragAndDrop={toggleDragEnabled}
            />
          );
        }
        
        // Otherwise, show a card for each period
        return teamPeriods.map(period => (
          <TeamSelectionCard
            key={`${team.id}-${period.id}`}
            team={team}
            format={format}
            players={playersWithStatus}
            selectedPlayers={selectedPlayers}
            performanceCategory={performanceCategories[team.id] || "MESSI" as PerformanceCategory}
            onPerformanceCategoryChange={(value) => handlePerformanceCategoryChange(team.id, value)}
            onSelectionChange={(selections) => {
              // Store selections for this specific period
              handlePeriodSelectionChange(team.id, period.id, selections);
              // Also update the main team selections
              handleTeamSelectionChange(team.id, selections);
            }}
            formationTemplate={teamFormationTemplates[team.id] || "All"}
            onTemplateChange={(template) => handleTemplateChange(team.id, template)}
            viewMode="formation"
            periodNumber={Math.floor(period.id / 100)}
            duration={period.duration}
            onDurationChange={(duration) => handlePeriodDurationUpdate(team.id, period.id, duration)}
            squadSelection={squadSelections[team.id]}
            onSquadSelectionChange={(playerIds) => handleSquadSelectionChange(team.id, playerIds)}
            useDragAndDrop={forceDragEnabled}
            onToggleDragAndDrop={toggleDragEnabled}
            periodId={period.id}
          />
        ));
      })}
    </>
  );
};
