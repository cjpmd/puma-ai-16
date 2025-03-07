
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PerformanceCategory } from "@/types/player";
import { PerformanceCategorySelector } from "./PerformanceCategorySelector";

interface TeamSelectionCardHeaderProps {
  teamName: string;
  periodDisplayName?: string;
  viewMode: "formation" | "team-sheet";
  performanceCategory: PerformanceCategory;
  onPerformanceCategoryChange: (value: PerformanceCategory) => void;
  useDragAndDrop?: boolean;
  onToggleDragAndDrop?: (enabled: boolean) => void;
}

export const TeamSelectionCardHeader = ({
  teamName,
  periodDisplayName,
  viewMode,
  performanceCategory,
  onPerformanceCategoryChange,
  useDragAndDrop,
  onToggleDragAndDrop
}: TeamSelectionCardHeaderProps) => {
  // Get a display title based on view mode and period
  const title = viewMode === "formation" 
    ? teamName 
    : `${teamName} - ${periodDisplayName || ""}`;

  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>{title}</CardTitle>
      <div className="flex items-center gap-4">
        {onToggleDragAndDrop && (
          <div className="flex items-center space-x-2">
            <Switch 
              id="drag-enabled" 
              checked={useDragAndDrop}
              onCheckedChange={onToggleDragAndDrop}
            />
            <Label htmlFor="drag-enabled">Drag & Drop</Label>
          </div>
        )}
        <PerformanceCategorySelector
          value={performanceCategory}
          onChange={onPerformanceCategoryChange}
        />
      </div>
    </CardHeader>
  );
};
