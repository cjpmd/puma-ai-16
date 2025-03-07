
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PerformanceCategory } from "@/types/player";
import { PerformanceCategorySelector } from "./PerformanceCategorySelector";

/**
 * TeamSelectionCardHeader props interface
 */
interface TeamSelectionCardHeaderProps {
  /** Team name to display */
  teamName: string;
  /** Period display name (e.g., "First Half") */
  periodDisplayName?: string;
  /** View mode for the card */
  viewMode: "formation" | "team-sheet";
  /** Current performance category setting */
  performanceCategory: PerformanceCategory;
  /** Handler for performance category changes */
  onPerformanceCategoryChange: (value: PerformanceCategory) => void;
  /** Whether drag and drop is enabled */
  useDragAndDrop?: boolean;
  /** Handler for toggling drag and drop */
  onToggleDragAndDrop?: (enabled: boolean) => void;
}

/**
 * TeamSelectionCardHeader component
 * 
 * Displays the header for a team selection card, including the team name,
 * period name, and controls for performance category and drag-and-drop
 */
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
    ? periodDisplayName ? `${teamName} - ${periodDisplayName}` : teamName
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
