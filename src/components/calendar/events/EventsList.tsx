
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import type { Fixture } from "@/types/fixture";
import { useEventDeduplication } from "./hooks/useEventDeduplication";
import { FestivalsSection } from "./sections/FestivalsSection";
import { TournamentsSection } from "./sections/TournamentsSection";
import { FixturesSection } from "./sections/FixturesSection";
import { SessionsSection } from "./sections/SessionsSection";
import { EmptyEventsMessage } from "./sections/EmptyEventsMessage";

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
  // Add console logs to debug duplicate fixtures
  console.log("Raw fixture IDs in EventsList:", fixtures?.map(f => f.id));
  
  const {
    uniqueFixtures,
    uniqueFestivals,
    uniqueTournaments,
    uniqueSessions,
    hasEvents
  } = useEventDeduplication({
    fixtures,
    festivals,
    tournaments,
    sessions
  });

  console.log("EventsList rendering fixtures:", uniqueFixtures?.map(f => f.id));
  console.log("EventsList rendering festivals:", uniqueFestivals?.length);
  console.log("EventsList rendering tournaments:", uniqueTournaments?.length);

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>
          {date ? format(date, "EEEE, MMMM do, yyyy") : "Select a date"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <FestivalsSection 
            festivals={uniqueFestivals}
            onEditFestival={onEditFestival}
            onDeleteFestival={onDeleteFestival}
            onTeamSelectionFestival={onTeamSelectionFestival}
            onDateChange={onUpdateFixtureDate}
          />
          
          <TournamentsSection 
            tournaments={uniqueTournaments}
            onEditTournament={onEditTournament}
            onDeleteTournament={onDeleteTournament}
            onTeamSelectionTournament={onTeamSelectionTournament}
            onDateChange={onUpdateTournamentDate}
          />

          <FixturesSection 
            fixtures={uniqueFixtures}
            onEditFixture={onEditFixture}
            onDeleteFixture={onDeleteFixture}
            onUpdateFixtureDate={onUpdateFixtureDate}
          />
          
          <SessionsSection 
            sessions={uniqueSessions}
            fileUrls={fileUrls}
            onAddDrill={onAddDrill}
            onEditDrill={onEditDrill}
            onDeleteSession={onDeleteSession}
          />
          
          <EmptyEventsMessage hasEvents={hasEvents} />
        </div>
      </CardContent>
    </Card>
  );
};
