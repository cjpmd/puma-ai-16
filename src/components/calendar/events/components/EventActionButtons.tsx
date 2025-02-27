
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
        onClick={onEdit}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onTeamSelection}
      >
        <Users className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </>
  );
};
