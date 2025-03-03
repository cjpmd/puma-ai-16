
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFixtureSelections = (fixtureId: string | undefined) => {
  return useQuery({
    queryKey: ["fixture-selections", fixtureId],
    queryFn: async () => {
      if (!fixtureId) {
        console.log("No fixture ID provided for selections");
        return [];
      }
      
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
        
        // Process the data to ensure all fields needed exist
        const processedData = (data || []).map(selection => ({
          ...selection,
          performance_category: selection.performance_category || "MESSI",
          position: selection.position || "N/A",
          is_captain: selection.is_captain || false
        }));
        
        console.log("Fetched selections:", processedData);
        return processedData;
      } catch (error) {
        console.error("Exception fetching selections:", error);
        return [];
      }
    },
    enabled: !!fixtureId,
    staleTime: 0, // Don't cache this data, always refetch
    refetchOnWindowFocus: true, // Refetch when window regains focus
    meta: {
      onSuccess: (data) => {
        // We can use this to update any other queries that might depend on this data
        console.log(`Successfully fetched ${data.length} selections for fixture ${fixtureId}`);
      }
    }
  });
};
