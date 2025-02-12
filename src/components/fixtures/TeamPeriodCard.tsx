
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { FormationSelector } from "@/components/FormationSelector";
import { TeamSettingsHeader } from "@/components/formation/TeamSettingsHeader";
import { useState, useEffect } from "react";

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
  performanceCategory = 'MESSI',
  onDeletePeriod,
  duration,
  onDurationChange
}: TeamPeriodCardProps) => {
  const [localSelections, setLocalSelections] = useState<Record<string, { playerId: string; position: string; performanceCategory?: string }>>(
    initialSelections || {}
  );
  const [localDuration, setLocalDuration] = useState(duration);

  useEffect(() => {
    if (initialSelections) {
      setLocalSelections(initialSelections);
    }
  }, [initialSelections]);

  useEffect(() => {
    setLocalDuration(duration);
  }, [duration]);

  const handleDurationChange = (newDuration: string) => {
    const parsedDuration = parseInt(newDuration);
    setLocalDuration(parsedDuration);
    onDurationChange(parsedDuration);
  };

  const handleSelectionChange = (selections: Record<string, { playerId: string; position: string; performanceCategory?: string }>) => {
    const updatedSelections = Object.entries(selections).reduce((acc, [position, selection]) => {
      if (selection.playerId === "unassigned") {
        const { [position]: removed, ...rest } = acc;
        return rest;
      }
      
      acc[position] = {
        ...selection,
        performanceCategory
      };
      
      return acc;
    }, { ...localSelections });
    
    setLocalSelections(updatedSelections);
    onSelectionChange(periodId, teamId, updatedSelections);
  };

  const formatSelectionsForFormation = () => {
    return Object.entries(localSelections).map(([_, value]) => ({
      position: value.position,
      playerId: value.playerId
    }));
  };

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
          duration={localDuration.toString()}
          onDurationChange={handleDurationChange}
        />
        <div className="min-h-[500px]">
          <FormationSelector
            key={`${periodId}-${teamId}-${JSON.stringify(localSelections)}`}
            format={format as "7-a-side"}
            teamName={teamName}
            onSelectionChange={handleSelectionChange}
            selectedPlayers={selectedPlayers}
            availablePlayers={availablePlayers}
            initialSelections={localSelections}
            performanceCategory={performanceCategory}
          />
        </div>
      </CardContent>
    </Card>
  );
};
