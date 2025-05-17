
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
        // Try to use the get_table_columns function to check if status column exists
        let hasStatusColumn = false;
        
        try {
          const { data: columns, error: columnsError } = await supabase
            .rpc('get_table_columns', { p_table_name: 'players' });
          
          if (!columnsError && columns) {
            hasStatusColumn = columns.some((column: any) => column.column_name === 'status');
          }
        } catch (err) {
          console.error("Error checking for status column:", err);
        }
        
        console.log("Status column exists:", hasStatusColumn);
        
        // Now fetch players with the appropriate query
        let query = supabase.from("players").select("*").order("name");
        
        // Add status filter if the column exists
        if (hasStatusColumn) {
          query = query.eq('status', 'active');
        }
        
        const { data, error } = await query;
        
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
        attendanceStatus: "available", // Using attendanceStatus instead of status
        attending: true
      }));
      
      setPlayersWithStatus(enhancedPlayers);
      setIsLoading(false);
    }
  }, [players, playersLoading, playersError]);

  return { playersWithStatus, isLoading, error };
};
