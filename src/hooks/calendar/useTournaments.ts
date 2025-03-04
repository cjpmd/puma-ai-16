
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export const useTournaments = (date: Date) => {
  const { toast } = useToast();
  const formattedDate = format(date, "yyyy-MM-dd");

  return useQuery({
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
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });
};
