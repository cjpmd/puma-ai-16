
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormationSelector } from "@/components/FormationSelector";
import { FormationFormat } from "@/components/formation/types";
import { PerformanceCategory } from "@/types/player";
import { PlayerSelection } from "@/components/formation/types";

interface TeamPeriodCardProps {
  teamId: string;
  teamName: string;
  periodNumber: number;
  duration: number;
  format: FormationFormat;
  availablePlayers: Array<{ id: string; name: string; squad_number?: number }>;
  selectedPlayers: Set<string>;
  performanceCategory: PerformanceCategory;
  onPerformanceCategoryChange: (value: PerformanceCategory) => void;
  onSelectionChange: (periodNumber: number, selections: Record<string, PlayerSelection>) => void;
  initialSelections?: Record<string, PlayerSelection>;
  formationTemplate: string;
  onTemplateChange: (template: string) => void;
}

const TeamPeriodCard: React.FC<TeamPeriodCardProps> = ({
  teamId,
  teamName,
  periodNumber,
  duration,
  format,
  availablePlayers,
  selectedPlayers,
  performanceCategory,
  onPerformanceCategoryChange,
  onSelectionChange,
  initialSelections,
  formationTemplate,
  onTemplateChange
}) => {
  const handleSelectionChange = (selections: Record<string, PlayerSelection>) => {
    onSelectionChange(periodNumber, selections);
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Period {periodNumber} ({duration} min)</CardTitle>
        <PerformanceCategorySelector
          value={performanceCategory}
          onChange={onPerformanceCategoryChange}
        />
      </CardHeader>
      <CardContent>
        <FormationSelector
          format={format}
          teamName={teamName}
          onSelectionChange={handleSelectionChange}
          selectedPlayers={selectedPlayers}
          availablePlayers={availablePlayers}
          performanceCategory={performanceCategory}
          initialSelections={initialSelections}
          viewMode="team-sheet"
          periodNumber={periodNumber}
          duration={duration}
          formationTemplate={formationTemplate}
          onTemplateChange={onTemplateChange}
        />
      </CardContent>
    </Card>
  );
};

interface PerformanceCategorySelectorProps {
  value: PerformanceCategory;
  onChange: (value: PerformanceCategory) => void;
}

const PerformanceCategorySelector: React.FC<PerformanceCategorySelectorProps> = ({ value, onChange }) => {
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

export default TeamPeriodCard;
