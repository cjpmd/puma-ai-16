
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { FestivalEvent } from "./FestivalEvent";
import { TournamentEvent } from "./TournamentEvent";
import { FixtureCard } from "@/components/calendar/FixtureCard";
import { SessionCard } from "@/components/training/SessionCard";
import type { Fixture } from "@/types/fixture";

interface EventsListProps {
  date: Date;
  festivals: any[];
  tournaments: any[];
  fixtures: Fixture[];
  sessions: any[];
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
  onEditTournament?: (tournament: any) => void;
  onDeleteTournament?: (tournamentId: string) => void;
  onTeamSelectionTournament?: (tournament: any) => void;
  onUpdateTournamentDate?: (tournamentId: string, newDate: Date) => void;
}

export const EventsList = ({
  date,
  festivals,
  tournaments,
  fixtures,
  sessions,
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
  onEditTournament,
  onDeleteTournament,
  onTeamSelectionTournament,
  onUpdateTournamentDate,
}: EventsListProps) => {
  const hasEvents = festivals?.length || tournaments?.length || fixtures?.length || sessions?.length;

  console.log("EventsList rendering fixtures:", fixtures?.map(f => f.id));
  console.log("EventsList rendering festivals:", festivals?.length);
  console.log("EventsList rendering tournaments:", tournaments?.length);

  // Convert string dates to Date objects
  const handleFixtureDateChange = (fixtureId: string, newDate: Date) => {
    onUpdateFixtureDate(fixtureId, newDate);
  };

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
            <FestivalEvent
              key={festival.id}
              festival={festival}
              onEdit={onEditFestival}
              onTeamSelection={onTeamSelectionFestival}
              onDelete={onDeleteFestival}
            />
          ))}
          
          {tournaments?.map((tournament) => (
            <TournamentEvent
              key={tournament.id}
              tournament={tournament}
              onEdit={onEditTournament}
              onTeamSelection={onTeamSelectionTournament}
              onDelete={onDeleteTournament}
              onDateChange={onUpdateTournamentDate}
            />
          ))}

          {fixtures?.map((fixture) => (
            <FixtureCard 
              key={fixture.id} 
              fixture={fixture}
              onEdit={() => {
                console.log("Calling onEditFixture for fixture:", fixture.id);
                onEditFixture(fixture);
              }}
              onDelete={onDeleteFixture}
              onDateChange={handleFixtureDateChange}
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
          
          {!hasEvents && (
            <div className="text-center py-16 text-muted-foreground min-h-[200px] flex items-center justify-center">
              No events scheduled for this date
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
