import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeamSelectionHeaderProps {
  players: any[];
  captain: string;
  onCaptainChange: (playerId: string) => void;
  onShowFormationToggle: () => void;
  showFormation: boolean;
  onAddPeriod: () => void;
  onPrint: () => void;
  onSave: () => void;
  isSaving: boolean;
  playerCategories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const TeamSelectionHeader = ({
  players,
  captain,
  onCaptainChange,
  onShowFormationToggle,
  showFormation,
  onAddPeriod,
  onPrint,
  onSave,
  isSaving,
  playerCategories,
  selectedCategory,
  onCategoryChange,
}: TeamSelectionHeaderProps) => {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-between">
      <div className="flex gap-4 items-center">
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {playerCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={captain} onValueChange={onCaptainChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select captain" />
          </SelectTrigger>
          <SelectContent>
            {players.map((player) => (
              <SelectItem key={player.id} value={player.id}>
                {player.name} (#{player.squad_number})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onShowFormationToggle}
        >
          {showFormation ? "Hide Formation" : "Show Formation"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddPeriod}
        >
          Add Period
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onPrint}
        >
          Print
        </Button>
        <Button
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};