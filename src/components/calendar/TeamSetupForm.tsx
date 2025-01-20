import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeamSetupFormProps {
  teamIndex: number;
  onTeamUpdate: (index: number, category: string) => void;
  defaultCategory: string;
  availableCategories: string[];
}

export const TeamSetupForm = ({ 
  teamIndex, 
  onTeamUpdate,
  defaultCategory,
  availableCategories 
}: TeamSetupFormProps) => {
  return (
    <div className="space-y-2">
      <Label>Team {teamIndex + 1} Category</Label>
      <Select
        defaultValue={defaultCategory}
        onValueChange={(value) => onTeamUpdate(teamIndex, value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={defaultCategory}>{defaultCategory}</SelectItem>
          {availableCategories
            .filter(cat => cat !== defaultCategory)
            .map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
};