
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DraggableFormation } from "@/components/formation/DraggableFormation";
import { ArrowRight, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Period {
  id: string;
  duration: number;
  selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>;
}

interface HalfPeriodManagerProps {
  title: string;
  teamId: string;
  fixture: any;
  availablePlayers: any[];
  squadPlayers: string[];
  onFormationChange: (halfId: string, periodId: string, selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>) => void;
  performanceCategory: string;
  onPerformanceCategoryChange: (value: string) => void;
}

export const HalfPeriodManager = ({
  title,
  teamId,
  fixture,
  availablePlayers,
  squadPlayers,
  onFormationChange,
  performanceCategory,
  onPerformanceCategoryChange
}: HalfPeriodManagerProps) => {
  const [periods, setPeriods] = useState<Period[]>([
    { id: '1', duration: 20, selections: {} }
  ]);

  // Filter players to only show squad players
  const filteredPlayers = availablePlayers.filter(p => squadPlayers.includes(p.id));
  
  // Add a new period
  const handleAddPeriod = () => {
    const lastPeriod = periods[periods.length - 1];
    const newPeriod: Period = {
      id: (periods.length + 1).toString(),
      duration: lastPeriod.duration,
      selections: { ...lastPeriod.selections } // Copy selections from previous period
    };
    
    setPeriods([...periods, newPeriod]);
  };
  
  // Update duration for a period
  const handleDurationChange = (periodId: string, duration: number) => {
    setPeriods(periods.map(period => 
      period.id === periodId ? { ...period, duration } : period
    ));
  };
  
  // Handle formation change for a period
  const handleFormationChange = (periodId: string, selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>) => {
    // Mark substitutions compared to previous period
    const periodIndex = periods.findIndex(p => p.id === periodId);
    let updatedSelections = { ...selections };
    
    if (periodIndex > 0) {
      const prevPeriod = periods[periodIndex - 1];
      
      // Check each position for substitutions
      Object.entries(selections).forEach(([slotId, selection]) => {
        const prevSelection = prevPeriod.selections[slotId];
        if (prevSelection && selection.playerId !== prevSelection.playerId && selection.playerId !== 'unassigned') {
          updatedSelections[slotId] = {
            ...selection,
            isSubstitution: true
          };
        }
      });
    }
    
    setPeriods(periods.map(period => 
      period.id === periodId 
        ? { ...period, selections: updatedSelections } 
        : period
    ));
    
    // Notify parent component
    onFormationChange(title.toLowerCase().replace(' ', '-'), periodId, updatedSelections);
  };
  
  // Delete a period (except the first one)
  const handleDeletePeriod = (periodId: string) => {
    if (periods.length <= 1) return;
    setPeriods(periods.filter(period => period.id !== periodId));
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="flex items-center gap-3">
          <Select value={performanceCategory} onValueChange={onPerformanceCategoryChange}>
            <SelectTrigger className="w-[150px] h-8">
              <SelectValue placeholder="Performance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MESSI">Messi</SelectItem>
              <SelectItem value="RONALDO">Ronaldo</SelectItem>
              <SelectItem value="JAGS">Jags</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleAddPeriod}>
            <Plus className="h-4 w-4 mr-1" /> Add Period
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex overflow-x-auto pb-4 gap-3">
          {periods.map((period, index) => (
            <div key={period.id} className="flex-shrink-0 w-[300px] bg-muted/20 rounded-md p-2">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium">Period {index + 1}</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Label className="text-xs">Mins:</Label>
                    <Input
                      type="number"
                      value={period.duration}
                      onChange={(e) => handleDurationChange(period.id, parseInt(e.target.value))}
                      className="w-16 h-7 text-xs"
                    />
                  </div>
                  {index > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2" 
                      onClick={() => handleDeletePeriod(period.id)}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              </div>
              <div className="bg-background/50 rounded-md" style={{height: "200px"}}>
                <DraggableFormation
                  format={fixture?.format as "7-a-side" || "7-a-side"}
                  availablePlayers={filteredPlayers}
                  initialSelections={period.selections}
                  onSelectionChange={(selections) => handleFormationChange(period.id, selections)}
                  renderSubstitutionIndicator={(position) => {
                    const slot = Object.entries(period.selections).find(([_, s]) => s.position === position);
                    return slot && slot[1].isSubstitution ? (
                      <span className="absolute -top-2 -right-1 text-amber-500">
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    ) : null;
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
