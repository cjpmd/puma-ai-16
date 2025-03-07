
import React from "react";
import { CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PerformanceCategory } from "@/types/player";
import { Flag } from "lucide-react";

interface TeamSelectionCardHeaderProps {
  team: {
    id: string;
    name: string;
    category: string;
  };
  performanceCategory: PerformanceCategory;
  onPerformanceCategoryChange: (value: PerformanceCategory) => void;
  useDragAndDrop?: boolean;
  onToggleDragAndDrop?: (enabled: boolean) => void;
  captainSelectionMode?: boolean;
  onToggleCaptainSelection?: () => void;
  hasCaptain?: boolean;
}

export const TeamSelectionCardHeader: React.FC<TeamSelectionCardHeaderProps> = ({
  team,
  performanceCategory,
  onPerformanceCategoryChange,
  useDragAndDrop = true,
  onToggleDragAndDrop,
  captainSelectionMode,
  onToggleCaptainSelection,
  hasCaptain = false
}) => {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
      <CardTitle className="text-lg">{team.name}</CardTitle>
      
      <div className="flex flex-wrap gap-3 items-center">
        {onToggleCaptainSelection && (
          <Button 
            variant={captainSelectionMode ? "default" : hasCaptain ? "outline" : "secondary"} 
            size="sm"
            onClick={onToggleCaptainSelection}
            className="flex items-center gap-1"
          >
            <Flag className={`h-4 w-4 ${hasCaptain && !captainSelectionMode ? "fill-yellow-500 text-yellow-500" : ""}`} />
            <span>{captainSelectionMode ? "Selecting Captain" : hasCaptain ? "Captain Set" : "Set Captain"}</span>
          </Button>
        )}
        
        <Select 
          value={performanceCategory}
          onValueChange={(value) => onPerformanceCategoryChange(value as PerformanceCategory)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MESSI">Messi</SelectItem>
            <SelectItem value="RONALDO">Ronaldo</SelectItem>
            <SelectItem value="JAGS">Jags</SelectItem>
          </SelectContent>
        </Select>
        
        {onToggleDragAndDrop && (
          <div className="flex items-center space-x-2">
            <Label htmlFor={`drag-mode-${team.id}`} className="text-xs">
              Drag Mode
            </Label>
            <Switch 
              id={`drag-mode-${team.id}`}
              checked={useDragAndDrop}
              onCheckedChange={onToggleDragAndDrop}
            />
          </div>
        )}
      </div>
    </div>
  );
};
