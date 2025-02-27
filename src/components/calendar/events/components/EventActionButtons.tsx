
import { Pencil, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventActionButtonsProps {
  onEdit: () => void;
  onTeamSelection: () => void;
  onDelete: () => void;
}

export const EventActionButtons = ({ 
  onEdit, 
  onTeamSelection, 
  onDelete 
}: EventActionButtonsProps) => {
  return (
    <>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          console.log("Edit button clicked in EventActionButtons");
          onEdit();
        }}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onTeamSelection();
        }}
      >
        <Users className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </>
  );
};
