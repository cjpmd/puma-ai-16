
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ALL_POSITIONS } from "./constants/positions";

interface PositionDropdownProps {
  position: string;
  onPositionChange: (newPosition: string) => void;
}

export const PositionDropdown = ({ position, onPositionChange }: PositionDropdownProps) => {
  return (
    <div className="flex-1">
      <Label className="text-xs text-muted-foreground mb-1 block">Position</Label>
      <Select 
        value={position}
        onValueChange={onPositionChange}
      >
        <SelectTrigger className="h-8 text-left">
          <SelectValue placeholder="Select position">
            {position}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white z-50 max-h-60">
          {ALL_POSITIONS.map((pos) => (
            <SelectItem key={pos} value={pos} className="text-sm">
              {pos}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
