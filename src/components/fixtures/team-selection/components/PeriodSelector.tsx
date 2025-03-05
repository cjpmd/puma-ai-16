
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PeriodSelectorProps {
  periodCount: number;
  activePeriod: string;
  onPeriodChange: (periodId: string) => void;
}

export const PeriodSelector = ({ periodCount, activePeriod, onPeriodChange }: PeriodSelectorProps) => {
  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {Array.from({ length: periodCount }).map((_, index) => {
        const periodId = (index + 1).toString();
        return (
          <Button
            key={periodId}
            variant={activePeriod === periodId ? "default" : "outline"}
            size="sm"
            onClick={() => onPeriodChange(periodId)}
            className={cn(
              "min-w-[80px]",
              activePeriod === periodId
                ? "bg-primary text-primary-foreground"
                : "bg-background"
            )}
          >
            Period {index + 1}
          </Button>
        );
      })}
    </div>
  );
};
