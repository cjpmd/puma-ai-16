import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, isSameMonth, parseISO } from "date-fns";

export const useCalendarData = (date: Date) => {
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
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: fixtures, refetch: refetchFixtures } = useQuery({
    queryKey: ["fixtures", date],
    queryFn: async () => {
      if (!date) return [];
      
      const { data, error } = await supabase
        .from("fixtures")
        .select("*")
        .eq("date", format(date, "yyyy-MM-dd"))
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: objectives, refetch: refetchObjectives } = useQuery({
    queryKey: ["objectives", date],
    queryFn: async () => {
      if (!date) return [];
      
      const startDate = startOfMonth(date);
      const endDate = endOfMonth(date);
      
      const { data, error } = await supabase
        .from('player_objectives')
        .select(`
          *,
          players (
            name
          ),
          profiles:coach_id (
            name
          )
        `)
        .gte('review_date', format(startDate, 'yyyy-MM-dd'))
        .lte('review_date', format(endDate, 'yyyy-MM-dd'))
        .order('review_date', { ascending: true });

      if (error) throw error;
      
      return data.filter(objective => 
        objective.review_date && 
        isSameMonth(parseISO(objective.review_date), date)
      );
    },
    enabled: !!date,
  });

  return {
    sessions,
    fixtures,
    objectives,
    refetchSessions,
    refetchFixtures,
    refetchObjectives
  };
};