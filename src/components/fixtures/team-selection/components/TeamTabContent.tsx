
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TeamHeaderControls } from "../../TeamHeaderControls";
import { SquadSelectionCard } from "./SquadSelectionCard";
import { TeamPreviewCard } from "./TeamPreviewCard";
import { PerformanceCategory } from "@/types/player";

interface TeamTabContentProps {
  teamId: string;
  team: { name: string; squadPlayers: string[] };
  fixture: any;
  teamCaptains: Record<string, string>;
  availablePlayers: any[];
  teamSelections: Record<string, Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory | string }>>;
  performanceCategories: Record<string, PerformanceCategory | string>;
  periods: { id: string; teamId: string; duration: number }[];
  handleCaptainChange: (teamId: string, playerId: string) => void;
  handlePerformanceCategoryChange: (teamId: string, periodId: string, category: PerformanceCategory) => void;
  handleSquadSelection: (teamId: string, playerIds: string[]) => void;
  handleAddPeriod: (teamId: string) => void;
  handleDeletePeriod: (teamId: string, periodId: string) => void;
  handleDurationChange: (teamId: string, periodId: string, duration: number) => void;
  handleFormationChange: (teamId: string, periodId: string, selections: Record<string, { playerId: string; position: string }>) => void;
  checkIsSubstitution: (teamId: string, periodIndex: number, position: string) => boolean;
  getPlayerTeams: (playerId: string) => string[];
}

export const TeamTabContent = ({
  teamId,
  team,
  fixture,
  teamCaptains,
  availablePlayers,
  teamSelections,
  performanceCategories,
  periods,
  handleCaptainChange,
  handlePerformanceCategoryChange,
  handleSquadSelection,
  handleAddPeriod,
  handleDeletePeriod,
  handleDurationChange,
  handleFormationChange,
  checkIsSubstitution,
  getPlayerTeams
}: TeamTabContentProps) => {
  return (
    <div className="space-y-6">
      <TeamHeaderControls
        teamId={teamId}
        teamCaptains={teamCaptains}
        availablePlayers={availablePlayers}
        onCaptainChange={(teamId, playerId) => handleCaptainChange(teamId, playerId)}
        performanceCategory={(performanceCategories[`${teamId}-${periods[0]?.id}`] || "MESSI") as PerformanceCategory}
        onPerformanceCategoryChange={(teamId, periodId, category) => handlePerformanceCategoryChange(teamId, periodId, category)}
        currentPeriodId={periods[0]?.id || ""}
        onAddPeriod={() => handleAddPeriod(teamId)}
      />
      
      <SquadSelectionCard 
        availablePlayers={availablePlayers}
        selectedPlayers={team.squadPlayers}
        onSelectionChange={(playerIds) => handleSquadSelection(teamId, playerIds)}
        getPlayerTeams={getPlayerTeams}
      />
      
      {periods.map((period, index) => (
        <TeamPreviewCard
          key={`${period.id}-${performanceCategories[`${teamId}-${period.id}`] || 'MESSI'}`}
          periodId={period.id}
          index={index}
          teamId={teamId}
          fixture={fixture}
          teamSelections={teamSelections}
          availablePlayers={availablePlayers}
          teamSquadPlayers={team.squadPlayers}
          performanceCategories={performanceCategories}
          onPerformanceCategoryChange={(value) => handlePerformanceCategoryChange(teamId, period.id, value)}
          onDurationChange={handleDurationChange}
          onDeletePeriod={handleDeletePeriod}
          handleFormationChange={handleFormationChange}
          checkIsSubstitution={checkIsSubstitution}
        />
      ))}
      
      <div className="flex justify-center">
        <Button onClick={() => handleAddPeriod(teamId)}>
          Add Period
        </Button>
      </div>
    </div>
  );
};
