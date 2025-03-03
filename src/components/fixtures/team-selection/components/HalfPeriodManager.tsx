import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DraggableFormation } from "@/components/formation/DraggableFormation";
import { FormationFormat } from "@/components/formation/types";

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
  const [activePeriod, setActivePeriod] = useState("1");
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
    onFormationChange(halfId, activePeriod, selections);
    console.log(`Formation changed for ${title}, period ${activePeriod}:`, selections);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Period:</span>
          <Select
            value={activePeriod}
            onValueChange={setActivePeriod}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Period 1</SelectItem>
              <SelectItem value="2">Period 2</SelectItem>
              <SelectItem value="3">Period 3</SelectItem>
            </SelectContent>
          </Select>
          
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
        </div>
      </CardHeader>
      <CardContent>
        <DraggableFormation
          format={getFormat()}
          availablePlayers={availablePlayers}
          squadPlayers={squadPlayers}
          onSelectionChange={handleFormationChange}
          renderSubstitutionIndicator={(position) => (
            position.includes('SUB') ? (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-white text-[8px] flex items-center justify-center">
                S
              </span>
            ) : null
          )}
        />
      </CardContent>
    </Card>
  );
};
