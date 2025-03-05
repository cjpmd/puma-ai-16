
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormationSelector } from "@/components/FormationSelector";
import { PerformanceCategory } from "@/types/player";
import { FormationFormat } from "@/components/formation/types";

interface TeamPeriodsListProps {
  teamId: string;
  teamName: string;
  format: FormationFormat;
  availablePlayers: any[];
  selectedPlayers: Set<string>;
  performanceCategory: PerformanceCategory;
  onPerformanceCategoryChange: (value: PerformanceCategory) => void;
  periods: Array<{
    id: number;
    duration: number;
    selections: Record<string, { playerId: string; position: string }>;
  }>;
  onPeriodSelectionChange: (periodId: number, selections: Record<string, { playerId: string; position: string }>) => void;
  onPeriodDurationChange: (periodId: number, duration: number) => void;
  onAddPeriod: () => void;
  onDeletePeriod: (periodId: number) => void;
}

export const TeamPeriodsList = ({
  teamId,
  teamName,
  format,
  availablePlayers,
  selectedPlayers,
  performanceCategory,
  onPerformanceCategoryChange,
  periods,
  onPeriodSelectionChange,
  onPeriodDurationChange,
  onAddPeriod,
  onDeletePeriod
}: TeamPeriodsListProps) => {
  const [formationTemplate, setFormationTemplate] = useState("All");
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{teamName} - Periods</h3>
        <Select value={performanceCategory} onValueChange={(value) => onPerformanceCategoryChange(value as PerformanceCategory)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Performance category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MESSI">Messi</SelectItem>
            <SelectItem value="RONALDO">Ronaldo</SelectItem>
            <SelectItem value="JAGS">Jags</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {periods.map((period) => (
        <Card key={period.id} className="mb-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Period {period.id}</CardTitle>
            <div className="flex items-center space-x-2">
              <label className="text-sm">Duration (min):</label>
              <input
                type="number"
                min="5"
                max="90"
                value={period.duration}
                onChange={(e) => onPeriodDurationChange(period.id, parseInt(e.target.value) || 45)}
                className="w-16 px-2 py-1 border rounded"
              />
              {periods.length > 1 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDeletePeriod(period.id)}
                  className="text-destructive border-destructive hover:bg-destructive/10"
                >
                  Delete
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <FormationSelector
              format={format}
              teamName={`${teamName} - Period ${period.id}`}
              onSelectionChange={(selections) => onPeriodSelectionChange(period.id, selections)}
              selectedPlayers={selectedPlayers}
              availablePlayers={availablePlayers}
              performanceCategory={performanceCategory}
              formationTemplate={formationTemplate}
              onTemplateChange={setFormationTemplate}
              viewMode="team-sheet"
              periodNumber={period.id}
              duration={period.duration}
              initialSelections={period.selections}
            />
          </CardContent>
        </Card>
      ))}
      
      <div className="flex justify-center">
        <Button onClick={onAddPeriod}>Add Period</Button>
      </div>
    </div>
  );
};
