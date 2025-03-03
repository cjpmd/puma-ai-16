
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Clock } from "lucide-react";
import { DraggableFormation } from "@/components/formation/DraggableFormation";
import { FormationFormat } from "@/components/formation/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AllPeriodsView } from "./AllPeriodsView";
import { ViewToggleButton } from "./ViewToggleButton";

interface Period {
  id: string;
  duration: number;
}

interface HalfPeriodManagerProps {
  title: string;
  teamId: string;
  fixture: any;
  availablePlayers: any[];
  squadPlayers: string[];
  onFormationChange: (halfId: string, periodId: string, selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>) => void;
  performanceCategory?: string;
  onPerformanceCategoryChange?: (value: string) => void;
}

export const HalfPeriodManager = ({
  title,
  teamId,
  fixture,
  availablePlayers,
  squadPlayers,
  onFormationChange,
  performanceCategory = "MESSI",
  onPerformanceCategoryChange
}: HalfPeriodManagerProps) => {
  const [activePeriod, setActivePeriod] = useState("period-1");
  const [periods, setPeriods] = useState<Period[]>([
    { id: "period-1", duration: 20 }
  ]);
  const [isGridView, setIsGridView] = useState(false);
  const [periodSelections, setPeriodSelections] = useState<Record<string, Record<string, { playerId: string; position: string; isSubstitution?: boolean }>>>({});
  
  const halfId = title.toLowerCase().replace(/\s+/g, '-');
  
  const getFormat = (): FormationFormat => {
    switch (fixture?.format) {
      case "5-a-side": return "5-a-side";
      case "7-a-side": return "7-a-side";
      case "9-a-side": return "9-a-side";
      case "11-a-side": return "11-a-side";
      default: return "7-a-side";
    }
  };

  const handleFormationChange = (selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>) => {
    // Store selections locally
    setPeriodSelections(prev => ({
      ...prev,
      [activePeriod]: selections
    }));
    
    // Pass to parent
    onFormationChange(halfId, activePeriod, selections);
    console.log(`Formation changed for ${title}, period ${activePeriod}:`, selections);
  };

  const handleAllViewFormationChange = (periodId: string, selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>) => {
    // Store selections locally
    setPeriodSelections(prev => ({
      ...prev,
      [periodId]: selections
    }));
    
    // Pass to parent
    onFormationChange(halfId, periodId, selections);
  };

  const addNewPeriod = () => {
    const newPeriodNumber = periods.length + 1;
    const newPeriodId = `period-${newPeriodNumber}`;
    setPeriods([...periods, { id: newPeriodId, duration: 20 }]);
    setActivePeriod(newPeriodId);
  };

  const deletePeriod = (periodId: string) => {
    if (periods.length <= 1) {
      return; // Don't allow deleting the last period
    }
    
    const newPeriods = periods.filter(p => p.id !== periodId);
    setPeriods(newPeriods);
    
    // If we're deleting the active period, switch to the first available period
    if (activePeriod === periodId) {
      setActivePeriod(newPeriods[0].id);
    }
    
    // Remove selections for this period
    const newSelections = { ...periodSelections };
    delete newSelections[periodId];
    setPeriodSelections(newSelections);
  };

  const updatePeriodDuration = (periodId: string, duration: number) => {
    setPeriods(periods.map(p => 
      p.id === periodId ? { ...p, duration } : p
    ));
  };

  // Get the current period's duration
  const activePeriodDuration = periods.find(p => p.id === activePeriod)?.duration || 20;
  
  // Get selections for a specific period
  const getSelectionsForPeriod = (periodId: string) => {
    return periodSelections[periodId] || {};
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-2">
          {!isGridView && (
            <>
              <span className="text-sm text-gray-500">Period:</span>
              <div className="flex items-center">
                <Select
                  value={activePeriod}
                  onValueChange={setActivePeriod}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map(period => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.id.replace('period-', 'Period ')} ({period.duration}m)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => addNewPeriod()}
                  className="ml-1"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deletePeriod(activePeriod)}
                  disabled={periods.length <= 1}
                  className="ml-1"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center ml-2">
                <Label htmlFor={`duration-${activePeriod}`} className="mr-2 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Duration:</span>
                </Label>
                <Input
                  id={`duration-${activePeriod}`}
                  type="number"
                  value={activePeriodDuration}
                  onChange={(e) => updatePeriodDuration(activePeriod, parseInt(e.target.value) || 20)}
                  className="w-16 text-center"
                  min={5}
                  max={60}
                />
                <span className="ml-1">min</span>
              </div>
            </>
          )}
          
          <span className="text-sm text-gray-500 ml-4">Category:</span>
          <Select
            value={performanceCategory}
            onValueChange={onPerformanceCategoryChange}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MESSI">MESSI</SelectItem>
              <SelectItem value="RONALDO">RONALDO</SelectItem>
              <SelectItem value="NEYMAR">NEYMAR</SelectItem>
              <SelectItem value="JAGS">JAGS</SelectItem>
            </SelectContent>
          </Select>
          
          <ViewToggleButton 
            isGridView={isGridView} 
            onToggle={() => setIsGridView(!isGridView)} 
          />
        </div>
      </CardHeader>
      <CardContent>
        {isGridView ? (
          <AllPeriodsView
            title={title}
            teamId={teamId}
            fixture={fixture}
            periods={periods}
            availablePlayers={availablePlayers}
            squadPlayers={squadPlayers}
            performanceCategory={performanceCategory || "MESSI"}
            getSelections={getSelectionsForPeriod}
            onFormationChange={handleAllViewFormationChange}
          />
        ) : (
          periods.map((period) => (
            <div key={period.id} className={period.id !== activePeriod ? 'hidden' : ''}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">{period.id.replace('period-', 'Period ')} ({period.duration} minutes)</h3>
              </div>
              <DraggableFormation
                format={getFormat()}
                availablePlayers={availablePlayers}
                squadPlayers={squadPlayers}
                initialSelections={periodSelections[period.id]}
                onSelectionChange={handleFormationChange}
                renderSubstitutionIndicator={(position) => (
                  position.includes('SUB') ? (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-white text-[8px] flex items-center justify-center">
                      S
                    </span>
                  ) : null
                )}
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
