
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export const useCalendarData = (date: Date) => {
  const { toast } = useToast();
  const formattedDate = format(date, "yyyy-MM-dd");

  console.log("Fetching calendar data for date:", formattedDate);

  const { data: sessions, refetch: refetchSessions } = useQuery({
    queryKey: ["training-sessions", formattedDate],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("training_sessions")
          .select("*, training_drills(*, training_files(*))")
          .eq("date", formattedDate);
        
        if (error) throw error;
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
      try {
        const { data, error } = await supabase
          .from("fixtures")
          .select(`
            *,
            event_attendance (
              status,
              player_id,
              responded_by
            )
          `)
          .eq("date", formattedDate);
        
        if (error) throw error;
        return data || [];
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
      try {
        const { data, error } = await supabase
          .from("festivals")
          .select(`
            *,
            event_attendance (
              status,
              player_id,
              responded_by
            )
          `)
          .eq("date", formattedDate);
        
        if (error) throw error;
        return data || [];
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
      try {
        const { data, error } = await supabase
          .from("tournaments")
          .select(`
            *,
            event_attendance (
              status,
              player_id,
              responded_by
            )
          `)
          .eq("date", formattedDate);
        
        if (error) throw error;
        return data || [];
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
