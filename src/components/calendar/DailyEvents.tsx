import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FixtureCard } from "@/components/calendar/FixtureCard";
import { SessionCard } from "@/components/training/SessionCard";
import { FestivalEvent } from "./events/FestivalEvent";
import { TournamentEvent } from "./events/TournamentEvent";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>
          {date ? format(date, "EEEE, MMMM do, yyyy") : "Select a date"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {festivals?.map((festival) => (
            <FestivalEvent
              key={festival.id}
              festival={festival}
              onEdit={onEditFestival}
              onTeamSelection={onTeamSelectionFestival}
              onDelete={handleDeleteFestival}
            />
          ))}
          
          {tournaments?.map((tournament) => (
            <TournamentEvent
              key={tournament.id}
              tournament={tournament}
              onEdit={onEditTournament}
              onTeamSelection={onTeamSelectionTournament}
              onDelete={handleDeleteTournament}
              onDateChange={onUpdateTournamentDate}
            />
          ))}

          {fixtures?.map((fixture) => (
            <FixtureCard 
              key={fixture.id} 
              fixture={fixture}
              onEdit={() => onEditFixture(fixture)}
              onDelete={onDeleteFixture}
              onDateChange={(newDate) => onUpdateFixtureDate(fixture.id, newDate)}
            />
          ))}
          
          {sessions?.map((session) => (
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
          
          {(!sessions?.length && !fixtures?.length && !festivals?.length && !tournaments?.length) && (
            <div className="text-center py-8 text-muted-foreground">
              No events scheduled for this date
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};