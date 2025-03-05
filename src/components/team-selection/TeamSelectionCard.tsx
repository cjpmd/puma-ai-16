
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormationSelector } from "@/components/FormationSelector";
import { FormationView } from "@/components/fixtures/FormationView";
import { FormationFormat } from "@/components/formation/types";
import { PerformanceCategory } from "@/types/player";
import { TeamSelections } from "@/components/fixtures/team-selection/types";
import { DraggableFormation } from "@/components/formation/draggable";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface TeamSelectionCardProps {
  team: {
    id: string;
    name: string;
    category: string;
  };
  format: FormationFormat;
  players: any[];
  selectedPlayers: Set<string>;
  performanceCategory: PerformanceCategory;
  onPerformanceCategoryChange: (value: PerformanceCategory) => void;
  onSelectionChange: (selections: Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>) => void;
  formationTemplate: string;
  onTemplateChange: (template: string) => void;
  viewMode?: "formation" | "team-sheet";
  periodNumber?: number;
  duration?: number;
  onSquadSelectionChange?: (playerIds: string[]) => void;
  squadSelection?: string[];
  useDragAndDrop?: boolean;
  onToggleDragAndDrop?: (enabled: boolean) => void;
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
  duration = 20,
  onSquadSelectionChange,
  squadSelection = [],
  useDragAndDrop = true,
  onToggleDragAndDrop
}: TeamSelectionCardProps) => {
  const formatSelectionsForFormation = (selections: TeamSelections) => {
    return Object.entries(selections)
      .filter(([_, value]) => !value.position.startsWith('sub-'))
      .map(([_, value]) => ({
        position: value.position.split('-')[0].toUpperCase(),
        playerId: value.playerId
      }));
  };

  const squadPlayers = squadSelection.length > 0 ? squadSelection : Array.from(selectedPlayers);

  return (
    <Card key={team.id} className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{viewMode === "formation" ? team.name : `Period ${periodNumber} (${duration} min)`}</CardTitle>
        <div className="flex items-center gap-4">
          {onToggleDragAndDrop && (
            <div className="flex items-center space-x-2">
              <Switch 
                id="drag-enabled" 
                checked={useDragAndDrop}
                onCheckedChange={onToggleDragAndDrop}
              />
              <Label htmlFor="drag-enabled">Drag & Drop</Label>
            </div>
          )}
          <PerformanceCategorySelector
            value={performanceCategory}
            onChange={onPerformanceCategoryChange}
          />
        </div>
      </CardHeader>
      <CardContent>
        {useDragAndDrop ? (
          <DraggableFormation
            format={format}
            availablePlayers={players}
            squadPlayers={squadPlayers}
            onSelectionChange={onSelectionChange}
            performanceCategory={performanceCategory}
            onSquadPlayersChange={onSquadSelectionChange}
            formationTemplate={formationTemplate}
            onTemplateChange={onTemplateChange}
          />
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};

interface PerformanceCategorySelectorProps {
  value: PerformanceCategory;
  onChange: (value: PerformanceCategory) => void;
}

const PerformanceCategorySelector = ({ value, onChange }: PerformanceCategorySelectorProps) => {
  return (
    <Select value={value} onValueChange={(newValue: string) => onChange(newValue as PerformanceCategory)}>
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
