
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export const useCalendarData = (date: Date) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const formattedDate = format(date, "yyyy-MM-dd");

  console.log("Starting to fetch calendar data for date:", formattedDate);

  // Subscribe to database changes and invalidate queries
  useEffect(() => {
    // Set up Supabase realtime subscriptions
    const fixturesSubscription = supabase
      .channel('fixtures-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'fixtures',
        filter: `date=eq.${formattedDate}`
      }, (payload) => {
        console.log('Fixtures changed:', payload);
        queryClient.invalidateQueries({ queryKey: ["fixtures", formattedDate] });
      })
      .subscribe();

    const festivalsSubscription = supabase
      .channel('festivals-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'festivals',
        filter: `date=eq.${formattedDate}`
      }, (payload) => {
        console.log('Festivals changed:', payload);
        queryClient.invalidateQueries({ queryKey: ["festivals", formattedDate] });
      })
      .subscribe();

    const tournamentsSubscription = supabase
      .channel('tournaments-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tournaments',
        filter: `date=eq.${formattedDate}`
      }, (payload) => {
        console.log('Tournaments changed:', payload);
        queryClient.invalidateQueries({ queryKey: ["tournaments", formattedDate] });
      })
      .subscribe();

    // Cleanup subscriptions on unmount or date change
    return () => {
      fixturesSubscription.unsubscribe();
      festivalsSubscription.unsubscribe();
      tournamentsSubscription.unsubscribe();
    };
  }, [formattedDate, queryClient]);

  const { 
    data: sessions = [], 
    refetch: refetchSessions,
    isLoading: isLoadingSessions 
  } = useQuery({
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

  const { 
    data: fixtures = [], 
    refetch: refetchFixtures,
    isLoading: isLoadingFixtures 
  } = useQuery({
    queryKey: ["fixtures", formattedDate],
    queryFn: async () => {
      console.log("Fetching fixtures for date:", formattedDate);
      try {
        console.log("Executing fixtures query for date:", formattedDate);
        const { data: fixturesData, error: fixturesError } = await supabase
          .from("fixtures")
          .select(`
            *,
            fixture_team_times(*),
            fixture_team_scores(*)
          `)
          .eq("date", formattedDate);
        
        if (fixturesError) {
          console.error("Error in fixtures query:", fixturesError);
          throw fixturesError;
        }
        
        console.log("Raw fixtures data:", fixturesData?.length, "items");
        
        if (!fixturesData?.length) {
          console.log("No fixtures found for date:", formattedDate);
          return [];
        }

        // Use seen IDs to prevent duplicates
        const seen = new Set();
        const uniqueFixtures = fixturesData.filter(fixture => {
          const duplicate = seen.has(fixture.id);
          seen.add(fixture.id);
          return !duplicate;
        });

        console.log("Unique fixtures after deduplication:", uniqueFixtures.length, "items");

        const fixtureIds = uniqueFixtures.map(f => f.id);
        console.log("Fetching attendance for fixture IDs:", fixtureIds);

        const { data: attendanceData, error: attendanceError } = await supabase
          .from("event_attendance")
          .select("status, player_id, responded_by, event_id")
          .eq("event_type", "FIXTURE")
          .in("event_id", fixtureIds);

        if (attendanceError) {
          console.error("Error fetching attendance:", attendanceError);
          throw attendanceError;
        }
        
        const result = uniqueFixtures.map(fixture => ({
          ...fixture,
          event_attendance: (attendanceData || []).filter(a => a.event_id === fixture.id)
        }));

        console.log("Final fixtures data:", result.length, "items");
        return result;
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
    staleTime: 0, // Always refetch when requested
    gcTime: 60000, // 1 minute garbage collection time
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true
  });

  const { 
    data: festivals = [], 
    refetch: refetchFestivals,
    isLoading: isLoadingFestivals 
  } = useQuery({
    queryKey: ["festivals", formattedDate],
    queryFn: async () => {
      console.log("Fetching festivals...");
      try {
        const { data: festivalsData, error: festivalsError } = await supabase
          .from("festivals")
          .select("*")
          .eq("date", formattedDate);
        
        if (festivalsError) throw festivalsError;
        
        if (!festivalsData?.length) return [];

        const festivalIds = festivalsData.map(f => f.id);
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("event_attendance")
          .select("status, player_id, responded_by, event_id")
          .eq("event_type", "FESTIVAL")
          .in("event_id", festivalIds);

        if (attendanceError) throw attendanceError;
        
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
    staleTime: 0,
    refetchOnMount: true
  });

  const { 
    data: tournaments = [], 
    refetch: refetchTournaments,
    isLoading: isLoadingTournaments 
  } = useQuery({
    queryKey: ["tournaments", formattedDate],
    queryFn: async () => {
      console.log("Fetching tournaments...");
      try {
        const { data: tournamentsData, error: tournamentsError } = await supabase
          .from("tournaments")
          .select("*")
          .eq("date", formattedDate);
        
        if (tournamentsError) throw tournamentsError;
        
        if (!tournamentsData?.length) return [];

        const tournamentIds = tournamentsData.map(t => t.id);
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("event_attendance")
          .select("status, player_id, responded_by, event_id")
          .eq("event_type", "TOURNAMENT")
          .in("event_id", tournamentIds);

        if (attendanceError) throw attendanceError;
        
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
    staleTime: 0,
    refetchOnMount: true
  });

  const { 
    data: objectives = [], 
    refetch: refetchObjectives,
    isLoading: isLoadingObjectives 
  } = useQuery({
    queryKey: ["objectives", formattedDate],
    queryFn: async () => {
      console.log("Fetching objectives...");
      try {
        const { data, error } = await supabase
          .from("player_objectives")
          .select("*")
          .eq("review_date", formattedDate);
        
        if (error) throw error;
        
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

  const isLoading = isLoadingSessions || isLoadingFixtures || isLoadingFestivals || isLoadingTournaments || isLoadingObjectives;

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
    isLoading
  };
};
