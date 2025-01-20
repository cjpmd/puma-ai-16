import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { EventsList } from "@/components/calendar/EventsList";
import { EditObjectiveDialog } from "@/components/calendar/EditObjectiveDialog";

type BaseEvent = {
  id: string;
  date: string;
  location?: string | null;
  category?: string;
  home_score?: number | null;
  away_score?: number | null;
  outcome?: string | null;
  format?: string | null;
  time?: string | null;
  is_friendly?: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

type Fixture = BaseEvent & {
  opponent: string;
  motm_player_id?: string | null;
  players?: { name: string }[] | null;
  event_type?: 'fixture';
};

type Tournament = BaseEvent & {
  number_of_teams: number;
  event_type: 'tournament';
  opponent: string;
};

type Festival = BaseEvent & {
  number_of_teams: number;
  event_type: 'festival';
  opponent: string;
};

type CalendarEvent = Fixture | Tournament | Festival;

export const CalendarPage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [isAddFixtureOpen, setIsAddFixtureOpen] = useState(false);
  const [isAddTournamentOpen, setIsAddTournamentOpen] = useState(false);
  const [isAddFestivalOpen, setIsAddFestivalOpen] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [editingFixture, setEditingFixture] = useState<any>(null);
  const [editingObjective, setEditingObjective] = useState<any>(null);
  const [isEditObjectiveOpen, setIsEditObjectiveOpen] = useState(false);

  const { toast } = useToast();

  const { data: sessions = [], refetch: refetchSessions } = useQuery({
    queryKey: ["training-sessions", date],
    queryFn: async () => {
      if (!date) return [];
      
      try {
        const { data, error } = await supabase
          .from("training_sessions")
          .select(`
            *,
            training_drills (
              *,
              training_files (*)
            )
          `)
          .eq("date", format(date, "yyyy-MM-dd"))
          .order("date", { ascending: true });

        if (error) {
          console.error("Error fetching training sessions:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load training sessions. Please try again.",
          });
          return [];
        }

        return data || [];
      } catch (error) {
        console.error("Error in training sessions query:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load training sessions. Please try again.",
        });
        return [];
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { data: fixtures = [], refetch: refetchFixtures } = useQuery<CalendarEvent[]>({
    queryKey: ["fixtures", date],
    queryFn: async () => {
      if (!date) return [];
      
      const dateStr = format(date, "yyyy-MM-dd");

      try {
        // Fetch fixtures
        const { data: fixturesData, error: fixturesError } = await supabase
          .from("fixtures")
          .select("*, players!fixtures_motm_player_id_fkey(name)")
          .eq("date", dateStr);

        if (fixturesError) throw fixturesError;

        // Fetch tournaments
        const { data: tournamentsData, error: tournamentsError } = await supabase
          .from("tournaments")
          .select("*")
          .eq("date", dateStr);

        if (tournamentsError) throw tournamentsError;

        // Fetch festivals
        const { data: festivalsData, error: festivalsError } = await supabase
          .from("festivals")
          .select("*")
          .eq("date", dateStr);

        if (festivalsError) throw festivalsError;

        // Transform tournaments
        const transformedTournaments = (tournamentsData || []).map(t => ({
          ...t,
          event_type: 'tournament' as const,
          opponent: `Tournament at ${t.location || 'TBD'}`,
          category: 'Tournament'
        }));

        // Transform festivals
        const transformedFestivals = (festivalsData || []).map(f => ({
          ...f,
          event_type: 'festival' as const,
          opponent: `Festival at ${f.location || 'TBD'}`,
          category: 'Festival'
        }));

        // Transform fixtures
        const transformedFixtures = (fixturesData || []).map(f => ({
          ...f,
          event_type: 'fixture' as const,
          players: f.players ? [f.players].flat() : []
        }));

        return [...transformedFixtures, ...transformedTournaments, ...transformedFestivals] as CalendarEvent[];
      } catch (error) {
        console.error("Error fetching calendar events:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load calendar events. Please try again.",
        });
        return [];
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const handleAddSession = async () => {
    try {
      if (!date) return;
      
      const { error } = await supabase
        .from("training_sessions")
        .insert([
          {
            title: sessionTitle,
            date: format(date, "yyyy-MM-dd"),
          },
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Training session added successfully",
      });
      setIsAddSessionOpen(false);
      setSessionTitle("");
      refetchSessions();
    } catch (error) {
      console.error("Error adding training session:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add training session",
      });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from("training_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Training session deleted successfully",
      });
      refetchSessions();
    } catch (error) {
      console.error("Error deleting training session:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete training session",
      });
    }
  };

  const handleDeleteFixture = async (fixtureId: string) => {
    try {
      // Find the event in our local state first
      const event = (fixtures as CalendarEvent[]).find(f => f.id === fixtureId);
      
      if (!event) {
        throw new Error("Event not found");
      }

      let deleteError;
      
      // Use the event_type from our transformed data to determine which table to delete from
      switch (event.event_type) {
        case 'tournament':
          const { error: tournamentError } = await supabase
            .from("tournaments")
            .delete()
            .eq("id", fixtureId);
          deleteError = tournamentError;
          break;
          
        case 'festival':
          const { error: festivalError } = await supabase
            .from("festivals")
            .delete()
            .eq("id", fixtureId);
          deleteError = festivalError;
          break;
          
        default:
          // Regular fixture
          const { error: fixtureError } = await supabase
            .from("fixtures")
            .delete()
            .eq("id", fixtureId);
          deleteError = fixtureError;
      }

      if (deleteError) {
        console.error("Error deleting event:", deleteError);
        throw deleteError;
      }

      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      refetchFixtures();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete event",
      });
    }
  };

  const handleUpdateFixtureDate = async (fixtureId: string, newDate: Date) => {
    try {
      // Find the event in our local state first
      const event = (fixtures as CalendarEvent[]).find(f => f.id === fixtureId);
      
      if (!event) {
        throw new Error("Event not found");
      }

      let updateError;
      const formattedDate = format(newDate, "yyyy-MM-dd");
      
      // Use the event_type from our transformed data to determine which table to update
      switch (event.event_type) {
        case 'tournament':
          const { error: tournamentError } = await supabase
            .from("tournaments")
            .update({ date: formattedDate })
            .eq("id", fixtureId);
          updateError = tournamentError;
          break;
          
        case 'festival':
          const { error: festivalError } = await supabase
            .from("festivals")
            .update({ date: formattedDate })
            .eq("id", fixtureId);
          updateError = festivalError;
          break;
          
        default:
          // Regular fixture
          const { error: fixtureError } = await supabase
            .from("fixtures")
            .update({ date: formattedDate })
            .eq("id", fixtureId);
          updateError = fixtureError;
      }

      if (updateError) {
        console.error("Error updating event date:", updateError);
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Event date updated successfully",
      });
      refetchFixtures();
    } catch (error) {
      console.error("Error updating event date:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update event date",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <CalendarHeader
        isAddSessionOpen={isAddSessionOpen}
        setIsAddSessionOpen={setIsAddSessionOpen}
        isAddFixtureOpen={isAddFixtureOpen}
        setIsAddFixtureOpen={setIsAddFixtureOpen}
        isAddTournamentOpen={isAddTournamentOpen}
        setIsAddTournamentOpen={setIsAddTournamentOpen}
        isAddFestivalOpen={isAddFestivalOpen}
        setIsAddFestivalOpen={setIsAddFestivalOpen}
        sessionTitle={sessionTitle}
        setSessionTitle={setSessionTitle}
        handleAddSession={handleAddSession}
        setEditingFixture={setEditingFixture}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CalendarGrid
          date={date}
          setDate={setDate}
          sessions={sessions || []}
          fixtures={fixtures}
        />

        <EventsList
          date={date}
          fixtures={fixtures}
          sessions={sessions || []}
          onDeleteSession={handleDeleteSession}
          onEditFixture={handleEditFixture}
          onDeleteFixture={handleDeleteFixture}
          onUpdateFixtureDate={handleUpdateFixtureDate}
        />
      </div>

      {editingObjective && (
        <EditObjectiveDialog
          objective={editingObjective}
          isOpen={isEditObjectiveOpen}
          onOpenChange={setIsEditObjectiveOpen}
          onSuccess={() => {
            setEditingObjective(null);
          }}
        />
      )}
    </div>
  );
};

export default CalendarPage;
