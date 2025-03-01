
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFixtureSelections = (fixtureId: string | undefined) => {
  return useQuery({
    queryKey: ["fixture-selections", fixtureId],
    queryFn: async () => {
      if (!fixtureId) return [];
      
      console.log("Fetching existing selections for fixture:", fixtureId);
      
      try {
        const { data, error } = await supabase
          .from("fixture_team_selections")
          .select("*")
          .eq("fixture_id", fixtureId);
        
        if (error) {
          console.error("Error fetching selections:", error);
          return [];
        }
        
        console.log("Fetched selections:", data);
        return data || [];
      } catch (error) {
        console.error("Exception fetching selections:", error);
        return [];
      }
    },
    enabled: !!fixtureId,
  });
};
