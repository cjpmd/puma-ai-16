
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TeamSettingsHeaderProps {
  captain: string;
  duration: string;
  availablePlayers?: Array<{ id: string; name: string; squad_number?: number }>;
  onCaptainChange: (value: string) => void;
  onDurationChange: (value: string) => void;
}

export const TeamSettingsHeader = ({
  captain,
  duration,
  availablePlayers = [],
  onCaptainChange,
  onDurationChange,
}: TeamSettingsHeaderProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <Label className="text-sm font-medium">Captain</Label>
        <Select value={captain} onValueChange={onCaptainChange}>
          <SelectTrigger className="text-left h-9">
            <SelectValue placeholder="Select captain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">None</SelectItem>
            {availablePlayers?.map(player => (
              <SelectItem key={player.id} value={player.id}>
                {player.name} {player.squad_number ? `(${player.squad_number})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
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
