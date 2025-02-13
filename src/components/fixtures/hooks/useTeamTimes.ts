
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { FixtureFormData } from "../schemas/fixtureFormSchema";

export const useTeamTimes = (
  form: UseFormReturn<FixtureFormData>,
  editingFixture?: any,
  watchNumberOfTeams?: number
) => {
  useEffect(() => {
    const fetchTeamTimes = async () => {
      if (!editingFixture?.id) return;

      const { data: teamTimes, error } = await supabase
        .from('fixture_team_times')
        .select('*')
        .eq('fixture_id', editingFixture.id);

      if (error) {
        console.error("Error fetching team times:", error);
        return;
      }

      if (teamTimes) {
        const currentTeamTimes = form.getValues("team_times");
        const updatedTeamTimes = currentTeamTimes.map((time, index) => {
          const teamTime = teamTimes.find(t => t.team_number === index + 1);
          return {
            ...time,
            performance_category: teamTime?.performance_category || "MESSI",
            meeting_time: teamTime?.meeting_time || "",
            start_time: teamTime?.start_time || "",
            end_time: teamTime?.end_time || ""
          };
        });
        form.setValue("team_times", updatedTeamTimes);
      }
    };

    fetchTeamTimes();
  }, [editingFixture?.id, form]);

  useEffect(() => {
    if (!watchNumberOfTeams) return;
    
    const currentTimes = form.getValues("team_times");
    if (currentTimes.length !== watchNumberOfTeams) {
      const newTimes = Array(watchNumberOfTeams).fill(null).map((_, i) => 
        currentTimes[i] || { 
          meeting_time: "", 
          start_time: "", 
          end_time: "",
          performance_category: "MESSI"
        }
      );
      form.setValue("team_times", newTimes);
    }
  }, [watchNumberOfTeams, form]);
};
