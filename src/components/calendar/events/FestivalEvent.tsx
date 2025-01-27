import { format } from "date-fns";
import { MapPin } from "lucide-react";
import { DateChangeButton } from "./components/DateChangeButton";
import { EventActionButtons } from "./components/EventActionButtons";

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
  onDateChange?: (festivalId: string, newDate: Date) => void;
}

export const FestivalEvent = ({ 
  festival,
  onEdit,
  onTeamSelection,
  onDelete,
  onDateChange
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
          <DateChangeButton
            date={festival.date}
            onDateChange={(date) => onDateChange?.(festival.id, date)}
          />
          <EventActionButtons
            onEdit={() => onEdit(festival)}
            onTeamSelection={() => onTeamSelection(festival)}
            onDelete={() => onDelete(festival.id)}
          />
        </div>
      </div>
    </div>
  );
};