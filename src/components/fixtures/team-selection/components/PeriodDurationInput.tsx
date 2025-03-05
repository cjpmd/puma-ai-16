
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PeriodDurationInputProps {
  teamId: string;
  periodId: string;
  duration: number;
  onChange: (teamId: string, periodId: string, duration: number) => void;
}

export const PeriodDurationInput = ({
  teamId,
  periodId,
  duration,
  onChange
}: PeriodDurationInputProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor={`duration-${periodId}`} className="text-nowrap">Duration (min):</Label>
      <Input
        id={`duration-${periodId}`}
        type="number"
        value={duration}
        min={5}
        max={90}
        className="w-16"
        onChange={(e) => {
          const newDuration = parseInt(e.target.value, 10);
          if (!isNaN(newDuration) && newDuration >= 5 && newDuration <= 90) {
            onChange(teamId, periodId, newDuration);
          }
        }}
      />
    </div>
  );
};
