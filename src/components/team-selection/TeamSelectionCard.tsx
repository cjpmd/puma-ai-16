
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormationFormat } from "@/components/formation/types";
import { PerformanceCategory } from "@/types/player";
import { TeamSelectionCardHeader } from "./components/TeamSelectionCardHeader";
import { DraggableFormation } from "../formation/draggable/DraggableFormation";

export interface TeamSelectionCardProps {
  team: {
    id: string;
    name: string;
    category: string;
  };
  format: FormationFormat;
  players: Array<{ id: string; name: string; squad_number?: number }>;
  selectedPlayers: Set<string>;
  performanceCategory: PerformanceCategory;
  onPerformanceCategoryChange: (value: PerformanceCategory) => void;
  onSelectionChange: (selections: Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>) => void;
  formationTemplate: string;
  onTemplateChange: (template: string) => void;
  viewMode?: "team-sheet" | "formation";
  periodNumber?: number;
  duration?: number;
  onDurationChange?: (duration: number) => void;
  squadSelection?: string[];
  onSquadSelectionChange?: (playerIds: string[]) => void;
  useDragAndDrop?: boolean;
  onToggleDragAndDrop?: (enabled: boolean) => void;
  initialSelections?: Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>;
  periodId?: number;
  captain?: string;
  captainSelectionMode?: boolean;
  onToggleCaptainSelection?: () => void;
  onSetCaptain?: (playerId: string) => void;
  isPlayerCaptain?: (playerId: string) => boolean;
  getOtherTeamIndicator?: (playerId: string) => React.ReactNode;
}

export const TeamSelectionCard: React.FC<TeamSelectionCardProps> = ({
  team,
  format,
  players,
  selectedPlayers,
  performanceCategory,
  onPerformanceCategoryChange,
  onSelectionChange,
  formationTemplate,
  onTemplateChange,
  viewMode = "formation",
  periodNumber,
  duration,
  onDurationChange,
  squadSelection = [],
  onSquadSelectionChange,
  useDragAndDrop = true,
  onToggleDragAndDrop,
  initialSelections,
  periodId,
  captain,
  captainSelectionMode,
  onToggleCaptainSelection,
  onSetCaptain,
  isPlayerCaptain,
  getOtherTeamIndicator
}) => {
  // Provide default renderSubstitutionIndicator
  const renderSubstitutionIndicator = (position: string) => {
    return position.startsWith('sub-') ? (
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
        S
      </div>
    ) : null;
  };

  // Handle player captain status check
  const checkPlayerIsCaptain = (playerId: string) => {
    if (isPlayerCaptain) {
      return isPlayerCaptain(playerId);
    }
    return captain === playerId;
  };

  // Handle other team indicator
  const renderOtherTeamIndicator = (playerId: string) => {
    if (getOtherTeamIndicator) {
      return getOtherTeamIndicator(playerId);
    }
    return null;
  };

  // Handle captain selection
  const handlePlayerSelect = (playerId: string) => {
    if (captainSelectionMode && onSetCaptain) {
      onSetCaptain(playerId);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <TeamSelectionCardHeader
          team={team}
          performanceCategory={performanceCategory}
          onPerformanceCategoryChange={onPerformanceCategoryChange}
          useDragAndDrop={useDragAndDrop}
          onToggleDragAndDrop={onToggleDragAndDrop}
          captainSelectionMode={captainSelectionMode}
          onToggleCaptainSelection={onToggleCaptainSelection}
          hasCaptain={!!captain}
        />
      </CardHeader>
      <CardContent>
        <DraggableFormation
          format={format}
          availablePlayers={players}
          squadPlayers={squadSelection}
          onSelectionChange={onSelectionChange}
          performanceCategory={performanceCategory}
          formationTemplate={formationTemplate}
          onTemplateChange={onTemplateChange}
          onSquadPlayersChange={onSquadSelectionChange}
          renderSubstitutionIndicator={renderSubstitutionIndicator}
          periodNumber={periodNumber}
          periodDuration={duration}
          onDurationChange={onDurationChange}
          initialSelections={initialSelections}
          periodId={periodId}
          // Force to start in squad mode for new formations with no selections
          forceSquadMode={!initialSelections || Object.keys(initialSelections).length === 0}
        />
      </CardContent>
    </Card>
  );
};
