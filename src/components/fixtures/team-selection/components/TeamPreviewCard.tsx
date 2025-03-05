
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormationSelector } from "@/components/FormationSelector";
import { PlayerSelection } from "@/components/formation/types";

interface TeamPreviewCardProps {
  format: string;
  teamName: string;
  players: any[];
  selections: Record<string, Record<string, PlayerSelection>>;
  onFormationChange: (
    halfId: string,
    periodId: string,
    selections: Record<string, PlayerSelection>
  ) => void;
  periodId: string;
  halfId: string;
  performanceCategory: string;
}

const TeamPreviewCard: React.FC<TeamPreviewCardProps> = ({
  format,
  teamName,
  players,
  selections,
  onFormationChange,
  periodId,
  halfId,
  performanceCategory,
}) => {
  // Convert any format string to a valid FormationFormat
  const validFormat = ["5-a-side", "7-a-side", "9-a-side", "11-a-side"].includes(format)
    ? format
    : "7-a-side";
  
  // Create a set of already selected player IDs
  const selectedPlayers = new Set<string>();
  
  // Only include players that are selected in THIS period
  const currentSelections = selections[halfId]?.[periodId] || {};
  
  // Go through all players in all periods to build the selectedPlayers set
  Object.entries(selections).forEach(([half, halfData]) => {
    Object.entries(halfData).forEach(([period, periodSelections]) => {
      Object.values(periodSelections).forEach((selection) => {
        if (selection.playerId !== "unassigned") {
          selectedPlayers.add(selection.playerId);
        }
      });
    });
  });
  
  // Adapter function to bridge the gap between FormationSelector and our component
  const handleSelectionChange = (updatedSelections: Record<string, PlayerSelection>) => {
    onFormationChange(halfId, periodId, updatedSelections);
  };
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Formation Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <FormationSelector
          format={validFormat as any}
          teamName={teamName}
          onSelectionChange={handleSelectionChange}
          selectedPlayers={selectedPlayers}
          availablePlayers={players}
          initialSelections={currentSelections}
          performanceCategory={performanceCategory}
          viewMode="formation"
        />
      </CardContent>
    </Card>
  );
};

export default TeamPreviewCard;
