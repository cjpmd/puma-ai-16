
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export const useFestivals = (date: Date) => {
  const { toast } = useToast();
  const formattedDate = format(date, "yyyy-MM-dd");

  return useQuery({
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
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });
};
