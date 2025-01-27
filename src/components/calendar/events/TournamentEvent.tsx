import { format } from "date-fns";
import { MapPin, Pencil, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface TournamentEventProps {
  tournament: {
    id: string;
    time?: string;
    location?: string;
    format: string;
    number_of_teams: number;
    date: string;
  };
  onEdit?: (tournament: any) => void;
  onDelete?: (tournamentId: string) => void;
  onTeamSelection?: (tournament: any) => void;
  onDateChange?: (tournamentId: string, newDate: Date) => void;
}

export const TournamentEvent = ({ 
  tournament,
  onEdit,
  onDelete,
  onTeamSelection,
  onDateChange
}: TournamentEventProps) => {
  return (
    <div className="p-4 border rounded-lg bg-purple-50">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">Tournament</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {tournament.time && format(new Date(`2000-01-01T${tournament.time}`), 'h:mm a')}
          </p>
          {tournament.location && (
            <div className="flex items-center gap-1 text-sm mt-1">
              <MapPin className="h-4 w-4" />
              <span>{tournament.location}</span>
            </div>
          )}
          <p className="text-sm mt-1">Format: {tournament.format}</p>
          <p className="text-sm">Teams: {tournament.number_of_teams}</p>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <Calendar className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={new Date(tournament.date)}
                onSelect={(date) => {
                  if (date && onDateChange) {
                    onDateChange(tournament.id, date);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onEdit?.(tournament)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onTeamSelection?.(tournament)}
          >
            <Users className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDelete?.(tournament.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );
};