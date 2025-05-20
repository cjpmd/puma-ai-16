
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/player";

// Define our own transformer if needed
const transformDbPlayerToPlayer = (dbPlayer: any): Partial<Player> => {
  return {
    id: dbPlayer.id,
    name: dbPlayer.name,
    squad_number: dbPlayer.squad_number,
    player_type: dbPlayer.player_type,
    team_category: dbPlayer.team_category,
  };
};

export const usePlayersWithAttendance = (eventId: string, eventType: string) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPlayersWithAttendance = async () => {
      try {
        setLoading(true);
        
        // Fetch all players first
        const { data: playersData, error: playersError } = await supabase
          .from("players")
          .select("*")
          .order("name");
        
        if (playersError) throw playersError;
        
        // Fetch attendance for the specific event
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("event_attendance")
          .select("*")
          .eq("event_id", eventId)
          .eq("event_type", eventType);
        
        if (attendanceError) throw attendanceError;
        
        // Transform and combine the data
        const enrichedPlayers = playersData.map((player) => {
          const attendanceRecord = attendanceData.find(
            (record) => record.player_id === player.id
          );
          
          return {
            ...transformDbPlayerToPlayer(player),
            attendance: attendanceRecord ? {
              id: attendanceRecord.id,
              status: attendanceRecord.status,
              response_time: attendanceRecord.response_time,
            } : null
          } as unknown as Player;
        });
        
        setPlayers(enrichedPlayers);
        setError(null);
      } catch (err) {
        console.error("Error fetching players with attendance:", err);
        setError(err instanceof Error ? err : new Error("An unknown error occurred"));
      } finally {
        setLoading(false);
      }
    };
    
    if (eventId && eventType) {
      fetchPlayersWithAttendance();
    } else {
      setLoading(false);
    }
  }, [eventId, eventType]);
  
  return { players, loading, error };
};
