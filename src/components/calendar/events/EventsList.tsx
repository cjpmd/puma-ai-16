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
  onUpdateFestivalDate?: (festivalId: string, newDate: Date) => void;
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
  onUpdateFestivalDate,
}: EventsListProps) => {
  const hasEvents = festivals?.length || tournaments?.length || fixtures?.length || sessions?.length;

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
              onDateChange={onUpdateFestivalDate}
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
          
          {!hasEvents && (
            <div className="text-center py-8 text-muted-foreground">
              No events scheduled for this date
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};