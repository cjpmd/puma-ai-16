
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePlayersWithAttendance = () => {
  const { toast } = useToast();

  const { data: attendanceData } = useQuery({
    queryKey: ["attendance-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_attendance')
        .select(`
          id,
          player_id,
          status,
          players (
            id,
            name
          )
        `)
        .eq('event_type', 'FIXTURE');

      if (error) throw error;
      return data || [];
    },
  });

  const { data: players, isLoading, error } = useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  if (error) {
    console.error("Error loading players:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load players",
    });
  }

  const getPlayerAttendanceStatus = (playerId: string) => {
    const attendance = attendanceData?.find(a => a.player_id === playerId);
    return attendance?.status || 'PENDING';
  };

  // Add attendance status to player objects
  const playersWithStatus = players?.map(player => ({
    ...player,
    attendanceStatus: getPlayerAttendanceStatus(player.id),
  })) || [];

  return { 
    playersWithStatus, 
    isLoading, 
    error 
  };
};
