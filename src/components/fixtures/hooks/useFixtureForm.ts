
import { useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FixtureFormData } from "../schemas/fixtureFormSchema";

interface UseFixtureFormProps {
  onSubmit: (data: FixtureFormData) => void;
  editingFixture?: any;
  selectedDate?: Date;
}

export const useFixtureForm = ({ onSubmit, editingFixture, selectedDate }: UseFixtureFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: FixtureFormData) => {
    setIsSubmitting(true);
    try {
      const fixtureData = {
        opponent: data.opponent,
        location: data.location,
        team_name: data.team_name,
        format: data.format,
        number_of_teams: parseInt(data.number_of_teams || "1"),
        is_home: data.is_home,
        home_score: data.home_score ? parseInt(data.home_score) : null,
        away_score: data.away_score ? parseInt(data.away_score) : null,
        date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        potm_player_id: data.motm_player_ids?.[0] || null
      };

      let fixtureResult;
      
      if (editingFixture?.id) {
        fixtureResult = await supabase
          .from('fixtures')
          .update(fixtureData)
          .eq('id', editingFixture.id)
          .select()
          .single();
      } else {
        fixtureResult = await supabase
          .from('fixtures')
          .insert(fixtureData)
          .select()
          .single();
      }

      if (fixtureResult.error) throw fixtureResult.error;
      
      const fixtureId = fixtureResult.data.id;

      if (fixtureId) {
        if (data.team_times && data.team_times.length > 0) {
          const { error: teamTimesError } = await supabase
            .from('fixture_team_times')
            .upsert(
              data.team_times.map((teamTime, index) => ({
                fixture_id: fixtureId,
                team_number: index + 1,
                meeting_time: teamTime.meeting_time || null,
                start_time: teamTime.start_time || null,
                end_time: teamTime.end_time || null,
                performance_category: teamTime.performance_category || "MESSI"
              })),
              { onConflict: 'fixture_id,team_number' }
            );

          if (teamTimesError) throw teamTimesError;
        }

        if (data.home_score || data.away_score) {
          const { error: scoresError } = await supabase
            .from('fixture_team_scores')
            .upsert([
              {
                fixture_id: fixtureId,
                team_number: 1,
                score: parseInt(data.home_score) || 0
              },
              {
                fixture_id: fixtureId,
                team_number: 2,
                score: parseInt(data.away_score) || 0
              }
            ], { onConflict: 'fixture_id,team_number' });

          if (scoresError) throw scoresError;
        }

        const savedFixture = {
          ...data,
          id: fixtureId
        };

        await onSubmit(savedFixture);
        
        toast({
          title: "Success",
          description: editingFixture ? "Fixture updated successfully" : "Fixture created successfully",
        });
        
        return savedFixture;
      }
    } catch (error) {
      console.error("Error saving fixture:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save fixture",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting
  };
};
