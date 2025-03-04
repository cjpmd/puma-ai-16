import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamSelection, AllSelections, PeriodsPerTeam, TeamCaptains } from "../types";
import { useProcessSelections } from "./useProcessSelections";

export const useTeamSelectionData = (fixtureId?: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [existingSelections, setExistingSelections] = useState<AllSelections>({});
  const [existingPeriods, setExistingPeriods] = useState<PeriodsPerTeam>({});
  const [existingCaptains, setExistingCaptains] = useState<TeamCaptains>({});
  const { processSelections } = useProcessSelections();

  // Fetch existing team selections for this fixture
  const { data: selections, isLoading: isLoadingSelections } = useQuery({
    queryKey: ["teamSelections", fixtureId],
    queryFn: async () => {
      if (!fixtureId) return [];
      
      try {
        const { data, error } = await supabase
          .from("fixture_team_selections")
          .select("*")
          .eq("fixture_id", fixtureId);
          
        if (error) throw error;
        
        console.log(`Fetched ${data?.length || 0} team selections for fixture ${fixtureId}`);
        return data || [];
      } catch (error) {
        console.error("Error fetching team selections:", error);
        return [];
      }
    },
    enabled: !!fixtureId,
  });

  // Process existing data when it's loaded
  useEffect(() => {
    if (!isLoadingSelections) {
      if (selections && selections.length > 0) {
        // Process selections into the expected format
        console.log("Processing existing selections:", selections);
        
        // Here we would normally process the selections
        // Since processExistingSelections isn't implemented, we're using an empty object
        // This is where you would convert from DB format to app format
      }
      setIsLoading(false);
    }
  }, [selections, isLoadingSelections]);

  return {
    isLoading,
    existingSelections,
    existingPeriods,
    existingCaptains
  };
};
