
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormationSelector } from "@/components/FormationSelector";
import { FormationView } from "@/components/fixtures/FormationView";
import { FormationFormat } from "@/components/formation/types";

interface TeamSelectionCardProps {
  team: {
    id: string;
    name: string;
    category: string;
  };
  format: FormationFormat;
  players: any[];
  selectedPlayers: Set<string>;
  performanceCategory: string;
  onPerformanceCategoryChange: (value: string) => void;
  onSelectionChange: (selections: Record<string, { playerId: string; position: string; performanceCategory?: string }>) => void;
  formationTemplate: string;
  onTemplateChange: (template: string) => void;
  viewMode?: "formation" | "team-sheet";
  periodNumber?: number;
  duration?: number;
}

export const TeamSelectionCard = ({
  team,
  format,
  players,
  selectedPlayers,
  performanceCategory,
  onPerformanceCategoryChange,
  onSelectionChange,
  formationTemplate,
  onTemplateChange,
  viewMode = "team-sheet",
  periodNumber = 1,
  duration = 20
}: TeamSelectionCardProps) => {
  const formatSelectionsForFormation = (selections: Record<string, { playerId: string; position: string }>) => {
    return Object.entries(selections)
      .filter(([_, value]) => !value.position.startsWith('sub-'))
      .map(([_, value]) => ({
        position: value.position.split('-')[0].toUpperCase(),
        playerId: value.playerId
      }));
  };

  const formationSelections: Record<string, { playerId: string; position: string }> = {};

  return (
    <Card key={team.id} className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{viewMode === "formation" ? team.name : `Period ${periodNumber} (${duration} min)`}</CardTitle>
        <PerformanceCategorySelector
          value={performanceCategory}
          onChange={onPerformanceCategoryChange}
        />
      </CardHeader>
      <CardContent>
        <FormationSelector
          format={format}
          teamName={team.name}
          onSelectionChange={onSelectionChange}
          selectedPlayers={selectedPlayers}
          availablePlayers={players}
          performanceCategory={performanceCategory}
          formationTemplate={formationTemplate}
          onTemplateChange={onTemplateChange}
          viewMode={viewMode}
          periodNumber={periodNumber}
          duration={duration}
        />
      </CardContent>
    </Card>
  );
};

interface PerformanceCategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const PerformanceCategorySelector = ({ value, onChange }: PerformanceCategorySelectorProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
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
