
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface Period {
  id: string;
  duration: number;
}

interface PeriodSelectorProps {
  periods: Period[];
  activePeriod: string;
  onPeriodChange: (periodId: string) => void;
  onAddPeriod: () => void;
  onDeletePeriod: (periodId: string) => void;
}

export const PeriodSelector = ({
  periods,
  activePeriod,
  onPeriodChange,
  onAddPeriod,
  onDeletePeriod
}: PeriodSelectorProps) => {
  return (
    <div className="flex items-center">
      <span className="text-sm text-gray-500">Period:</span>
      <div className="flex items-center">
        <Select
          value={activePeriod}
          onValueChange={onPeriodChange}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            {periods.map(period => (
              <SelectItem key={period.id} value={period.id}>
                {period.id.replace('period-', 'Period ')} ({period.duration}m)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onAddPeriod}
          className="ml-1"
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDeletePeriod(activePeriod)}
          disabled={periods.length <= 1}
          className="ml-1"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
