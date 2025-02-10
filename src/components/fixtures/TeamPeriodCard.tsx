
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { FormationSelector } from "@/components/FormationSelector";
import { TeamSettingsHeader } from "@/components/formation/TeamSettingsHeader";

interface TeamPeriodCardProps {
  periodId: string;
  periodNumber: number;
  teamId: string;
  format: string;
  teamName: string;
  onSelectionChange: (periodId: string, teamId: string, selections: Record<string, { playerId: string; position: string; performanceCategory?: string }>) => void;
  selectedPlayers: Set<string>;
  availablePlayers: any[];
  initialSelections?: Record<string, { playerId: string; position: string; performanceCategory?: string }>;
  performanceCategory?: string;
  onDeletePeriod: (teamId: string, periodId: string) => void;
  duration: number;
  onDurationChange: (duration: number) => void;
}

export const TeamPeriodCard = ({
  periodId,
  periodNumber,
  teamId,
  format,
  teamName,
  onSelectionChange,
  selectedPlayers,
  availablePlayers,
  initialSelections,
  performanceCategory,
  onDeletePeriod,
  duration,
  onDurationChange
}: TeamPeriodCardProps) => {
  return (
    <Card className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3"
        onClick={() => onDeletePeriod(teamId, periodId)}
      >
        <X className="h-4 w-4" />
      </Button>
      <CardHeader className="pb-4">
        <CardTitle>Period {periodNumber}</CardTitle>
      </CardHeader>
      <CardContent>
        <TeamSettingsHeader
          duration={duration.toString()}
          onDurationChange={(value) => onDurationChange(parseInt(value))}
        />
        <div className="min-h-[500px]">
          <FormationSelector
            format={format as "7-a-side"}
            teamName={teamName}
            onSelectionChange={(teamSelections) => 
              onSelectionChange(periodId, teamId, teamSelections)
            }
            selectedPlayers={selectedPlayers}
            availablePlayers={availablePlayers}
            initialSelections={initialSelections}
            performanceCategory={performanceCategory}
          />
        </div>
      </CardContent>
    </Card>
  );
};
