
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormationFormat } from "@/components/formation/types";
import { PerformanceCategory } from "@/types/player";
import { TeamSelections } from "../types";
import { FormationView } from "@/components/fixtures/FormationView";

interface TeamPreviewCardProps {
  teamId: string;
  teamName: string;
  format: FormationFormat;
  players: any[];
  selections: TeamSelections;
  performanceCategory: PerformanceCategory;
  onPerformanceCategoryChange: (value: PerformanceCategory) => void;
  periodNumber?: number;
  duration?: number;
}

export const TeamPreviewCard: React.FC<TeamPreviewCardProps> = ({
  teamId,
  teamName,
  format,
  players,
  selections,
  performanceCategory,
  onPerformanceCategoryChange,
  periodNumber = 1,
  duration = 45
}) => {
  const formatSelectionsForFormation = (selections: TeamSelections) => {
    return Object.entries(selections)
      .filter(([_, value]) => !value.position.startsWith('sub-'))
      .map(([_, value]) => ({
        position: value.position.split('-')[0].toUpperCase(),
        playerId: value.playerId
      }));
  };

  const positions = formatSelectionsForFormation(selections);

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Formation Preview</CardTitle>
        <PerformanceCategorySelector
          value={performanceCategory}
          onChange={onPerformanceCategoryChange}
        />
      </CardHeader>
      <CardContent>
        <FormationView
          positions={positions}
          players={players}
          periodNumber={periodNumber}
          duration={duration}
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
