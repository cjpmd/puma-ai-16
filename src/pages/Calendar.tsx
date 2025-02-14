
import { useToast } from "@/hooks/use-toast";
import { useCalendarData } from "@/hooks/useCalendarData";
import { useCalendarState } from "@/components/calendar/hooks/useCalendarState";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarContent } from "@/components/calendar/CalendarContent";
import { CalendarDialogs } from "@/components/calendar/CalendarDialogs";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export const CalendarPage = () => {
  const { toast } = useToast();
  const { profile, isLoading: authLoading } = useAuth();
  const calendarState = useCalendarState();
  const {
    sessions,
    fixtures,
    festivals,
    tournaments,
    objectives,
    refetchSessions,
    refetchFixtures,
    refetchFestivals,
    refetchTournaments,
    refetchObjectives,
    isLoading: dataLoading,
  } = useCalendarData(calendarState.date);

  console.log("Calendar state:", {
    authLoading,
    dataLoading,
    profile,
    sessions,
    fixtures,
    festivals,
    tournaments,
    objectives,
  });

  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <CalendarHeader
        isAddMenuOpen={calendarState.isAddMenuOpen}
        onAddMenuOpenChange={calendarState.setIsAddMenuOpen}
        onAddFixture={() => calendarState.setIsAddFixtureOpen(true)}
        onAddFriendly={() => calendarState.setIsAddFriendlyOpen(true)}
        onAddTournament={() => calendarState.setIsAddTournamentOpen(true)}
        onAddFestival={() => calendarState.setIsAddFestivalOpen(true)}
      />

      <CalendarContent
        date={calendarState.date}
        setDate={calendarState.setDate}
        sessions={sessions || []}
        fixtures={fixtures || []}
        festivals={festivals || []}
        tournaments={tournaments || []}
        objectives={objectives || []}
        fileUrls={calendarState.fileUrls}
        onEditFixture={(fixture) => {
          calendarState.setEditingFixture(fixture);
          calendarState.setIsAddFixtureOpen(true);
        }}
        onEditFestival={(festival) => {
          calendarState.setEditingFestival(festival);
          calendarState.setIsAddFestivalOpen(true);
        }}
        onTeamSelectionFestival={(festival) => {
          calendarState.setEditingFestival(festival);
          calendarState.setIsTeamSelectionOpen(true);
        }}
        onRefetchFixtures={refetchFixtures}
        onRefetchSessions={refetchSessions}
        onRefetchFestivals={refetchFestivals}
      />

      <CalendarDialogs
        date={calendarState.date}
        isAddFixtureOpen={calendarState.isAddFixtureOpen}
        setIsAddFixtureOpen={calendarState.setIsAddFixtureOpen}
        isAddFriendlyOpen={calendarState.isAddFriendlyOpen}
        setIsAddFriendlyOpen={calendarState.setIsAddFriendlyOpen}
        isAddFestivalOpen={calendarState.isAddFestivalOpen}
        setIsAddFestivalOpen={calendarState.setIsAddFestivalOpen}
        isAddTournamentOpen={calendarState.isAddTournamentOpen}
        setIsAddTournamentOpen={calendarState.setIsAddTournamentOpen}
        isTeamSelectionOpen={calendarState.isTeamSelectionOpen}
        setIsTeamSelectionOpen={calendarState.setIsTeamSelectionOpen}
        editingFixture={calendarState.editingFixture}
        setEditingFixture={calendarState.setEditingFixture}
        editingFestival={calendarState.editingFestival}
        setEditingFestival={calendarState.setEditingFestival}
        editingTournament={calendarState.editingTournament}
        setEditingTournament={calendarState.setEditingTournament}
        onRefetchFixtures={refetchFixtures}
        onRefetchFestivals={refetchFestivals}
        onRefetchTournaments={refetchTournaments}
      />
    </div>
  );
};
