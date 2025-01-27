import { CalendarView } from "./CalendarView";
import { DailyEvents } from "./DailyEvents";
import { ObjectivesList } from "./ObjectivesList";
import { useCalendarEventHandlers } from "./CalendarEventHandlers";
import type { Fixture } from "@/types/fixture";

interface CalendarContentProps {
  date: Date;
  setDate: (date: Date) => void;
  sessions: any[];
  fixtures: any[];
  festivals: any[];
  tournaments: any[];
  objectives: any[];
  fileUrls: Record<string, string>;
  onEditFixture: (fixture: Fixture) => void;
  onEditFestival: (festival: any) => void;
  onTeamSelectionFestival: (festival: any) => void;
  onRefetchFixtures: () => void;
  onRefetchSessions: () => void;
  onRefetchFestivals: () => void;
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
}: CalendarContentProps) => {
  const {
    handleDeleteFixture,
    handleUpdateFixtureDate,
    handleDeleteSession,
    handleUpdateFestivalDate,
  } = useCalendarEventHandlers();

  const handleAddDrill = (sessionId: string) => {
    console.log("Adding drill to session:", sessionId);
  };

  const handleEditDrill = (sessionId: string, drill: any) => {
    console.log("Editing drill:", drill, "in session:", sessionId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <CalendarView
        date={date}
        onDateSelect={(newDate) => newDate && setDate(newDate)}
        sessions={sessions}
        fixtures={fixtures}
        festivals={festivals}
        tournaments={tournaments}
      />

      <DailyEvents
        date={date}
        fixtures={fixtures}
        sessions={sessions}
        festivals={festivals}
        tournaments={tournaments}
        fileUrls={fileUrls}
        onEditFixture={onEditFixture}
        onDeleteFixture={async (fixtureId) => {
          const success = await handleDeleteFixture(fixtureId);
          if (success) onRefetchFixtures();
        }}
        onUpdateFixtureDate={async (fixtureId, newDate) => {
          const success = await handleUpdateFixtureDate(fixtureId, newDate);
          if (success) onRefetchFixtures();
        }}
        onAddDrill={handleAddDrill}
        onEditDrill={handleEditDrill}
        onDeleteSession={async (sessionId) => {
          const success = await handleDeleteSession(sessionId);
          if (success) onRefetchSessions();
        }}
        onEditFestival={onEditFestival}
        onDeleteFestival={async () => {
          onRefetchFestivals();
        }}
        onTeamSelectionFestival={onTeamSelectionFestival}
        onUpdateFestivalDate={async (festivalId, newDate) => {
          const success = await handleUpdateFestivalDate(festivalId, newDate);
          if (success) onRefetchFestivals();
        }}
      />

      <ObjectivesList
        date={date}
        objectives={objectives}
        onEditObjective={() => {}}
      />
    </div>
  );
};