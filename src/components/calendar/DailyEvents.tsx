import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FixtureCard } from "@/components/calendar/FixtureCard";
import { SessionCard } from "@/components/training/SessionCard";
import { Button } from "@/components/ui/button";
import { Pencil, Users, Trash2 } from "lucide-react";
import { Fixture } from "@/types/fixture";

interface DailyEventsProps {
  date: Date;
  fixtures: Fixture[];
  sessions: any[];
  festivals: any[];
  tournaments: any[];
  fileUrls: Record<string, string>;
  onEditFixture: (fixture: Fixture) => void;
  onDeleteFixture: (fixtureId: string) => void;
  onUpdateFixtureDate: (fixtureId: string, newDate: Date) => void;
  onAddDrill: (sessionId: string) => void;
  onEditDrill: (sessionId: string, drill: any) => void;
  onDeleteSession: (sessionId: string) => void;
  onEditFestival?: (festival: any) => void;
  onDeleteFestival?: (festivalId: string) => void;
  onTeamSelectionFestival?: (festival: any) => void;
}

export const DailyEvents = ({
  date,
  fixtures,
  sessions,
  festivals,
  tournaments,
  fileUrls,
  onEditFixture,
  onDeleteFixture,
  onUpdateFixtureDate,
  onAddDrill,
  onEditDrill,
  onDeleteSession,
  onEditFestival,
  onDeleteFestival,
  onTeamSelectionFestival,
}: DailyEventsProps) => {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>
          {date ? format(date, "EEEE, MMMM do, yyyy") : "Select a date"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {festivals?.map((festival) => (
            <div key={festival.id} className="p-4 border rounded-lg bg-green-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Festival</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {festival.start_time && `${format(new Date(`2000-01-01T${festival.start_time}`), 'h:mm a')} - `}
                    {festival.end_time && format(new Date(`2000-01-01T${festival.end_time}`), 'h:mm a')}
                  </p>
                  <p className="text-sm">{festival.location}</p>
                  <p className="text-sm mt-1">Format: {festival.format}</p>
                  <p className="text-sm">Teams: {festival.number_of_teams}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEditFestival?.(festival)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onTeamSelectionFestival?.(festival)}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onDeleteFestival?.(festival.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {tournaments?.map((tournament) => (
            <div key={tournament.id} className="p-4 border rounded-lg bg-purple-50">
              <h3 className="font-medium">Tournament</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {tournament.time && format(new Date(`2000-01-01T${tournament.time}`), 'h:mm a')}
              </p>
              <p className="text-sm">{tournament.location}</p>
              <p className="text-sm mt-1">Format: {tournament.format}</p>
              <p className="text-sm">Teams: {tournament.number_of_teams}</p>
            </div>
          ))}

          {fixtures?.map((fixture) => (
            <FixtureCard 
              key={fixture.id} 
              fixture={fixture}
              onEdit={() => onEditFixture(fixture)}
              onDelete={onDeleteFixture}
              onDateChange={(newDate) => onUpdateFixtureDate(fixture.id, newDate)}
            />
          ))}
          
          {sessions?.map((session) => (
            <SessionCard 
              key={session.id}
              session={{
                id: session.id,
                title: session.title,
                drills: session.training_drills.map((drill: any) => ({
                  id: drill.id,
                  title: drill.title,
                  instructions: drill.instructions,
                  training_files: drill.training_files
                }))
              }}
              fileUrls={fileUrls}
              onAddDrillClick={onAddDrill}
              onEditDrillClick={onEditDrill}
              onDeleteSession={onDeleteSession}
            />
          ))}
          
          {(!sessions?.length && !fixtures?.length && !festivals?.length && !tournaments?.length) && (
            <div className="text-center py-8 text-muted-foreground">
              No events scheduled for this date
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};