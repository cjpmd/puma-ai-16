
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Grid } from "lucide-react";

interface ViewToggleButtonProps {
  isGridView: boolean;
  onToggle: () => void;
}

export const ViewToggleButton = ({ isGridView, onToggle }: ViewToggleButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className="gap-1"
    >
      {isGridView ? <Eye className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
      {isGridView ? "Single View" : "All Periods"}
    </Button>
  );
};
