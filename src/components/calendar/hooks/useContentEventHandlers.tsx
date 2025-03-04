
import { useCalendarEventHandlers } from "@/components/calendar/hooks/useCalendarEventHandlers";

interface UseContentEventHandlersProps {
  localFixtures: any[];
  setLocalFixtures: (fixtures: any[]) => void;
  localFestivals: any[];
  setLocalFestivals: (festivals: any[]) => void;
  localTournaments: any[];
  setLocalTournaments: (tournaments: any[]) => void;
  onRefetchFixtures: () => void;
  onRefetchSessions: () => void;
  onRefetchFestivals: () => void;
  onRefetchTournaments?: () => void;
  fixtures: any[];
}

export const useContentEventHandlers = ({
  localFixtures,
  setLocalFixtures,
  localFestivals,
  setLocalFestivals,
  localTournaments,
  setLocalTournaments,
  onRefetchFixtures,
  onRefetchSessions,
  onRefetchFestivals,
  onRefetchTournaments,
  fixtures
}: UseContentEventHandlersProps) => {
  const {
    handleDeleteFixture,
    handleUpdateFixtureDate,
    handleDeleteSession,
    handleUpdateFestivalDate,
    handleDeleteFestival,
    handleDeleteTournament,
    handleUpdateTournamentDate
  } = useCalendarEventHandlers();

  const handleFixtureDelete = async (fixtureId: string) => {
    // Optimistic UI update - remove the fixture immediately
    setLocalFixtures((prevFixtures) => 
      prevFixtures.filter((fixture) => fixture.id !== fixtureId)
    );
    
    const success = await handleDeleteFixture(fixtureId);
    if (success) {
      // Refetch to ensure data is up to date
      onRefetchFixtures();
    } else {
      // If failed, revert the optimistic update
      setLocalFixtures(fixtures);
    }
  };

  const handleFixtureEdit = (fixture: any, onEditFixture: (fixture: any) => void) => {
    console.log("Handling fixture edit in CalendarContent for fixture:", fixture.id);
    onEditFixture(fixture);
  };

  const handleFestivalDelete = async (festivalId: string, festivals: any[]) => {
    // Optimistic UI update
    setLocalFestivals((prevFestivals) => 
      prevFestivals.filter((festival) => festival.id !== festivalId)
    );
    
    const success = await handleDeleteFestival(festivalId);
    if (success) {
      onRefetchFestivals();
    } else {
      setLocalFestivals(festivals);
    }
  };

  const handleTournamentDelete = async (tournamentId: string, tournaments: any[]) => {
    // Optimistic UI update
    setLocalTournaments((prevTournaments) => 
      prevTournaments.filter((tournament) => tournament.id !== tournamentId)
    );
    
    const success = await handleDeleteTournament(tournamentId);
    if (success && onRefetchTournaments) {
      onRefetchTournaments();
    } else {
      setLocalTournaments(tournaments);
    }
  };

  // Handle fixture date change with optimistic update
  const handleFixtureDateChange = async (fixtureId: string, newDate: Date) => {
    // Create an optimistic update for the fixture date
    const updatedFixtures = localFixtures.filter(fixture => fixture.id !== fixtureId);
    setLocalFixtures(updatedFixtures);
    
    // Call the real update function
    await handleUpdateFixtureDate(fixtureId, newDate);
    
    // Refresh the data
    onRefetchFixtures();
  };

  const handleSessionDelete = async (sessionId: string) => {
    const success = await handleDeleteSession(sessionId);
    if (success) {
      onRefetchSessions();
    }
  };

  return {
    handleFixtureDelete,
    handleFixtureEdit,
    handleFestivalDelete,
    handleTournamentDelete,
    handleFixtureDateChange,
    handleSessionDelete,
    handleUpdateTournamentDate
  };
};
