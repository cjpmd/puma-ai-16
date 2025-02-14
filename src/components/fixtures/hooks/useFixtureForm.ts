
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
      const dateToUse = selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
      console.log("Using date:", dateToUse);

      // Only include fields that exist in the fixtures table
      const fixtureData = {
        opponent: data.opponent,
        location: data.location,
        team_name: data.team_name,
        format: data.format,
        number_of_teams: parseInt(data.number_of_teams || "1"),
        is_home: data.is_home,
        date: dateToUse,
        potm_player_id: data.motm_player_ids?.[0] || null
      };

      console.log("Saving fixture with data:", fixtureData);

      let fixtureResult;
      
      if (editingFixture?.id) {
        fixtureResult = await supabase
          .from('fixtures')
          .update(fixtureData)
          .eq('id', editingFixture.id)
          .select('*')
          .single();
      } else {
        fixtureResult = await supabase
          .from('fixtures')
          .insert(fixtureData)
          .select('*')
          .single();
      }

      if (fixtureResult.error) {
        console.error("Error saving fixture:", fixtureResult.error);
        throw fixtureResult.error;
      }

      console.log("Fixture saved successfully:", fixtureResult.data);
      
      const fixtureId = fixtureResult.data.id;

      if (fixtureId) {
        // Insert or update team times with performance categories
        if (data.team_times && data.team_times.length > 0) {
          const teamTimesData = data.team_times.map((teamTime, index) => ({
            fixture_id: fixtureId,
            team_number: index + 1,
            meeting_time: teamTime.meeting_time || null,
            start_time: teamTime.start_time || null,
            end_time: teamTime.end_time || null,
            performance_category: teamTime.performance_category || "MESSI"
          }));

          console.log("Saving team times:", teamTimesData);

          // Delete existing team times first
          if (editingFixture?.id) {
            await supabase
              .from('fixture_team_times')
              .delete()
              .eq('fixture_id', fixtureId);
          }

          const { data: teamTimesResult, error: teamTimesError } = await supabase
            .from('fixture_team_times')
            .upsert(teamTimesData)
            .select();

          if (teamTimesError) {
            console.error("Error saving team times:", teamTimesError);
            throw teamTimesError;
          }

          console.log("Team times saved:", teamTimesResult);
        }

        // Insert or update team scores
        const teamScoresData = Array.from({ length: parseInt(data.number_of_teams || "1") }).map((_, index) => {
          const teamScore = data[`team_${index + 1}_score`] || 0;
          const opponentScore = data[`opponent_${index + 1}_score`] || 0;
          return {
            fixture_id: fixtureId,
            team_number: index + 1,
            score: teamScore,
            opponent_score: opponentScore
          };
        });

        console.log("Saving team scores:", teamScoresData);

        // Delete existing scores first if editing
        if (editingFixture?.id) {
          await supabase
            .from('fixture_team_scores')
            .delete()
            .eq('fixture_id', fixtureId);
        }

        if (teamScoresData.length > 0) {
          const { data: scoresResult, error: scoresError } = await supabase
            .from('fixture_team_scores')
            .upsert(teamScoresData)
            .select();

          if (scoresError) {
            console.error("Error saving team scores:", scoresError);
            throw scoresError;
          }

          console.log("Team scores saved:", scoresResult);
        }

        // Create default event attendance entries for all players in the team
        if (!editingFixture?.id) {
          // First get all players in the team category
          const { data: teamPlayers, error: playersError } = await supabase
            .from('players')
            .select('id')
            .eq('team_category', data.team_name);

          if (playersError) {
            console.error("Error fetching team players:", playersError);
            throw playersError;
          }

          if (teamPlayers && teamPlayers.length > 0) {
            const attendanceData = teamPlayers.map(player => ({
              event_id: fixtureId,
              event_type: 'FIXTURE',
              status: 'PENDING',
              player_id: player.id
            }));

            const { error: attendanceError } = await supabase
              .from('event_attendance')
              .insert(attendanceData);

            if (attendanceError) {
              console.error("Error creating attendance:", attendanceError);
              throw attendanceError;
            }

            console.log("Attendance created for all team players");
          }
        }

        const savedFixture = {
          ...fixtureResult.data,
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
