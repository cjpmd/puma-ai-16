import { format } from "date-fns";
import { MapPin, Pencil, Users, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface FestivalEventProps {
  festival: {
    id: string;
    start_time?: string;
    end_time?: string;
    location?: string;
    format: string;
    number_of_teams: number;
    date: string;
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
          <h3 className="font-medium">Festival</h3>
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
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <Calendar className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={new Date(festival.date)}
                onSelect={(date) => {
                  if (date) {
                    onEdit({ ...festival, date: format(date, 'yyyy-MM-dd') });
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
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