import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { EventsList } from "@/components/calendar/EventsList";
import { EditObjectiveDialog } from "@/components/calendar/EditObjectiveDialog";

// Define types for our fixtures
type BaseEvent = {
  id: string;
  date: string;
  location?: string;
  category?: string;
  home_score?: number;
  away_score?: number;
  outcome?: string;
  format?: string;
  time?: string;
  is_friendly?: boolean;
  created_at: string;
  updated_at: string;
};

type Fixture = BaseEvent & {
  opponent: string;
  motm_player_id?: string;
  players?: { name: string }[];
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

  const { data: sessions, refetch: refetchSessions } = useQuery({
    queryKey: ["training-sessions", date],
    queryFn: async () => {
      if (!date) return [];
      
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

      if (error) throw error;
      return data || [];
    },
  });

  const { data: fixtures, refetch: refetchFixtures } = useQuery<CalendarEvent[]>({
    queryKey: ["fixtures", date],
    queryFn: async () => {
      if (!date) return [];
      
      const dateStr = format(date, "yyyy-MM-dd");

      const { data: fixturesData, error: fixturesError } = await supabase
        .from("fixtures")
        .select("*, players!fixtures_motm_player_id_fkey(name)")
        .eq("date", dateStr);

      if (fixturesError) throw fixturesError;

      const { data: tournamentsData, error: tournamentsError } = await supabase
        .from("tournaments")
        .select("*")
        .eq("date", dateStr);

      if (tournamentsError) throw tournamentsError;

      const { data: festivalsData, error: festivalsError } = await supabase
        .from("festivals")
        .select("*")
        .eq("date", dateStr);

      if (festivalsError) throw festivalsError;

      const transformedTournaments = (tournamentsData || []).map(t => ({
        ...t,
        event_type: 'tournament' as const,
        opponent: `Tournament at ${t.location}`,
        category: 'Tournament'
      }));

      const transformedFestivals = (festivalsData || []).map(f => ({
        ...f,
        event_type: 'festival' as const,
        opponent: `Festival at ${f.location}`,
        category: 'Festival'
      }));

      // Add event_type to fixtures
      const transformedFixtures = (fixturesData || []).map(f => ({
        ...f,
        event_type: 'fixture' as const
      }));

      return [...transformedFixtures, ...transformedTournaments, ...transformedFestivals];
    },
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
      const event = fixtures?.find(f => f.id === fixtureId);
      
      if (!event) {
        throw new Error("Event not found");
      }

      let deleteError;
      
      if (event.event_type === 'tournament') {
        const { error } = await supabase
          .from("tournaments")
          .delete()
          .eq("id", fixtureId);
        deleteError = error;
      } else if (event.event_type === 'festival') {
        const { error } = await supabase
          .from("festivals")
          .delete()
          .eq("id", fixtureId);
        deleteError = error;
      } else {
        // Regular fixture
        const { error } = await supabase
          .from("fixtures")
          .delete()
          .eq("id", fixtureId);
        deleteError = error;
      }

      if (deleteError) throw deleteError;

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
      const { error } = await supabase
        .from("fixtures")
        .update({
          date: format(newDate, "yyyy-MM-dd"),
        })
        .eq("id", fixtureId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fixture date updated successfully",
      });
      refetchFixtures();
    } catch (error) {
      console.error("Error updating fixture date:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update fixture date",
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
          sessions={sessions}
          fixtures={fixtures}
        />

        <EventsList
          date={date}
          fixtures={fixtures}
          sessions={sessions}
          onDeleteSession={handleDeleteSession}
          onEditFixture={(fixture) => {
            setEditingFixture(fixture);
            setIsAddFixtureOpen(true);
          }}
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
