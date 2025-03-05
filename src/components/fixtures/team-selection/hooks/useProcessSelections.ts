
import { useTeamSelection } from "../context/TeamSelectionContext";
import { usePeriods } from "../hooks/usePeriods";
import { TeamSelection, AllSelections, PeriodsPerTeam, TeamCaptains } from "../types";

export const useProcessSelections = () => {
  const { selections, teamCaptains } = useTeamSelection();
  const { periodsPerTeam } = usePeriods();

  // Process the raw selections into a format suitable for saving to the database
  const processSelections = (): {
    selectionsToSave: any[];
    hasChanges: boolean;
  } => {
    const selectionsToSave: any[] = [];
    let hasChanges = false;

    // Process each team and each period
    for (const teamId of Object.keys(periodsPerTeam)) {
      const teamPeriods = periodsPerTeam[teamId] || [];
      
      for (const period of teamPeriods) {
        const periodId = period.id;
        const teamSelections = selections[periodId]?.[teamId] || {};
        
        // Process each player selection for this team/period
        Object.entries(teamSelections).forEach(([slotId, selection]) => {
          // Safely check if selection is a valid object with the correct properties
          if (selection && typeof selection === 'object' && 'playerId' in selection) {
            const { playerId, position } = selection;
            
            // Make sure playerId exists and is not "unassigned" before processing
            if (playerId && typeof playerId === 'string' && playerId !== "unassigned") {
              // Extract substitution status from slot ID or explicit flag
              const isSubstitution = typeof selection === 'object' && 
                ('isSubstitution' in selection 
                  ? Boolean(selection.isSubstitution) 
                  : slotId.startsWith('sub-'));
              
              // Create a record with period information
              selectionsToSave.push({
                player_id: playerId,
                position: position || slotId,
                performance_category: 'performanceCategory' in selection ? selection.performanceCategory : "MESSI",
                team_number: parseInt(teamId),
                is_captain: typeof teamCaptains[teamId] === 'string' && teamCaptains[teamId] === playerId,
                period_id: periodId,
                duration: period.duration || 45,
                is_substitution: isSubstitution
              });
              
              hasChanges = true;
            }
          }
        });
      }
    }

    return {
      selectionsToSave,
      hasChanges
    };
  };

  return {
    processSelections
  };
};
