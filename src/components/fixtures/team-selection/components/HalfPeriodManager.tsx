
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { FormationFormat } from "@/components/formation/types";
import { ViewToggleButton } from "./ViewToggleButton";
import { AllPeriodsView } from "./AllPeriodsView";
import { PeriodSelector } from "./PeriodSelector";
import { PeriodDurationInput } from "./PeriodDurationInput";
import { SinglePeriodView } from "./SinglePeriodView";

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
  performanceCategory = "MESSI"
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
              <PeriodSelector
                periods={periods}
                activePeriod={activePeriod}
                onPeriodChange={setActivePeriod}
                onAddPeriod={addNewPeriod}
                onDeletePeriod={deletePeriod}
              />
              
              <PeriodDurationInput
                periodId={activePeriod}
                duration={periods.find(p => p.id === activePeriod)?.duration || 20}
                onDurationChange={updatePeriodDuration}
              />
            </>
          )}
          
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
            performanceCategory={performanceCategory}
            getSelections={getSelectionsForPeriod}
            onFormationChange={handleAllViewFormationChange}
          />
        ) : (
          periods.map((period) => (
            <SinglePeriodView
              key={period.id}
              period={period}
              isActive={period.id === activePeriod}
              format={getFormat()}
              availablePlayers={availablePlayers}
              squadPlayers={squadPlayers}
              selections={periodSelections[period.id] || {}}
              onFormationChange={handleFormationChange}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};
