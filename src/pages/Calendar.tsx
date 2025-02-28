
import { useToast } from "@/hooks/use-toast";
import { useCalendarData } from "@/hooks/useCalendarData";
import { useCalendarState } from "@/components/calendar/hooks/useCalendarState";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarContent } from "@/components/calendar/CalendarContent";
import { CalendarDialogs } from "@/components/calendar/CalendarDialogs";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export const CalendarPage = () => {
  const { toast } = useToast();
  const { profile, isLoading: authLoading } = useAuth();
  const calendarState = useCalendarState();
  const queryClient = useQueryClient();
  
  const {
    sessions = [],
    fixtures = [],
    festivals = [],
    tournaments = [],
    objectives = [],
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground">Please log in to view the calendar.</p>
        </div>
      </div>
    );
  }

  const handleDataUpdate = () => {
    const formattedDate = calendarState.date.toISOString().split('T')[0];
    queryClient.invalidateQueries({ queryKey: ["fixtures", formattedDate] });
    queryClient.invalidateQueries({ queryKey: ["festivals", formattedDate] });
    queryClient.invalidateQueries({ queryKey: ["tournaments", formattedDate] });
    queryClient.invalidateQueries({ queryKey: ["training-sessions", formattedDate] });
    queryClient.invalidateQueries({ queryKey: ["objectives", formattedDate] });
    
    refetchFixtures();
    refetchFestivals();
    refetchTournaments();
    refetchSessions();
    refetchObjectives();
  };

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
        sessions={sessions}
        fixtures={fixtures}
        festivals={festivals}
        tournaments={tournaments}
        objectives={objectives}
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
        setIsAddFixtureOpen={(isOpen) => {
          calendarState.setIsAddFixtureOpen(isOpen);
          // Refresh data when modal closes
          if (!isOpen) {
            handleDataUpdate();
          }
        }}
        isAddFriendlyOpen={calendarState.isAddFriendlyOpen}
        setIsAddFriendlyOpen={(isOpen) => {
          calendarState.setIsAddFriendlyOpen(isOpen);
          // Refresh data when modal closes
          if (!isOpen) {
            handleDataUpdate();
          }
        }}
        isAddFestivalOpen={calendarState.isAddFestivalOpen}
        setIsAddFestivalOpen={(isOpen) => {
          calendarState.setIsAddFestivalOpen(isOpen);
          // Refresh data when modal closes
          if (!isOpen) {
            handleDataUpdate();
          }
        }}
        isAddTournamentOpen={calendarState.isAddTournamentOpen}
        setIsAddTournamentOpen={(isOpen) => {
          calendarState.setIsAddTournamentOpen(isOpen);
          // Refresh data when modal closes
          if (!isOpen) {
            handleDataUpdate();
          }
        }}
        isTeamSelectionOpen={calendarState.isTeamSelectionOpen}
        setIsTeamSelectionOpen={(isOpen) => {
          calendarState.setIsTeamSelectionOpen(isOpen);
          // Refresh data when modal closes
          if (!isOpen) {
            handleDataUpdate();
          }
        }}
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
