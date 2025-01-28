import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const useCalendarData = (date: Date) => {
  const formattedDate = format(date, "yyyy-MM-dd");

  const { data: sessions, refetch: refetchSessions } = useQuery({
    queryKey: ["training-sessions", formattedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_sessions")
        .select("*, training_drills(*, training_files(*))")
        .eq("date", formattedDate);
      
      if (error) {
        console.error("Error fetching sessions:", error);
        throw error;
      }
      return data;
    },
  });

  const { data: fixtures, refetch: refetchFixtures } = useQuery({
    queryKey: ["fixtures", formattedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixtures")
        .select("*")
        .eq("date", formattedDate);
      
      if (error) {
        console.error("Error fetching fixtures:", error);
        throw error;
      }
      return data;
    },
  });

  const { data: festivals, refetch: refetchFestivals } = useQuery({
    queryKey: ["festivals", formattedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("festivals")
        .select("*")
        .eq("date", formattedDate);
      
      if (error) {
        console.error("Error fetching festivals:", error);
        throw error;
      }
      return data;
    },
  });

  const { data: tournaments, refetch: refetchTournaments } = useQuery({
    queryKey: ["tournaments", formattedDate],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("tournaments")
          .select()
          .eq("date", formattedDate);
        
        if (error) {
          console.error("Error fetching tournaments:", error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error("Tournament fetch error:", error);
        return [];
      }
    },
    initialData: [],
  });

  const { data: objectives, refetch: refetchObjectives } = useQuery({
    queryKey: ["objectives", formattedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_objectives")
        .select("*")
        .eq("review_date", formattedDate);
      
      if (error) {
        console.error("Error fetching objectives:", error);
        throw error;
      }
      return data;
    },
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