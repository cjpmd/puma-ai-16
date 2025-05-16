
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePlayers = () => {
  return useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order('name');
      
      if (error) {
        console.error("Error fetching players:", error);
        throw error;
      }
      
      console.log("Fetched players:", data?.length || 0);
      return data || [];
    },
  });
};
