
import { FormationFormat } from "@/components/formation/types";
import { PerformanceCategory } from "@/types/player";
import { DefaultFormationCard } from "./DefaultFormationCard";
import { PeriodFormationCard } from "./PeriodFormationCard";

interface TeamsFormationListProps {
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
  teamCaptains: Record<string, string>;
  captainSelectionMode?: Record<string, boolean>;
  handlePerformanceCategoryChange: (teamId: string, value: PerformanceCategory) => void;
  handleTeamSelectionChange: (teamId: string, selections: any) => void;
  handlePeriodSelectionChange: (teamId: string, periodId: number, selections: any) => void;
  handleTemplateChange: (teamId: string, template: string) => void;
  handleSquadSelectionChange: (teamId: string, playerIds: string[]) => void;
  toggleDragEnabled: (enabled: boolean) => void;
  handlePeriodDurationUpdate: (teamId: string, periodId: number, duration: number) => void;
  toggleCaptainSelectionMode?: (teamId: string) => void;
  handleSetCaptain?: (teamId: string, playerId: string) => void;
  forceDragEnabled: boolean;
}

export const TeamsFormationList = ({
  teams,
  format,
  playersWithStatus,
  selectedPlayers,
  performanceCategories,
  teamFormationTemplates,
  squadSelections,
  periods,
  teamCaptains,
  captainSelectionMode,
  handlePerformanceCategoryChange,
  handleTeamSelectionChange,
  handlePeriodSelectionChange,
  handleTemplateChange,
  handleSquadSelectionChange,
  toggleDragEnabled,
  handlePeriodDurationUpdate,
  toggleCaptainSelectionMode,
  handleSetCaptain,
  forceDragEnabled,
}: TeamsFormationListProps) => {
  return (
    <>
      {teams.map(team => {
        const teamPeriods = periods[team.id] || [];
        
        // Show default first half if no periods
        if (teamPeriods.length === 0) {
          return (
            <DefaultFormationCard
              key={`${team.id}-default`}
              team={team}
              format={format}
              players={playersWithStatus}
              selectedPlayers={selectedPlayers}
              performanceCategory={performanceCategories[team.id] || "MESSI"}
              onPerformanceCategoryChange={(value) => handlePerformanceCategoryChange(team.id, value)}
              onSelectionChange={(selections) => handleTeamSelectionChange(team.id, selections)}
              formationTemplate={teamFormationTemplates[team.id] || "All"}
              onTemplateChange={(template) => handleTemplateChange(team.id, template)}
              squadSelection={squadSelections[team.id]}
              onSquadSelectionChange={(playerIds) => handleSquadSelectionChange(team.id, playerIds)}
              useDragAndDrop={forceDragEnabled}
              onToggleDragAndDrop={toggleDragEnabled}
              captainSelectionMode={captainSelectionMode?.[team.id]}
              onToggleCaptainSelection={() => toggleCaptainSelectionMode?.(team.id)}
              onSetCaptain={(playerId) => handleSetCaptain?.(team.id, playerId)}
              captain={teamCaptains[team.id]}
            />
          );
        }
        
        // Otherwise, show a card for each period
        return teamPeriods.map(period => (
          <PeriodFormationCard
            key={`${team.id}-${period.id}`}
            team={team}
            period={period}
            format={format}
            players={playersWithStatus}
            selectedPlayers={selectedPlayers}
            performanceCategory={performanceCategories[team.id] || "MESSI"}
            onPerformanceCategoryChange={(value) => handlePerformanceCategoryChange(team.id, value)}
            onSelectionChange={(selections) => handleTeamSelectionChange(team.id, selections)}
            onPeriodSelectionChange={(selections) => handlePeriodSelectionChange(team.id, period.id, selections)}
            formationTemplate={teamFormationTemplates[team.id] || "All"}
            onTemplateChange={(template) => handleTemplateChange(team.id, template)}
            squadSelection={squadSelections[team.id]}
            onSquadSelectionChange={(playerIds) => handleSquadSelectionChange(team.id, playerIds)}
            useDragAndDrop={forceDragEnabled}
            onToggleDragAndDrop={toggleDragEnabled}
            onDurationChange={(duration) => handlePeriodDurationUpdate(team.id, period.id, duration)}
            captainSelectionMode={captainSelectionMode?.[team.id]}
            onToggleCaptainSelection={() => toggleCaptainSelectionMode?.(team.id)}
            onSetCaptain={(playerId) => handleSetCaptain?.(team.id, playerId)}
            captain={teamCaptains[team.id]}
          />
        ));
      })}
    </>
  );
};
