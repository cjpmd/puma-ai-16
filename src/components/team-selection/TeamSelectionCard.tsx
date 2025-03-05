
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormationSelector } from "@/components/FormationSelector";
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
  onTemplateChange
}: TeamSelectionCardProps) => {
  return (
    <Card key={team.id} className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{team.name}</CardTitle>
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
