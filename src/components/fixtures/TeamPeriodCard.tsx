
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { FormationSelector } from "@/components/FormationSelector";
import { useState, useEffect, useRef } from "react";
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
    {}
  );
  const [view, setView] = useState<"team-sheet" | "formation">("team-sheet");
  
  // Use refs to track changes
  const initialSelectionsRef = useRef<typeof initialSelections>({});
  const hasInitializedRef = useRef(false);

  // This useEffect is crucial for initializing and updating selections
  useEffect(() => {
    // Only process initialSelections if they exist and are not empty
    if (initialSelections && Object.keys(initialSelections).length > 0) {
      // Create strings for comparison
      const currentString = JSON.stringify(initialSelectionsRef.current);
      const newString = JSON.stringify(initialSelections);
      
      // Only update if the selections have actually changed
      if (currentString !== newString) {
        console.log(`TeamPeriodCard (${periodId}): Setting initialSelections`, JSON.stringify(initialSelections));
        
        // Deep clone to avoid reference issues
        const clonedSelections = JSON.parse(JSON.stringify(initialSelections));
        
        // Update the ref and local state
        initialSelectionsRef.current = clonedSelections;
        setLocalSelections(clonedSelections);
        hasInitializedRef.current = true;
      }
    }
  }, [initialSelections, periodId]);

  const handleSelectionChange = (selections: Record<string, { playerId: string; position: string; performanceCategory?: string }>) => {
    console.log(`TeamPeriodCard (${periodId}): Selections changed`, JSON.stringify(selections));
    
    // Create a deep clone of the selections to prevent reference issues
    const updatedSelections = JSON.parse(JSON.stringify(selections));
    
    // Apply performance category to all selections
    Object.keys(updatedSelections).forEach(key => {
      updatedSelections[key].performanceCategory = performanceCategory;
    });
    
    // Update local state
    setLocalSelections(updatedSelections);
    
    // Notify parent
    onSelectionChange(periodId, teamId, updatedSelections);
  };

  // Generate a unique key for the FormationSelector to force re-renders when needed
  const formationKey = `formation-${periodId}-${teamId}-${performanceCategory}-${Object.keys(localSelections).length}-${view}`;

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
            key={formationKey}
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
