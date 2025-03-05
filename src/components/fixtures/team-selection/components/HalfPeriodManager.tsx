
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { DraggableFormation } from "@/components/formation/draggable";
import { FormationFormat } from "@/components/formation/types";

interface HalfPeriodManagerProps {
  title: string;
  teamId: string;
  fixture: any;
  availablePlayers: any[];
  squadPlayers: string[];
  onFormationChange: (halfId: string, periodId: string, selections: Record<string, { playerId: string; position: string; performanceCategory?: string; isSubstitution?: boolean }>) => void;
  performanceCategory: string;
  onPerformanceCategoryChange: (value: string) => void;
  selections?: Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string; isSubstitution?: boolean }>>;
}

export const HalfPeriodManager = ({
  title,
  teamId,
  fixture,
  availablePlayers,
  squadPlayers,
  onFormationChange,
  performanceCategory,
  onPerformanceCategoryChange,
  selections = {}
}: HalfPeriodManagerProps) => {
  const [periodIds, setPeriodIds] = useState<string[]>(['period-1']);
  const [activePeriod, setActivePeriod] = useState<string>('period-1');
  const [format, setFormat] = useState<FormationFormat>('7-a-side');
  
  // Initialize format based on fixture
  useEffect(() => {
    if (fixture?.format) {
      const fixtureFormat = fixture.format.toLowerCase();
      if (fixtureFormat.includes('5-a-side') || fixtureFormat.includes('5a')) {
        setFormat('5-a-side');
      } else if (fixtureFormat.includes('7-a-side') || fixtureFormat.includes('7a')) {
        setFormat('7-a-side');
      } else if (fixtureFormat.includes('9-a-side') || fixtureFormat.includes('9a')) {
        setFormat('9-a-side');
      } else if (fixtureFormat.includes('11-a-side') || fixtureFormat.includes('11a')) {
        setFormat('11-a-side');
      }
    }
  }, [fixture]);
  
  // Normalize half ID for internal use
  const halfId = title.toLowerCase().replace(' ', '-');

  // Handle adding a period
  const handleAddPeriod = () => {
    const newPeriodNumber = periodIds.length + 1;
    const newPeriodId = `period-${newPeriodNumber}`;
    setPeriodIds(prev => [...prev, newPeriodId]);
    setActivePeriod(newPeriodId);
  };

  // Handle removing a period
  const handleRemovePeriod = (periodId: string) => {
    if (periodIds.length <= 1) {
      return; // Don't remove last period
    }
    
    setPeriodIds(prev => prev.filter(id => id !== periodId));
    
    // If we're removing the active period, switch to the first period
    if (activePeriod === periodId) {
      setActivePeriod(periodIds.filter(id => id !== periodId)[0]);
    }
  };

  // Handle formation changes
  const handleFormationChange = (periodId: string, formationSelections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>) => {
    // Add performance category to each selection
    const selectionsWithCategory = Object.entries(formationSelections).reduce((acc, [slotId, selection]) => {
      acc[slotId] = {
        ...selection,
        performanceCategory
      };
      return acc;
    }, {});
    
    console.log(`Formation changed for ${title}, period ${periodId}:`, selectionsWithCategory);
    onFormationChange(halfId, periodId, selectionsWithCategory);
  };

  // Get selections for current period
  const getCurrentPeriodSelections = () => {
    return selections[activePeriod] || {};
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center space-x-2">
          <Select
            value={performanceCategory}
            onValueChange={onPerformanceCategoryChange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Performance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MESSI">Messi</SelectItem>
              <SelectItem value="RONALDO">Ronaldo</SelectItem>
              <SelectItem value="JAGS">Jags</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activePeriod} onValueChange={setActivePeriod}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              {periodIds.map(periodId => (
                <TabsTrigger key={periodId} value={periodId}>
                  Period {periodId.split('-')[1]}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddPeriod}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Period
              </Button>
              
              {periodIds.length > 1 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleRemovePeriod(activePeriod)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>
          </div>
          
          {periodIds.map(periodId => (
            <TabsContent key={periodId} value={periodId}>
              <DraggableFormation
                format={format}
                availablePlayers={availablePlayers}
                squadPlayers={squadPlayers}
                initialSelections={getCurrentPeriodSelections()}
                onSelectionChange={(selections) => handleFormationChange(periodId, selections)}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
