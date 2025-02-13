
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { FormationSelector } from "@/components/FormationSelector";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
  const [view, setView] = useState<"team-sheet" | "formation">("team-sheet");

  useEffect(() => {
    if (initialSelections) {
      setLocalSelections(initialSelections);
    }
  }, [initialSelections]);

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
        <CardTitle className="flex items-center justify-between">
          <span>Period {periodNumber}</span>
          <div className="flex items-center gap-4">
            <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value as "team-sheet" | "formation")}>
              <ToggleGroupItem value="team-sheet" aria-label="Show team sheet">
                Team Sheet
              </ToggleGroupItem>
              <ToggleGroupItem value="formation" aria-label="Show formation">
                Formation
              </ToggleGroupItem>
            </ToggleGroup>
            <div className="w-32">
              <Label className="text-xs">Duration (mins)</Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value > 0) {
                    onDurationChange(value);
                  }
                }}
                min="1"
                className="h-8"
              />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
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
            viewMode={view}
            duration={duration}
            periodNumber={periodNumber}
          />
        </div>
      </CardContent>
    </Card>
  );
};
