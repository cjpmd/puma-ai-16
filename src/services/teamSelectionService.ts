
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
      
      for (const [index, period] of periods.entries()) {
        const periodNumber = index + 1;
        
        // Insert period with team_number
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
        
        // Create selection records, maintaining position information
        const selectionRecords = Object.entries(periodSelections)
          .filter(([_, selection]) => selection.playerId !== "unassigned")
          .map(([positionKey, selection]) => ({
            event_id: fixture.id,
            event_type: 'FIXTURE',
            team_number: teamNumber,
            player_id: selection.playerId,
            position: selection.position || positionKey, // Use the saved position or the position key
            period_number: periodNumber,
            performance_category: performanceCategories[`${period.id}-${teamId}`] || 'MESSI'
          }));

        if (selectionRecords.length > 0) {
          const { error: selectionsError } = await supabase
            .from('team_selections')
            .insert(selectionRecords);

          if (selectionsError) {
            console.error("Error saving team selections:", selectionsError);
            throw selectionsError;
          }
        }
      }

      // Handle team captains
      if (teamCaptains[teamId] && teamCaptains[teamId] !== "unassigned") {
        // First find the captain's position from the first period
        const firstPeriodId = periodsPerTeam[teamId]?.[0]?.id;
        const firstPeriodSelections = selections[firstPeriodId]?.[teamId] || {};
        const captainEntry = Object.entries(firstPeriodSelections)
          .find(([_, sel]) => sel.playerId === teamCaptains[teamId]);
        
        const captainPosition = captainEntry ? captainEntry[1].position : null;

        const { error: captainError } = await supabase
          .from('fixture_team_selections')
          .upsert({
            fixture_id: fixture.id,
            player_id: teamCaptains[teamId],
            team_number: teamNumber,
            is_captain: true,
            position: captainPosition,
            performance_category: performanceCategories[`period-1-${teamId}`] || 'MESSI'
          });

        if (captainError) {
          console.error("Error saving team captain:", captainError);
          throw captainError;
        }
      }
    }
  } catch (error) {
    console.error("Error in saveTeamSelections:", error);
    throw error;
  }
};
