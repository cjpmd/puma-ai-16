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
        
        console.log("Training sessions response:", { data, error });
        if (error) throw error;
        return data;
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
    retry: 3,
    retryDelay: 1000,
    initialData: [],
  });

  const { data: fixtures, refetch: refetchFixtures } = useQuery({
    queryKey: ["fixtures", formattedDate],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("fixtures")
          .select("*")
          .eq("date", formattedDate);
        
        console.log("Fixtures response:", { data, error });
        if (error) throw error;
        return data;
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
    retry: 3,
    retryDelay: 1000,
    initialData: [],
  });

  const { data: festivals, refetch: refetchFestivals } = useQuery({
    queryKey: ["festivals", formattedDate],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("festivals")
          .select("*")
          .eq("date", formattedDate);
        
        console.log("Festivals response:", { data, error });
        if (error) throw error;
        return data;
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
    retry: 3,
    retryDelay: 1000,
    initialData: [],
  });

  const { data: tournaments, refetch: refetchTournaments } = useQuery({
    queryKey: ["tournaments", formattedDate],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("tournaments")
          .select("*")
          .eq("date", formattedDate);
        
        console.log("Tournaments response:", { data, error });
        if (error) throw error;
        return data;
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
    retry: 3,
    retryDelay: 1000,
    initialData: [],
  });

  const { data: objectives, refetch: refetchObjectives } = useQuery({
    queryKey: ["objectives", formattedDate],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("player_objectives")
          .select("*")
          .eq("review_date", formattedDate);
        
        console.log("Objectives response:", { data, error });
        if (error) throw error;
        return data;
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
    retry: 3,
    retryDelay: 1000,
    initialData: [],
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