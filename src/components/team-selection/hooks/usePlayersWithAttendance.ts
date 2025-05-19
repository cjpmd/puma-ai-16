import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/player";
import { columnExists } from "@/utils/database/columnUtils";

interface PlayerWithAttendance extends Omit<Player, 'status'> {
  attendanceStatus: string;
  attending: boolean;
  dateOfBirth: string;
  playerType: string;
}

export const usePlayersWithAttendance = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [playersWithStatus, setPlayersWithStatus] = useState<PlayerWithAttendance[]>([]);
  const [hasStatusColumn, setHasStatusColumn] = useState<boolean | null>(null);

  // First check if status column exists
  useEffect(() => {
    const checkStatusColumn = async () => {
      try {
        const hasColumn = await columnExists('players', 'status');
        console.log("Status column exists:", hasColumn);
        setHasStatusColumn(hasColumn);
      } catch (err) {
        console.error("Error checking for status column:", err);
        setHasStatusColumn(false);
      }
    };
    
    checkStatusColumn();
  }, []);

  const { data: players, isLoading: playersLoading, error: playersError } = useQuery({
    queryKey: ["all-players", hasStatusColumn],
    queryFn: async () => {
      try {
        console.log("Fetching all players with status column check:", hasStatusColumn);
        
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
    enabled: hasStatusColumn !== null, // Only run query once we know if status column exists
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
      const playersWithAttendance = players.map(player => ({
        ...player,
        dateOfBirth: player.date_of_birth,
        playerType: player.player_type,
        attendanceStatus: 'unknown',
        attending: false
      }));
      
      setPlayersWithStatus(playersWithAttendance);
      setIsLoading(false);
    }
  }, [players, playersLoading, playersError]);

  return { playersWithStatus, isLoading, error };
};
