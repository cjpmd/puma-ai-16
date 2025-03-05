
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormationSelector } from "@/components/FormationSelector";
import { PlayerSelection } from "@/components/formation/types";

interface TeamPreviewCardProps {
  format?: string;
  teamId: string;
  fixture: any;
  periodId: string;
  index: number;
  availablePlayers: any[];
  teamSquadPlayers: string[];
  teamSelections: Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>;
  performanceCategories: Record<string, string>;
  onPerformanceCategoryChange: (teamId: string, periodId: string, category: string) => void;
  onDurationChange: (teamId: string, periodId: string, duration: number) => void;
  onDeletePeriod: (teamId: string, periodId: string) => void;
  handleFormationChange: (teamId: string, periodId: string, selections: Record<string, { playerId: string; position: string }>) => void;
  checkIsSubstitution: (teamId: string, periodIndex: number, position: string) => boolean;
}

const TeamPreviewCard: React.FC<TeamPreviewCardProps> = ({
  format = "7-a-side",
  teamId,
  fixture,
  periodId,
  index,
  availablePlayers,
  teamSquadPlayers,
  teamSelections,
  performanceCategories,
  onPerformanceCategoryChange,
  onDurationChange,
  onDeletePeriod,
  handleFormationChange,
  checkIsSubstitution
}) => {
  // Convert any format string to a valid FormationFormat
  const validFormat = ["5-a-side", "7-a-side", "9-a-side", "11-a-side"].includes(format)
    ? format
    : "7-a-side";
  
  // Create a set of already selected player IDs
  const selectedPlayers = new Set<string>();
  
  // Filter availablePlayers to only include those in the team's squad
  const squadPlayers = availablePlayers.filter(player => 
    teamSquadPlayers.includes(player.id)
  );
  
  // Get the current period's performance category
  const performanceCategory = performanceCategories[`${teamId}-${periodId}`] || "MESSI";
  
  // Only include players that are selected in THIS period
  const currentSelections = teamSelections[teamId]?.[periodId] || {};
  
  // Adapter function to bridge the gap between FormationSelector and our component
  const handleSelectionChange = (updatedSelections: Record<string, { playerId: string; position: string }>) => {
    handleFormationChange(teamId, periodId, updatedSelections);
  };
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Period {index + 1} Formation Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <FormationSelector
          format={validFormat as any}
          teamName={fixture.opponent || "Team"}
          onSelectionChange={handleSelectionChange}
          selectedPlayers={selectedPlayers}
          availablePlayers={squadPlayers}
          initialSelections={currentSelections}
          performanceCategory={performanceCategory}
          viewMode="formation"
        />
      </CardContent>
    </Card>
  );
};

export default TeamPreviewCard;
