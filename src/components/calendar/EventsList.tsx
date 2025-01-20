import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { SessionCard } from "@/components/training/SessionCard";
import { FixtureCard } from "@/components/calendar/FixtureCard";

interface EventsListProps {
  date: Date;
  fixtures: any[];
  sessions: any[];
  onDeleteSession: (sessionId: string) => void;
  onEditFixture: (fixture: any) => void;
  onDeleteFixture: (fixtureId: string) => void;
  onUpdateFixtureDate: (fixtureId: string, newDate: Date) => void;
}

export const EventsList = ({
  date,
  fixtures,
  sessions,
  onDeleteSession,
  onEditFixture,
  onDeleteFixture,
  onUpdateFixtureDate,
}: EventsListProps) => {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>
          {date ? format(date, "EEEE, MMMM do, yyyy") : "Select a date"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {fixtures?.map((fixture) => (
            <FixtureCard 
              key={fixture.id} 
              fixture={fixture}
              onEdit={onEditFixture}
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
                drills: session.drills
              }}
              fileUrls={{}}
              onAddDrillClick={() => {}}
              onEditDrillClick={() => {}}
              onDeleteSession={onDeleteSession}
            />
          ))}
          {(!sessions?.length && !fixtures?.length) && (
            <div className="text-center py-8 text-muted-foreground">
              No events scheduled for this date
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};