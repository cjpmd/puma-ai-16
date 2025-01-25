import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FixtureCard } from "@/components/calendar/FixtureCard";
import { SessionCard } from "@/components/training/SessionCard";
import { Fixture } from "@/types/fixture";

interface DailyEventsProps {
  date: Date;
  fixtures: Fixture[];
  sessions: any[];
  fileUrls: Record<string, string>;
  onEditFixture: (fixture: Fixture) => void;
  onDeleteFixture: (fixtureId: string) => void;
  onUpdateFixtureDate: (fixtureId: string, newDate: Date) => void;
  onAddDrill: (sessionId: string) => void;
  onEditDrill: (sessionId: string, drill: any) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const DailyEvents = ({
  date,
  fixtures,
  sessions,
  fileUrls,
  onEditFixture,
  onDeleteFixture,
  onUpdateFixtureDate,
  onAddDrill,
  onEditDrill,
  onDeleteSession,
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