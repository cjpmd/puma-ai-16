
import { useAuth } from "@/hooks/useAuth";
import { DailyEvents } from "./DailyEvents";
import { useCalendarEventHandlers } from "./hooks/useCalendarEventHandlers";
import { TrainingCalendar } from "@/components/training/TrainingCalendar";

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
  const { profile } = useAuth();
  const {
    handleDeleteFixture,
    handleUpdateFixtureDate,
    handleDeleteSession,
    handleUpdateFestivalDate,
  } = useCalendarEventHandlers();

  if (!profile) {
    console.log("No profile found in CalendarContent");
    return null;
  }

  return (
    <div className="grid md:grid-cols-[300px,1fr] gap-8">
      <TrainingCalendar date={date} onDateSelect={setDate} />
      <DailyEvents
        date={date}
        fixtures={fixtures}
        sessions={sessions}
        festivals={festivals}
        tournaments={tournaments}
        fileUrls={fileUrls}
        onEditFixture={onEditFixture}
        onDeleteFixture={handleDeleteFixture}
        onUpdateFixtureDate={handleUpdateFixtureDate}
        onAddDrill={(sessionId) => {
          console.log("Add drill to session:", sessionId);
        }}
        onEditDrill={(sessionId, drill) => {
          console.log("Edit drill:", sessionId, drill);
        }}
        onDeleteSession={handleDeleteSession}
        onEditFestival={onEditFestival}
        onTeamSelectionFestival={onTeamSelectionFestival}
        onUpdateFestivalDate={handleUpdateFestivalDate}
      />
    </div>
  );
};
