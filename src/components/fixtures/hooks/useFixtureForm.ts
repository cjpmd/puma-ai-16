
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
      // Determine the correct date to use
      const dateToUse = selectedDate 
        ? format(selectedDate, "yyyy-MM-dd") 
        : data.date 
          ? data.date 
          : format(new Date(), "yyyy-MM-dd");

      console.log("Using date for fixture:", dateToUse);
      console.log("Form data with MOTM player IDs:", data.motm_player_ids);

      // Only include fields that exist in the fixtures table
      const fixtureData = {
        opponent: data.opponent,
        location: data.location,
        team_name: data.team_name,
        format: data.format,
        number_of_teams: parseInt(data.number_of_teams || "1"),
        is_home: data.is_home,
        date: dateToUse,
        motm_player_id: data.motm_player_ids?.[0] || null, // Store the first team's MOTM in the main table
        team_1_score: data.team_1_score || null,
        opponent_1_score: data.opponent_1_score || null,
        team_2_score: data.team_2_score || null,
        opponent_2_score: data.opponent_2_score || null,
        // Include meeting time from team_times if available
        meeting_time: data.team_times?.[0]?.meeting_time || null,
        start_time: data.team_times?.[0]?.start_time || null,
        end_time: data.team_times?.[0]?.end_time || null
      };

      console.log("Saving fixture with data:", fixtureData);

      let fixtureResult;
      
      if (editingFixture?.id) {
        fixtureResult = await supabase
          .from('fixtures')
          .update(fixtureData)
          .eq('id', editingFixture.id)
          .select('*, fixture_team_times(*), fixture_team_scores(*)')
          .maybeSingle();
      } else {
        fixtureResult = await supabase
          .from('fixtures')
          .insert(fixtureData)
          .select('*, fixture_team_times(*), fixture_team_scores(*)')
          .maybeSingle();
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

          console.log("Saving team times with performance categories:", teamTimesData);

          // Delete existing team times first
          if (editingFixture?.id) {
            const { error: deleteError } = await supabase
              .from('fixture_team_times')
              .delete()
              .eq('fixture_id', fixtureId);
              
            if (deleteError) {
              console.error("Error deleting existing team times:", deleteError);
            }
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

        // Insert or update team scores with MOTM player IDs
        const teamScoresData = Array.from({ length: parseInt(data.number_of_teams || "1") }).map((_, index) => {
          const teamScore = data[`team_${index + 1}_score`] || 0;
          const opponentScore = data[`opponent_${index + 1}_score`] || 0;
          const motmPlayerId = data.motm_player_ids?.[index] || null;
          
          return {
            fixture_id: fixtureId,
            team_number: index + 1,
            score: teamScore,
            opponent_score: opponentScore,
            motm_player_id: motmPlayerId
          };
        });

        console.log("Saving team scores with MOTM player IDs:", teamScoresData);

        // Delete existing scores first if editing
        if (editingFixture?.id) {
          const { error: deleteScoresError } = await supabase
            .from('fixture_team_scores')
            .delete()
            .eq('fixture_id', fixtureId);
            
          if (deleteScoresError) {
            console.error("Error deleting existing team scores:", deleteScoresError);
          }
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

          console.log("Team scores saved with MOTM player IDs:", scoresResult);
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

        // Include the team times and MOTM player IDs in the returned fixture
        const savedFixture = {
          ...fixtureResult.data,
          ...data,
          id: fixtureId,
          team_times: data.team_times,
          motm_player_ids: data.motm_player_ids
        };

        console.log("Final fixture data with MOTM player IDs:", savedFixture);
        
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
