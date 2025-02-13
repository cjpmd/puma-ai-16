
import { supabase } from "@/integrations/supabase/client";

export const saveTeamSelections = async (
  fixture: any,
  periodsPerTeam: Record<string, Array<{ id: string; duration: number }>>,
  selections: Record<string, Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>>,
  performanceCategories: Record<string, string>,
  teamCaptains: Record<string, string>
) => {
  if (!fixture) return;

  try {
    console.log('Saving team selections:', { periodsPerTeam, selections, performanceCategories });

    // Clear existing team selections
    const { error: deleteSelectionsError } = await supabase
      .from('team_selections')
      .delete()
      .eq('event_id', fixture.id)
      .eq('event_type', 'FIXTURE');

    if (deleteSelectionsError) throw deleteSelectionsError;

    // Clear existing periods
    const { error: deletePeriodsError } = await supabase
      .from('event_periods')
      .delete()
      .eq('event_id', fixture.id)
      .eq('event_type', 'FIXTURE');

    if (deletePeriodsError) throw deletePeriodsError;

    // Process each team's periods and selections
    for (const [teamId, periods] of Object.entries(periodsPerTeam)) {
      const teamNumber = parseInt(teamId);
      
      // Update fixture_team_times with performance category
      const { error: updateTeamTimesError } = await supabase
        .from('fixture_team_times')
        .upsert({
          fixture_id: fixture.id,
          team_number: teamNumber,
          performance_category: performanceCategories[`period-1-${teamId}`] || 'MESSI'
        });

      if (updateTeamTimesError) {
        console.error("Error updating team times:", updateTeamTimesError);
        throw updateTeamTimesError;
      }
      
      for (const [index, period] of periods.entries()) {
        const periodNumber = index + 1;
        
        // Insert period with team_number and duration
        const { data: insertedPeriod, error: periodError } = await supabase
          .from('event_periods')
          .insert({
            event_id: fixture.id,
            event_type: 'FIXTURE',
            period_number: periodNumber,
            duration_minutes: period.duration,
            team_number: teamNumber
          })
          .select()
          .single();

        if (periodError) {
          console.error("Error creating period:", periodError);
          throw periodError;
        }

        // Get selections for this period and team
        const periodSelections = selections[period.id]?.[teamId] || {};
        
        // Create selection records for all positions
        for (const [positionKey, selection] of Object.entries(periodSelections)) {
          if (selection.playerId === "unassigned") continue;

          const selectionRecord = {
            event_id: fixture.id,
            event_type: 'FIXTURE',
            team_number: teamNumber,
            player_id: selection.playerId,
            position: selection.position,
            position_key: positionKey,
            period_number: periodNumber,
            performance_category: performanceCategories[`${period.id}-${teamId}`] || selection.performanceCategory || 'MESSI',
            duration_minutes: period.duration
          };

          console.log("Saving selection record:", selectionRecord);

          const { error: selectionError } = await supabase
            .from('team_selections')
            .insert(selectionRecord);

          if (selectionError) {
            console.error("Error saving team selection:", selectionError);
            throw selectionError;
          }
        }
      }

      // Handle team captains
      if (teamCaptains[teamId] && teamCaptains[teamId] !== "unassigned") {
        const { error: captainError } = await supabase
          .from('fixture_team_selections')
          .upsert({
            fixture_id: fixture.id,
            player_id: teamCaptains[teamId],
            team_number: teamNumber,
            is_captain: true,
            position: Object.entries(selections[periodsPerTeam[teamId][0]?.id]?.[teamId] || {})
              .find(([_, sel]) => sel.playerId === teamCaptains[teamId])?.[1]?.position,
            performance_category: performanceCategories[`period-1-${teamId}`] || 'MESSI'
          });

        if (captainError) {
          console.error("Error saving team captain:", captainError);
          throw captainError;
        }
      }
    }

    console.log("Team selections saved successfully");
  } catch (error) {
    console.error("Error in saveTeamSelections:", error);
    throw error;
  }
};
