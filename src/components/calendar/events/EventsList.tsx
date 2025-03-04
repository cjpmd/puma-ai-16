
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { FestivalEvent } from "./FestivalEvent";
import { TournamentEvent } from "./TournamentEvent";
import { FixtureCard } from "@/components/calendar/FixtureCard";
import { SessionCard } from "@/components/training/SessionCard";
import type { Fixture } from "@/types/fixture";
import { useMemo } from "react";

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
  // Use useMemo to deduplicate fixtures by ID
  const uniqueFixtures = useMemo(() => {
    if (!fixtures?.length) return [];
    
    const fixtureIds = new Set();
    const deduplicatedFixtures = [];
    
    // Only add each fixture once, based on its ID
    fixtures.forEach(fixture => {
      if (!fixtureIds.has(fixture.id)) {
        fixtureIds.add(fixture.id);
        deduplicatedFixtures.push(fixture);
      }
    });
    
    return deduplicatedFixtures;
  }, [fixtures]);

  // Also deduplicate festivals and tournaments to be safe
  const uniqueFestivals = useMemo(() => {
    if (!festivals?.length) return [];
    const festivalIds = new Set();
    const deduplicatedFestivals = [];
    
    festivals.forEach(festival => {
      if (!festivalIds.has(festival.id)) {
        festivalIds.add(festival.id);
        deduplicatedFestivals.push(festival);
      }
    });
    
    return deduplicatedFestivals;
  }, [festivals]);

  const uniqueTournaments = useMemo(() => {
    if (!tournaments?.length) return [];
    const tournamentIds = new Set();
    const deduplicatedTournaments = [];
    
    tournaments.forEach(tournament => {
      if (!tournamentIds.has(tournament.id)) {
        tournamentIds.add(tournament.id);
        deduplicatedTournaments.push(tournament);
      }
    });
    
    return deduplicatedTournaments;
  }, [tournaments]);

  // Also deduplicate sessions to be consistent
  const uniqueSessions = useMemo(() => {
    if (!sessions?.length) return [];
    const sessionIds = new Set();
    const deduplicatedSessions = [];
    
    sessions.forEach(session => {
      if (!sessionIds.has(session.id)) {
        sessionIds.add(session.id);
        deduplicatedSessions.push(session);
      }
    });
    
    return deduplicatedSessions;
  }, [sessions]);

  const hasEvents = uniqueFestivals?.length || uniqueTournaments?.length || uniqueFixtures?.length || uniqueSessions?.length;

  console.log("EventsList rendering fixtures:", uniqueFixtures?.map(f => f.id));
  console.log("EventsList rendering festivals:", uniqueFestivals?.length);
  console.log("EventsList rendering tournaments:", uniqueTournaments?.length);

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
          {uniqueFestivals?.map((festival) => (
            <FestivalEvent
              key={festival.id}
              festival={festival}
              onEdit={onEditFestival}
              onTeamSelection={onTeamSelectionFestival}
              onDelete={onDeleteFestival}
            />
          ))}
          
          {uniqueTournaments?.map((tournament) => (
            <TournamentEvent
              key={tournament.id}
              tournament={tournament}
              onEdit={onEditTournament}
              onTeamSelection={onTeamSelectionTournament}
              onDelete={onDeleteTournament}
              onDateChange={onUpdateTournamentDate}
            />
          ))}

          {uniqueFixtures?.map((fixture) => (
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
          
          {uniqueSessions?.map((session) => (
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
