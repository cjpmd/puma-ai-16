import { useQuery } from "@tanstack/react-query";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";

export const usePlayerObjectives = (playerId: string) => {
  const session = useSession();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session?.user?.id)
        .maybeSingle();

      if (error) {
        console.error('Profile error:', error);
        return null;
      }
      return data;
    },
    enabled: !!session?.user,
  });

  const { data: objectives, refetch } = useQuery({
    queryKey: ["player-objectives", playerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_objectives')
        .select(`
          *,
          profiles:coach_id (
            name
          )
        `)
        .eq('player_id', playerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching objectives:', error);
        throw error;
      }
      return data;
    },
  });

  return { objectives, profile, refetch };
};