
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TeamSettingsHeaderProps {
  duration: string;
  onDurationChange: (value: string) => void;
}

export const TeamSettingsHeader = ({
  duration,
  onDurationChange,
}: TeamSettingsHeaderProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 mb-6">
      <div>
        <Label className="text-sm font-medium">Duration (minutes)</Label>
        <Input
          type="number"
          value={duration}
          onChange={(e) => onDurationChange(e.target.value)}
          min="1"
          className="h-9"
        />
      </div>
    </div>
  );
};

