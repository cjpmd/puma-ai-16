
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TeamHeaderControls } from "../../TeamHeaderControls";
import TeamPeriodCard from "../../TeamPeriodCard";
import { TeamSelections, AllSelections, PeriodsPerTeam, PerformanceCategories, TeamCaptains } from "../types";
import { PlayerSelection } from "@/components/formation/types";
import { PerformanceCategory } from "@/types/player";

interface TeamPeriodsListProps {
  fixture: any;
  activeTeam: string;
  setActiveTeam: (teamId: string) => void;
  periodsPerTeam: PeriodsPerTeam;
  selections: AllSelections;
  performanceCategories: PerformanceCategories;
  teamCaptains: TeamCaptains;
  selectedPlayers: Set<string>;
  availablePlayers: any[];
  onCaptainChange: (teamId: string, playerId: string) => void;
  onAddPeriod: (teamId: string) => void;
  onDeletePeriod: (teamId: string, periodId: string) => void;
  onTeamSelectionChange: (periodId: string, teamId: string, selections: TeamSelections) => void;
  onDurationChange: (teamId: string, periodId: string, duration: number) => void;
  onPerformanceCategoryChange: (key: string, value: PerformanceCategory) => void;
}

export const TeamPeriodsList = ({
  fixture,
  activeTeam,
  setActiveTeam,
  periodsPerTeam,
  selections,
  performanceCategories,
  teamCaptains,
  selectedPlayers,
  availablePlayers,
  onCaptainChange,
  onAddPeriod,
  onDeletePeriod,
  onTeamSelectionChange,
  onDurationChange,
  onPerformanceCategoryChange,
}: TeamPeriodsListProps) => {
  return (
    <Tabs defaultValue={activeTeam} className="w-full" onValueChange={setActiveTeam}>
      <TabsList className="w-full mb-4">
        {Array.from({ length: fixture.number_of_teams || 1 }).map((_, index) => (
          <TabsTrigger 
            key={index} 
            value={(index + 1).toString()}
            className="flex-1"
          >
            Team {index + 1}
          </TabsTrigger>
        ))}
      </TabsList>

      {Array.from({ length: fixture.number_of_teams || 1 }).map((_, teamIndex) => {
        const teamId = (teamIndex + 1).toString();
        const teamPeriods = periodsPerTeam[teamId] || [];

        return (
          <TabsContent 
            key={teamIndex} 
            value={teamId}
            className="mt-0"
          >
            <TeamHeaderControls
              teamId={teamId}
              teamCaptains={teamCaptains}
              availablePlayers={availablePlayers}
              onCaptainChange={onCaptainChange}
              performanceCategory={performanceCategories[`period-1-${teamId}`] as PerformanceCategory || "MESSI"}
              onPerformanceCategoryChange={(teamId, periodId, value) => {
                const updatedCategories = { ...performanceCategories };
                teamPeriods.forEach(period => {
                  updatedCategories[`${period.id}-${teamId}`] = value as PerformanceCategory;
                });
                onPerformanceCategoryChange("batch", value as PerformanceCategory);
              }}
              onAddPeriod={() => onAddPeriod(teamId)}
              currentPeriodId={"period-1"}
            />

            <div className="flex flex-col space-y-6">
              {teamPeriods.map((period, index) => (
                <TeamPeriodCard
                  key={`${period.id}-${teamId}-${performanceCategories[`${period.id}-${teamId}`] || 'MESSI'}`}
                  teamId={teamId}
                  teamName={fixture.team_name}
                  periodNumber={index + 1}
                  duration={period.duration}
                  format={fixture.format}
                  availablePlayers={availablePlayers}
                  selectedPlayers={selectedPlayers}
                  performanceCategory={performanceCategories[`${period.id}-${teamId}`] as PerformanceCategory || "MESSI"}
                  onPerformanceCategoryChange={(value) => 
                    onPerformanceCategoryChange(`${period.id}-${teamId}`, value as PerformanceCategory)
                  }
                  onSelectionChange={(periodNumber, selections) => 
                    onTeamSelectionChange(period.id, teamId, selections as unknown as TeamSelections)
                  }
                  initialSelections={selections[period.id]?.[teamId]}
                  formationTemplate={"All"}
                  onTemplateChange={() => {}}
                />
              ))}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
};
