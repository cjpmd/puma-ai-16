import { format } from "date-fns";
import { EventsList } from "@/components/calendar/events/EventsList";
import { CalendarSection } from "@/components/calendar/CalendarSection";
import { useCalendarContentState } from "@/components/calendar/hooks/useCalendarContentState";
import { useContentEventHandlers } from "@/components/calendar/hooks/useContentEventHandlers";

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
  // Use the extracted hook for state management
  const {
    localFixtures,
    setLocalFixtures,
    localFestivals,
    setLocalFestivals,
    localTournaments,
    setLocalTournaments
  } = useCalendarContentState({
    fixtures,
    festivals,
    tournaments,
    onRefetchFixtures,
    onRefetchFestivals,
    onRefetchTournaments
  });

  // Use the extracted hook for event handlers
  const {
    handleFixtureDelete,
    handleFixtureEdit,
    handleFestivalDelete,
    handleTournamentDelete,
    handleFixtureDateChange,
    handleSessionDelete,
    handleUpdateTournamentDate
  } = useContentEventHandlers({
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
  });

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <CalendarSection
        date={date}
        setDate={setDate}
        objectives={objectives}
        onEditObjective={onEditObjective}
      />

      <EventsList
        date={date}
        festivals={localFestivals}
        tournaments={localTournaments}
        fixtures={localFixtures}
        sessions={sessions}
        fileUrls={fileUrls}
        onEditFixture={(fixture) => handleFixtureEdit(fixture, onEditFixture)}
        onDeleteFixture={handleFixtureDelete}
        onUpdateFixtureDate={handleFixtureDateChange}
        onAddDrill={(sessionId) => {
          // Handle add drill logic
        }}
        onEditDrill={(sessionId, drill) => {
          // Handle edit drill logic
        }}
        onDeleteSession={handleSessionDelete}
        onEditFestival={onEditFestival}
        onDeleteFestival={(festivalId) => handleFestivalDelete(festivalId, festivals)}
        onTeamSelectionFestival={onTeamSelectionFestival}
        onEditTournament={onEditTournament}
        onDeleteTournament={(tournamentId) => handleTournamentDelete(tournamentId, tournaments)}
        onTeamSelectionTournament={onTeamSelectionTournament}
        onUpdateTournamentDate={handleUpdateTournamentDate}
      />
    </div>
  );
};
