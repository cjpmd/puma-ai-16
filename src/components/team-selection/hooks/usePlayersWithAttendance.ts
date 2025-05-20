
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Player, PlayerType, transformDbPlayerToPlayer } from '@/types/player';

// Extend Player interface to include attendance status
export interface PlayerWithAttendance extends Player {
  attendanceStatus?: string;
  isAttending?: boolean;
}

export const usePlayersWithAttendance = (eventId: string | undefined, eventType = 'FIXTURE') => {
  const [players, setPlayers] = useState<PlayerWithAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      fetchPlayersWithAttendance(eventId, eventType);
    } else {
      setLoading(false);
    }
  }, [eventId, eventType]);

  const fetchPlayersWithAttendance = async (id: string, type: string) => {
    try {
      setLoading(true);

      // First get the event to determine the team category
      let teamCategory;
      
      if (type === 'FIXTURE') {
        const { data: eventData, error: eventError } = await supabase
          .from('fixtures')
          .select('team_name')
          .eq('id', id)
          .single();

        if (eventError) throw eventError;
        teamCategory = eventData.team_name;
      } else if (type === 'FESTIVAL') {
        const { data: eventData, error: eventError } = await supabase
          .from('festivals')
          .select('team_name')
          .eq('id', id)
          .single();

        if (eventError) throw eventError;
        teamCategory = eventData.team_name;
      } else if (type === 'TOURNAMENT') {
        const { data: eventData, error: eventError } = await supabase
          .from('tournaments')
          .select('team_name')
          .eq('id', id)
          .single();

        if (eventError) throw eventError;
        teamCategory = eventData.team_name;
      }

      // Get all players in this team category
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('team_category', teamCategory)
        .order('name', { ascending: true });

      if (playersError) throw playersError;

      // Get attendance status for this event
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('event_attendance')
        .select('*')
        .eq('event_id', id)
        .eq('event_type', type);

      if (attendanceError) throw attendanceError;

      // Combine players with their attendance status
      const playersWithAttendance = playersData.map(player => {
        const attendance = attendanceData.find(a => a.player_id === player.id);
        // Transform the player data from DB format to frontend format
        const transformedPlayer = transformDbPlayerToPlayer(player);
        
        // Determine if player is attending
        const attendanceStatus = attendance?.status || 'PENDING';
        // Use strict equality check for status comparison
        const isAttending = attendanceStatus === "CONFIRMED";
        
        return {
          ...transformedPlayer,
          attendanceStatus,
          isAttending
        };
      });

      setPlayers(playersWithAttendance);
    } catch (error) {
      console.error('Error fetching players with attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  return { players, loading };
};
