
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export const useCalendarData = (date: Date) => {
  const { toast } = useToast();
  const formattedDate = format(date, "yyyy-MM-dd");

  console.log("Starting to fetch calendar data for date:", formattedDate);

  const { data: sessions, refetch: refetchSessions } = useQuery({
    queryKey: ["training-sessions", formattedDate],
    queryFn: async () => {
      console.log("Fetching training sessions...");
      try {
        const { data, error } = await supabase
          .from("training_sessions")
          .select("*, training_drills(*, training_files(*))")
          .eq("date", formattedDate);
        
        if (error) {
          console.error("Error in training sessions query:", error);
          throw error;
        }
        console.log("Training sessions fetched successfully:", data);
        return data || [];
      } catch (error) {
        console.error("Error fetching sessions:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load training sessions. Please try again.",
        });
        return [];
      }
    },
    retry: false
  });

  const { data: fixtures, refetch: refetchFixtures } = useQuery({
    queryKey: ["fixtures", formattedDate],
    queryFn: async () => {
      console.log("Fetching fixtures...");
      try {
        // First get fixtures for the date
        const { data: fixturesData, error: fixturesError } = await supabase
          .from("fixtures")
          .select("*")
          .eq("date", formattedDate);
        
        if (fixturesError) {
          console.error("Error in fixtures query:", fixturesError);
          throw fixturesError;
        }
        console.log("Fixtures fetched successfully:", fixturesData);
        if (!fixturesData?.length) return [];

        // Then get attendance only for those specific fixtures
        const fixtureIds = fixturesData.map(f => f.id);
        console.log("Fetching attendance for fixture IDs:", fixtureIds);
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("event_attendance")
          .select("status, player_id, responded_by, event_id")
          .eq("event_type", "FIXTURE")
          .in("event_id", fixtureIds);

        if (attendanceError) {
          console.error("Error in attendance query:", attendanceError);
          throw attendanceError;
        }
        console.log("Attendance data fetched successfully:", attendanceData);
        
        return fixturesData.map(fixture => ({
          ...fixture,
          event_attendance: (attendanceData || []).filter(a => a.event_id === fixture.id)
        }));
      } catch (error) {
        console.error("Error fetching fixtures:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load fixtures. Please try again.",
        });
        return [];
      }
    },
    retry: false
  });

  const { data: festivals, refetch: refetchFestivals } = useQuery({
    queryKey: ["festivals", formattedDate],
    queryFn: async () => {
      console.log("Fetching festivals...");
      try {
        // First get festivals for the date
        const { data: festivalsData, error: festivalsError } = await supabase
          .from("festivals")
          .select("*")
          .eq("date", formattedDate);
        
        if (festivalsError) {
          console.error("Error in festivals query:", festivalsError);
          throw festivalsError;
        }
        console.log("Festivals fetched successfully:", festivalsData);
        if (!festivalsData?.length) return [];

        // Then get attendance only for those specific festivals
        const festivalIds = festivalsData.map(f => f.id);
        console.log("Fetching attendance for festival IDs:", festivalIds);
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("event_attendance")
          .select("status, player_id, responded_by, event_id")
          .eq("event_type", "FESTIVAL")
          .in("event_id", festivalIds);

        if (attendanceError) {
          console.error("Error in attendance query:", attendanceError);
          throw attendanceError;
        }
        console.log("Festival attendance data fetched successfully:", attendanceData);
        
        return festivalsData.map(festival => ({
          ...festival,
          event_attendance: (attendanceData || []).filter(a => a.event_id === festival.id)
        }));
      } catch (error) {
        console.error("Error fetching festivals:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load festivals. Please try again.",
        });
        return [];
      }
    },
    retry: false
  });

  const { data: tournaments, refetch: refetchTournaments } = useQuery({
    queryKey: ["tournaments", formattedDate],
    queryFn: async () => {
      console.log("Fetching tournaments...");
      try {
        // First get tournaments for the date
        const { data: tournamentsData, error: tournamentsError } = await supabase
          .from("tournaments")
          .select("*")
          .eq("date", formattedDate);
        
        if (tournamentsError) {
          console.error("Error in tournaments query:", tournamentsError);
          throw tournamentsError;
        }
        console.log("Tournaments fetched successfully:", tournamentsData);
        if (!tournamentsData?.length) return [];

        // Then get attendance only for those specific tournaments
        const tournamentIds = tournamentsData.map(t => t.id);
        console.log("Fetching attendance for tournament IDs:", tournamentIds);
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("event_attendance")
          .select("status, player_id, responded_by, event_id")
          .eq("event_type", "TOURNAMENT")
          .in("event_id", tournamentIds);

        if (attendanceError) {
          console.error("Error in attendance query:", attendanceError);
          throw attendanceError;
        }
        console.log("Tournament attendance data fetched successfully:", attendanceData);
        
        return tournamentsData.map(tournament => ({
          ...tournament,
          event_attendance: (attendanceData || []).filter(a => a.event_id === tournament.id)
        }));
      } catch (error) {
        console.error("Error fetching tournaments:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load tournaments. Please try again.",
        });
        return [];
      }
    },
    retry: false
  });

  const { data: objectives, refetch: refetchObjectives } = useQuery({
    queryKey: ["objectives", formattedDate],
    queryFn: async () => {
      console.log("Fetching objectives...");
      try {
        const { data, error } = await supabase
          .from("player_objectives")
          .select("*")
          .eq("review_date", formattedDate);
        
        if (error) {
          console.error("Error in objectives query:", error);
          throw error;
        }
        console.log("Objectives fetched successfully:", data);
        return data || [];
      } catch (error) {
        console.error("Error fetching objectives:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load objectives. Please try again.",
        });
        return [];
      }
    },
    retry: false
  });

  return {
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
  };
};
