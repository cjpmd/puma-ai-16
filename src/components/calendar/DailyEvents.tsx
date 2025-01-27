import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EventsList } from "./events/EventsList";
import type { Fixture } from "@/types/fixture";

interface DailyEventsProps {
  date: Date;
  fixtures: Fixture[];
  sessions: any[];
  festivals: any[];
  tournaments: any[];
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

export const DailyEvents = ({
  date,
  fixtures,
  sessions,
  festivals,
  tournaments,
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
}: DailyEventsProps) => {
  const { toast } = useToast();

  const handleDeleteFestival = async (festivalId: string) => {
    try {
      const { error } = await supabase
        .from("festivals")
        .delete()
        .eq("id", festivalId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Festival deleted successfully",
      });
      
      onDeleteFestival?.(festivalId);
    } catch (error) {
      console.error("Error deleting festival:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete festival",
      });
    }
  };

  const handleDeleteTournament = async (tournamentId: string) => {
    try {
      const { error } = await supabase
        .from("tournaments")
        .delete()
        .eq("id", tournamentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tournament deleted successfully",
      });
      
      onDeleteTournament?.(tournamentId);
    } catch (error) {
      console.error("Error deleting tournament:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete tournament",
      });
    }
  };

  return (
    <EventsList
      date={date}
      festivals={festivals}
      tournaments={tournaments}
      fixtures={fixtures}
      sessions={sessions}
      fileUrls={fileUrls}
      onEditFixture={onEditFixture}
      onDeleteFixture={onDeleteFixture}
      onUpdateFixtureDate={onUpdateFixtureDate}
      onAddDrill={onAddDrill}
      onEditDrill={onEditDrill}
      onDeleteSession={onDeleteSession}
      onEditFestival={onEditFestival}
      onDeleteFestival={handleDeleteFestival}
      onTeamSelectionFestival={onTeamSelectionFestival}
      onEditTournament={onEditTournament}
      onDeleteTournament={handleDeleteTournament}
      onTeamSelectionTournament={onTeamSelectionTournament}
      onUpdateTournamentDate={onUpdateTournamentDate}
      onUpdateFestivalDate={onUpdateFestivalDate}
    />
  );
};