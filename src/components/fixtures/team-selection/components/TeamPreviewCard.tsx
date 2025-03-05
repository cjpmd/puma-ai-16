
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormationFormat } from "@/components/formation/types";
import { PerformanceCategory } from "@/types/player";
import { TeamSelections } from "../types";
import { FormationView } from "@/components/fixtures/FormationView";

interface TeamPreviewCardProps {
  periodId: string;
  index: number;
  teamId: string;
  fixture: any;
  teamSelections: Record<string, Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>>;
  availablePlayers: any[];
  teamSquadPlayers: string[];
  performanceCategories: Record<string, PerformanceCategory>;
  onPerformanceCategoryChange: (value: PerformanceCategory) => void;
  onDurationChange: (teamId: string, periodId: string, duration: number) => void;
  onDeletePeriod: (teamId: string, periodId: string) => void;
  handleFormationChange: (teamId: string, periodId: string, selections: Record<string, { playerId: string; position: string }>) => void;
  checkIsSubstitution: (teamId: string, periodIndex: number, position: string) => boolean;
}

export const TeamPreviewCard: React.FC<TeamPreviewCardProps> = ({
  periodId,
  index,
  teamId,
  fixture,
  teamSelections,
  availablePlayers,
  teamSquadPlayers,
  performanceCategories,
  onPerformanceCategoryChange,
  onDurationChange,
  onDeletePeriod,
  handleFormationChange,
  checkIsSubstitution
}) => {
  const formatSelectionsForFormation = (selections: Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>) => {
    return Object.entries(selections)
      .filter(([_, value]) => !value.position.startsWith('sub-'))
      .map(([_, value]) => ({
        position: value.position.split('-')[0].toUpperCase(),
        playerId: value.playerId
      }));
  };

  // Get the current performanceCategory for this period
  const performanceCategory = performanceCategories[`${teamId}-${periodId}`] || "MESSI" as PerformanceCategory;
  const selections = teamSelections[`${teamId}-${periodId}`] || {};
  const positions = formatSelectionsForFormation(selections);

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Period {index + 1} Formation</CardTitle>
        <div className="flex items-center space-x-4">
          <PerformanceCategorySelector
            value={performanceCategory}
            onChange={onPerformanceCategoryChange}
          />
          <button 
            className="text-red-500 hover:text-red-700"
            onClick={() => onDeletePeriod(teamId, periodId)}
          >
            Delete Period
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
          <input
            type="number"
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            defaultValue={45}
            onChange={(e) => onDurationChange(teamId, periodId, parseInt(e.target.value))}
          />
        </div>
        
        <FormationView
          positions={positions}
          players={availablePlayers}
          periodNumber={index + 1}
          duration={45} // Default duration
        />
      </CardContent>
    </Card>
  );
};

interface PerformanceCategorySelectorProps {
  value: PerformanceCategory;
  onChange: (value: PerformanceCategory) => void;
}

const PerformanceCategorySelector: React.FC<PerformanceCategorySelectorProps> = ({ 
  value, 
  onChange 
}) => {
  return (
    <Select value={value} onValueChange={(newValue) => onChange(newValue as PerformanceCategory)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="MESSI">Messi</SelectItem>
        <SelectItem value="RONALDO">Ronaldo</SelectItem>
        <SelectItem value="JAGS">Jags</SelectItem>
      </SelectContent>
    </Select>
  );
};
