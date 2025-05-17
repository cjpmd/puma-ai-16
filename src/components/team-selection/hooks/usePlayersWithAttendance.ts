
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/player";

interface PlayerWithAttendance extends Omit<Player, 'status'> {
  attendanceStatus?: "available" | "unavailable" | "maybe";
  attending?: boolean;
}

export const usePlayersWithAttendance = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [playersWithStatus, setPlayersWithStatus] = useState<PlayerWithAttendance[]>([]);

  const { data: players, isLoading: playersLoading, error: playersError } = useQuery({
    queryKey: ["all-players"],
    queryFn: async () => {
      try {
        // First check if status column exists without using the ambiguous table_name
        const { data: columnData, error: columnError } = await supabase
          .from('players')
          .select('status')
          .limit(1)
          .maybeSingle();
          
        const hasStatusColumn = columnError ? 
          !columnError.message.includes("column \"status\" does not exist") : 
          true;
        
        console.log("Status column exists:", hasStatusColumn);
        
        // Now fetch players with the appropriate query
        const { data, error } = await supabase
          .from("players")
          .select("*")
          .order("name");
        
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error("Error fetching players:", err);
        throw err;
      }
    },
  });

  useEffect(() => {
    if (playersLoading) {
      setIsLoading(true);
      return;
    }

    if (playersError) {
      setError(playersError instanceof Error ? playersError : new Error(String(playersError)));
      setIsLoading(false);
      return;
    }

    if (players) {
      // Here you could fetch attendance information from your API
      // For now, we'll just enhance the players with a mock attendance status
      const enhancedPlayers = players.map(player => ({
        ...player,
        attendanceStatus: "available", // Mock status changed from status to attendanceStatus
        attending: true
      }));
      
      setPlayersWithStatus(enhancedPlayers);
      setIsLoading(false);
    }
  }, [players, playersLoading, playersError]);

  return { playersWithStatus, isLoading, error };
};
