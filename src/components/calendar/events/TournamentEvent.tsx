
import { format } from "date-fns";
import { MapPin } from "lucide-react";
import { DateChangeButton } from "./components/DateChangeButton";
import { EventActionButtons } from "./components/EventActionButtons";

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
          <DateChangeButton
            date={new Date(tournament.date)}
            onDateChange={(date) => onDateChange?.(tournament.id, date)}
          />
          <EventActionButtons
            onEdit={() => onEdit?.(tournament)}
            onTeamSelection={() => {
              console.log("Tournament team selection clicked", tournament);
              onTeamSelection?.(tournament);
            }}
            onDelete={() => onDelete?.(tournament.id)}
          />
        </div>
      </div>
    </div>
  );
};
