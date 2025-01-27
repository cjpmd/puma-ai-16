import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { MapPin, Pencil, Users, Trash2 } from "lucide-react";

interface FestivalEventProps {
  festival: {
    id: string;
    start_time?: string;
    end_time?: string;
    location?: string;
    format: string;
    number_of_teams: number;
  };
  onEdit: (festival: any) => void;
  onTeamSelection: (festival: any) => void;
  onDelete: (festivalId: string) => void;
}

export const FestivalEvent = ({ 
  festival,
  onEdit,
  onTeamSelection,
  onDelete 
}: FestivalEventProps) => {
  return (
    <div className="p-4 border rounded-lg bg-green-50">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">
            Festival {festival.location && (
              <span className="text-muted-foreground">
                @ {festival.location}
              </span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {festival.start_time && `${format(new Date(`2000-01-01T${festival.start_time}`), 'h:mm a')} - `}
            {festival.end_time && format(new Date(`2000-01-01T${festival.end_time}`), 'h:mm a')}
          </p>
          {festival.location && (
            <div className="flex items-center gap-1 text-sm mt-1">
              <MapPin className="h-4 w-4" />
              <span>{festival.location}</span>
            </div>
          )}
          <p className="text-sm mt-1">Format: {festival.format}</p>
          <p className="text-sm">Teams: {festival.number_of_teams}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onEdit(festival)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onTeamSelection(festival)}
          >
            <Users className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDelete(festival.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );
};