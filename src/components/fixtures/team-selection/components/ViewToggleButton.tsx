
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

export interface ViewToggleButtonProps {
  viewMode: "list" | "grid";
  onChange: (mode: "list" | "grid") => void;
}

export const ViewToggleButton = ({ viewMode, onChange }: ViewToggleButtonProps) => {
  return (
    <div className="flex space-x-2">
      <Button
        variant={viewMode === "list" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("list")}
      >
        <List className="h-4 w-4 mr-1" />
        List
      </Button>
      <Button
        variant={viewMode === "grid" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("grid")}
      >
        <LayoutGrid className="h-4 w-4 mr-1" />
        Grid
      </Button>
    </div>
  );
};
