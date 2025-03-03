
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";

interface PeriodDurationInputProps {
  periodId: string;
  duration: number;
  onDurationChange: (periodId: string, duration: number) => void;
}

export const PeriodDurationInput = ({ 
  periodId, 
  duration, 
  onDurationChange 
}: PeriodDurationInputProps) => {
  return (
    <div className="flex items-center ml-2">
      <Label htmlFor={`duration-${periodId}`} className="mr-2 flex items-center">
        <Clock className="h-4 w-4 mr-1" />
        <span>Duration:</span>
      </Label>
      <Input
        id={`duration-${periodId}`}
        type="number"
        value={duration}
        onChange={(e) => onDurationChange(periodId, parseInt(e.target.value) || 20)}
        className="w-16 text-center"
        min={5}
        max={60}
      />
      <span className="ml-1">min</span>
    </div>
  );
};
