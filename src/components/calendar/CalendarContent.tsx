
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { EventsList } from "@/components/calendar/events/EventsList";
import { ObjectivesList } from "@/components/calendar/ObjectivesList";
import { useCalendarEventHandlers } from "@/components/calendar/hooks/useCalendarEventHandlers";
import { useState, useEffect } from "react";

interface CalendarContentProps {
  date: Date;
  setDate: (date: Date) => void;
  sessions: any[];
  fixtures: any[];
  festivals: any[];
  tournaments: any[];
  objectives: any[];
  fileUrls: Record<string, string>;
  onEditFixture: (fixture: any) => void;
  onEditFestival: (festival: any) => void;
  onTeamSelectionFestival: (festival: any) => void;
  onRefetchFixtures: () => void;
  onRefetchSessions: () => void;
  onRefetchFestivals: () => void;
  onEditTournament?: (tournament: any) => void;
  onTeamSelectionTournament?: (tournament: any) => void;
  onRefetchTournaments?: () => void;
  onEditObjective?: (objective: any) => void;
}

export const CalendarContent = ({
  date,
  setDate,
  sessions,
  fixtures,
  festivals,
  tournaments,
  objectives,
  fileUrls,
  onEditFixture,
  onEditFestival,
  onTeamSelectionFestival,
  onRefetchFixtures,
  onRefetchSessions,
  onRefetchFestivals,
  onEditTournament,
  onTeamSelectionTournament,
  onRefetchTournaments,
  onEditObjective
}: CalendarContentProps) => {
  const {
    handleDeleteFixture,
    handleUpdateFixtureDate,
    handleDeleteSession,
    handleUpdateFestivalDate,
    handleDeleteFestival,
    handleDeleteTournament,
    handleUpdateTournamentDate
  } = useCalendarEventHandlers();
  
  // Add a local state to ensure we can force updates
  const [localFixtures, setLocalFixtures] = useState(fixtures);
  const [localFestivals, setLocalFestivals] = useState(festivals);
  const [localTournaments, setLocalTournaments] = useState(tournaments);
  
  // Update local state when props change
  useEffect(() => {
    setLocalFixtures(fixtures);
    setLocalFestivals(festivals);
    setLocalTournaments(tournaments);
  }, [fixtures, festivals, tournaments]);

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

  const handleFixtureEdit = (fixture: any) => {
    console.log("Handling fixture edit in CalendarContent for fixture:", fixture.id);
    onEditFixture(fixture);
  };

  const handleFestivalDelete = async (festivalId: string) => {
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

  const handleTournamentDelete = async (tournamentId: string) => {
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

  // Default handler for objective editing if none is provided
  const handleEditObjective = (objective: any) => {
    if (onEditObjective) {
      onEditObjective(objective);
    } else {
      console.log("Edit objective handler not provided", objective);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => newDate && setDate(newDate)}
          className="rounded-md border shadow"
        />
        <ObjectivesList 
          date={date}
          objectives={objectives} 
          onEditObjective={handleEditObjective} 
        />
      </div>

      <EventsList
        date={date}
        festivals={localFestivals}
        tournaments={localTournaments}
        fixtures={localFixtures}
        sessions={sessions}
        fileUrls={fileUrls}
        onEditFixture={handleFixtureEdit}
        onDeleteFixture={handleFixtureDelete}
        onUpdateFixtureDate={handleUpdateFixtureDate}
        onAddDrill={(sessionId) => {
          // Handle add drill logic
        }}
        onEditDrill={(sessionId, drill) => {
          // Handle edit drill logic
        }}
        onDeleteSession={async (sessionId) => {
          const success = await handleDeleteSession(sessionId);
          if (success) {
            onRefetchSessions();
          }
        }}
        onEditFestival={onEditFestival}
        onDeleteFestival={handleFestivalDelete}
        onTeamSelectionFestival={onTeamSelectionFestival}
        onEditTournament={onEditTournament}
        onDeleteTournament={handleTournamentDelete}
        onTeamSelectionTournament={onTeamSelectionTournament}
        onUpdateTournamentDate={handleUpdateTournamentDate}
      />
    </div>
  );
};
