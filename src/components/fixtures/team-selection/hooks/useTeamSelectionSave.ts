
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  AllSelections, 
  PeriodsPerTeam, 
  TeamCaptains 
} from "../types";

export const useTeamSelectionSave = (
  fixtureId: string | undefined,
  selections: AllSelections,
  periodsPerTeam: PeriodsPerTeam,
  teamCaptains: TeamCaptains,
  onSuccess?: () => void
) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      if (!fixtureId) {
        throw new Error("Missing fixture ID");
      }
      
      console.log("Saving team selections to database...");
      console.log("Current state:", {
        fixtureId,
        periodsPerTeam,
        selections,
        teamCaptains
      });
      
      // First delete existing selections for this fixture
      const { error: deleteError } = await supabase
        .from("fixture_team_selections")
        .delete()
        .eq("fixture_id", fixtureId);
        
      if (deleteError) {
        console.error("Error deleting existing selections:", deleteError);
        throw deleteError;
      }
      
      // Prepare data to be saved
      const teamSelectionsToSave = [];
      
      // Process each team and each period
      for (const teamId of Object.keys(periodsPerTeam)) {
        const teamPeriods = periodsPerTeam[teamId] || [];
        
        for (const period of teamPeriods) {
          const periodId = period.id;
          const teamSelections = selections[periodId]?.[teamId] || {};
          
          // Process each player selection for this team/period
          Object.entries(teamSelections).forEach(([slotId, selection]) => {
            if (selection.playerId && selection.playerId !== "unassigned") {
              // Create a record with period information
              teamSelectionsToSave.push({
                fixture_id: fixtureId,
                player_id: selection.playerId,
                position: selection.position || slotId,
                performance_category: selection.performanceCategory || "MESSI",
                team_number: parseInt(teamId),
                is_captain: teamCaptains[teamId] === selection.playerId ? true : false,
                period_id: periodId,
                duration: period.duration || 45
              });
            }
          });
        }
      }
      
      console.log("Saving player selections:", teamSelectionsToSave);
      
      if (teamSelectionsToSave.length > 0) {
        const { data, error } = await supabase
          .from("fixture_team_selections")
          .insert(teamSelectionsToSave)
          .select();
          
        if (error) {
          console.error("Error saving team selections:", error);
          throw error;
        }
        
        console.log("Team selections saved successfully:", data);
        
        if (onSuccess) {
          onSuccess();
        }
        
        return true;
      } else {
        console.log("No selections to save");
        return true;
      }
    } catch (error) {
      console.error("Error saving team selections:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save team selections: " + (error.message || "Unknown error"),
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    handleSave
  };
};
