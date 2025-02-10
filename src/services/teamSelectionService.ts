
import { supabase } from "@/integrations/supabase/client";

export const saveTeamSelections = async (
  fixture: any,
  periodsPerTeam: Record<string, Array<{ id: string; duration: number }>>,
  selections: Record<string, Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>>,
  performanceCategories: Record<string, string>,
  teamCaptains: Record<string, string>
) => {
  if (!fixture) return;

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

  // Insert new periods and selections for each team
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

      // Insert selections for this period if they exist
      const periodSelections = selections[period.id]?.[teamId] || {};
      const selectionRecords = Object.entries(periodSelections)
        .filter(([_, selection]) => selection.playerId !== "unassigned")
        .map(([position, selection]) => ({
          event_id: fixture.id,
          event_type: 'FIXTURE',
          team_number: teamNumber,
          player_id: selection.playerId,
          position: position,
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
  }

  // Handle team captains
  await Promise.all(
    Object.entries(teamCaptains).map(async ([teamId, captainId]) => {
      if (captainId && captainId !== "unassigned") {
        // Get captain's position from first period selections if available
        const firstPeriodId = periodsPerTeam[teamId]?.[0]?.id;
        const captainPosition = firstPeriodId && 
          selections[firstPeriodId]?.[teamId]?.[Object.keys(selections[firstPeriodId][teamId]).find(key => 
            selections[firstPeriodId][teamId][key].playerId === captainId
          ) || '']?.position || null;

        const { error: captainError } = await supabase
          .from('fixture_team_selections')
          .upsert({
            fixture_id: fixture.id,
            player_id: captainId,
            team_number: parseInt(teamId),
            is_captain: true,
            performance_category: performanceCategories[`period-1-${teamId}`] || 'MESSI',
            position: captainPosition
          });

        if (captainError) {
          console.error("Error saving team captain:", captainError);
          throw captainError;
        }
      }
    })
  );
};
