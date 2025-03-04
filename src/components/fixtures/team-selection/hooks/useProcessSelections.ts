
import { useCallback } from "react";

export const useProcessSelections = () => {
  // Process fixture team selections data from DB into our app's structure
  const processExistingSelections = useCallback((
    existingSelections,
    setPeriodsPerTeam,
    setSelections,
    setTeamCaptains,
    setPerformanceCategories,
    setSelectedPlayers
  ) => {
    try {
      console.log("Processing existing selections:", existingSelections);
      
      if (!existingSelections || existingSelections.length === 0) {
        console.log("No existing selections to process");
        return;
      }
      
      // Temporary data stores
      const newPeriodsPerTeam = {};
      const newSelections = {};
      const newTeamCaptains = {};
      const newPerformanceCategories = {};
      const newSelectedPlayers = new Set();
      
      // Group selections by period_id and team_number
      existingSelections.forEach(selection => {
        const periodId = selection.period_id;
        const teamId = selection.team_number.toString();
        const playerId = selection.player_id;
        const isCaptain = selection.is_captain;
        const performanceCategory = selection.performance_category || "MESSI";
        const position = selection.position;
        const isSubstitution = selection.is_substitution || false;
        const duration = selection.duration || 45;
        
        // Initialize period in the map
        if (!newPeriodsPerTeam[teamId]) {
          newPeriodsPerTeam[teamId] = [];
        }
        
        // Add period if it doesn't exist yet
        const periodExists = newPeriodsPerTeam[teamId].some(p => p.id === periodId);
        if (!periodExists) {
          newPeriodsPerTeam[teamId].push({
            id: periodId,
            duration: duration
          });
        }
        
        // Initialize selection for this period
        if (!newSelections[periodId]) {
          newSelections[periodId] = {};
        }
        
        if (!newSelections[periodId][teamId]) {
          newSelections[periodId][teamId] = {};
        }
        
        // Generate a unique slot ID based on position or create one for substitutes
        let slotId = position;
        if (isSubstitution) {
          // For substitutes, use a special prefix
          const existingSubsCount = Object.entries(newSelections[periodId][teamId])
            .filter(([_, sel]) => sel.isSubstitution)
            .length;
          slotId = `sub-${existingSubsCount}`;
        }
        
        // Add selection
        newSelections[periodId][teamId][slotId] = {
          playerId,
          position,
          performanceCategory,
          isSubstitution
        };
        
        // Add to selected players set
        newSelectedPlayers.add(playerId);
        
        // Set captain if applicable
        if (isCaptain) {
          newTeamCaptains[teamId] = playerId;
        }
        
        // Store performance category
        if (!newPerformanceCategories[periodId]) {
          newPerformanceCategories[periodId] = {};
        }
        if (!newPerformanceCategories[periodId][teamId]) {
          newPerformanceCategories[periodId][teamId] = performanceCategory;
        }
      });
      
      // Sort periods to ensure they appear in correct order
      Object.keys(newPeriodsPerTeam).forEach(teamId => {
        newPeriodsPerTeam[teamId].sort((a, b) => {
          // Period IDs are in format "half-period", e.g. "first-1"
          const [aHalf, aPeriod] = a.id.split('-');
          const [bHalf, bPeriod] = b.id.split('-');
          
          // Compare halves first
          if (aHalf !== bHalf) {
            return aHalf === "first" ? -1 : 1;
          }
          
          // Then compare period numbers
          return parseInt(aPeriod) - parseInt(bPeriod);
        });
      });
      
      console.log("Processed data:", {
        periodsPerTeam: newPeriodsPerTeam,
        selections: newSelections,
        teamCaptains: newTeamCaptains,
        performanceCategories: newPerformanceCategories,
        selectedPlayers: Array.from(newSelectedPlayers)
      });
      
      // Update state with processed data
      setPeriodsPerTeam(newPeriodsPerTeam);
      setSelections(newSelections);
      setTeamCaptains(newTeamCaptains);
      setPerformanceCategories(newPerformanceCategories);
      setSelectedPlayers(newSelectedPlayers);
      
    } catch (error) {
      console.error("Error processing existing selections:", error);
    }
  }, []);

  return { processExistingSelections };
};
