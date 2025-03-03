
import { 
  AllSelections, 
  PeriodsPerTeam, 
  PerformanceCategories, 
  TeamCaptains 
} from "../types";
import { mapPositionToSlot, extractSelectedPlayers } from "../utils/selectionUtils";

export const useProcessSelections = () => {
  const processExistingSelections = (
    existingSelections: any[],
    setPeriodsPerTeam: (value: React.SetStateAction<PeriodsPerTeam>) => void,
    setSelections: (value: React.SetStateAction<AllSelections>) => void,
    setTeamCaptains: (value: React.SetStateAction<TeamCaptains>) => void,
    setPerformanceCategories: (value: React.SetStateAction<PerformanceCategories>) => void,
    setSelectedPlayers: (value: React.SetStateAction<Set<string>>) => void
  ) => {
    if (!existingSelections || existingSelections.length === 0) return false;
    
    console.log("Processing existing selections:", existingSelections);
    
    try {
      // Create a structured map to organize selections by team and period
      const selectionsByTeamAndPeriod = existingSelections.reduce((acc: Record<string, Record<string, any[]>>, selection: any) => {
        const teamId = selection.team_number?.toString() || '1';
        const periodId = selection.period_id || 'first-half-period-1';
        
        if (!acc[teamId]) acc[teamId] = {};
        if (!acc[teamId][periodId]) acc[teamId][periodId] = [];
        
        acc[teamId][periodId].push(selection);
        return acc;
      }, {});
      
      console.log("Selections organized by team and period:", selectionsByTeamAndPeriod);
      
      // Initialize data structures
      const loadedSelections: AllSelections = {};
      const loadedTeamCaptains: TeamCaptains = {};
      const loadedPeriodsPerTeam: PeriodsPerTeam = {};
      const loadedPerformanceCategories: PerformanceCategories = {};
      
      // Process each team
      Object.keys(selectionsByTeamAndPeriod).forEach(teamId => {
        if (!loadedPeriodsPerTeam[teamId]) {
          loadedPeriodsPerTeam[teamId] = [];
        }
        
        // Process each period for this team
        Object.keys(selectionsByTeamAndPeriod[teamId]).forEach(periodId => {
          const periodSelections = selectionsByTeamAndPeriod[teamId][periodId];
          
          // Add this period to the team's periods if not already present
          if (!loadedPeriodsPerTeam[teamId].some(p => p.id === periodId)) {
            loadedPeriodsPerTeam[teamId].push({
              id: periodId,
              duration: periodSelections[0]?.duration || 20
            });
          }
          
          // Initialize selection structure for this period/team
          if (!loadedSelections[periodId]) {
            loadedSelections[periodId] = {};
          }
          if (!loadedSelections[periodId][teamId]) {
            loadedSelections[periodId][teamId] = {};
          }
          
          // Process selections for this period/team
          periodSelections.forEach(selection => {
            // Use the position from DB to determine the appropriate slot
            const slotId = mapPositionToSlot(selection.position);
            
            // Skip invalid slots
            if (!slotId) return;
            
            // Add the selection with the original position preserved
            loadedSelections[periodId][teamId][slotId] = {
              playerId: selection.player_id,
              position: selection.position, // Keep original position from DB
              performanceCategory: selection.performance_category || 'MESSI'
            };
            
            // Record captain
            if (selection.is_captain) {
              loadedTeamCaptains[teamId] = selection.player_id;
            }
            
            // Record performance category
            loadedPerformanceCategories[`${periodId}-${teamId}`] = selection.performance_category || 'MESSI';
          });
        });
        
        // Sort periods by their number
        loadedPeriodsPerTeam[teamId].sort((a, b) => {
          const aNum = parseInt(a.id.replace(/[^\d]/g, '')) || 0;
          const bNum = parseInt(b.id.replace(/[^\d]/g, '')) || 0;
          return aNum - bNum;
        });
      });
      
      console.log("Loaded data from selections:", {
        loadedSelections,
        loadedTeamCaptains,
        loadedPeriodsPerTeam,
        loadedPerformanceCategories
      });
      
      // Update state with loaded data if we have any periods
      let hasPeriods = false;
      Object.values(loadedPeriodsPerTeam).forEach(periods => {
        if (periods.length > 0) hasPeriods = true;
      });
      
      if (hasPeriods) {
        setPeriodsPerTeam(loadedPeriodsPerTeam);
        setSelections(loadedSelections);
        setTeamCaptains(loadedTeamCaptains);
        setPerformanceCategories(loadedPerformanceCategories);
        
        // Update selected players
        const selectedPlayers = extractSelectedPlayers(loadedSelections);
        setSelectedPlayers(selectedPlayers);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error processing existing selections:", error);
      return false;
    }
  };

  return { processExistingSelections };
};
