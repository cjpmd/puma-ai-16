
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

interface PeriodCardProps {
  periodId: number;
  periodName: string;
  duration: number;
  teamId: string;
  isDefault: boolean;
  onDurationChange: (duration: number) => void;
  onDeletePeriod: () => void;
  onNavigate: () => void;
}

export const PeriodCard = ({
  periodId,
  periodName,
  duration,
  teamId,
  isDefault,
  onDurationChange,
  onDeletePeriod,
  onNavigate,
}: PeriodCardProps) => {
  return (
    <Card className={`${isDefault ? 'border-blue-300' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">{periodName}</CardTitle>
          {!isDefault && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onDeletePeriod}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center space-x-2 mb-2">
          <Label htmlFor={`duration-${periodId}`} className="w-16">Duration:</Label>
          <Input
            id={`duration-${periodId}`}
            type="number"
            min="1"
            max="90" 
            value={duration}
            onChange={(e) => onDurationChange(parseInt(e.target.value) || 1)}
            className="w-20"
          />
          <span className="text-sm text-gray-500">minutes</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          variant="outline"
          onClick={onNavigate}
        >
          Set Formation
        </Button>
      </CardFooter>
    </Card>
  );
};
