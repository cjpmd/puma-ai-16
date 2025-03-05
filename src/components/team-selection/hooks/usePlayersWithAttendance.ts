
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/player";

interface PlayerWithAttendance extends Player {
  status?: "available" | "unavailable" | "maybe";
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
        status: "available", // Mock status: "available", "unavailable", "maybe"
        attending: true
      }));
      
      setPlayersWithStatus(enhancedPlayers);
      setIsLoading(false);
    }
  }, [players, playersLoading, playersError]);

  return { playersWithStatus, isLoading, error };
};
