
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  AllSelections, 
  TeamSelections, 
  PeriodsPerTeam, 
  PerformanceCategories, 
  TeamCaptains 
} from "../types";

export const useTeamSelectionData = (fixtureId: string | undefined) => {
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [periodsPerTeam, setPeriodsPerTeam] = useState<PeriodsPerTeam>({});
  const [selections, setSelections] = useState<AllSelections>({});
  const [performanceCategories, setPerformanceCategories] = useState<PerformanceCategories>({});
  const [teamCaptains, setTeamCaptains] = useState<TeamCaptains>({});
  
  // Fetch available players
  const { data: availablePlayers = [], isLoading: isLoadingPlayers } = useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch existing team selections when fixture is loaded
  const { data: existingSelections = [], isLoading: isLoadingSelections } = useQuery({
    queryKey: ["fixture-selections", fixtureId],
    queryFn: async () => {
      if (!fixtureId) return [];
      
      console.log("Fetching existing selections for fixture:", fixtureId);
      
      try {
        const { data, error } = await supabase
          .from("fixture_team_selections")
          .select("*")
          .eq("fixture_id", fixtureId);
        
        if (error) {
          console.error("Error fetching selections:", error);
          return [];
        }
        
        console.log("Fetched selections:", data);
        return data || [];
      } catch (error) {
        console.error("Exception fetching selections:", error);
        return [];
      }
    },
    enabled: !!fixtureId,
  });

  // Helper function to map DB position to UI slot
  const mapPositionToSlot = (position: string) => {
    const positionToSlotMap: Record<string, string> = {
      'GK': 'gk-1',
      'DL': 'def-1',
      'DC': 'def-2',
      'DCL': 'def-2', // Map both DC and DCL to def-2
      'DCR': 'def-3', // Map DCR to def-3
      'DR': 'def-3',
      'MC': 'mid-1',
      'AMC': 'str-2',
      'STC': 'str-1',
      'AML': 'mid-2',
      'AMR': 'mid-3',
      'ML': 'mid-2',
      'MR': 'mid-3'
    };
    
    return positionToSlotMap[position] || `pos-${Math.random()}`;
  };

  // Initialize periods for each team when fixture changes
  const initializeTeamPeriods = (fixture: any) => {
    if (!fixture) return;

    const newPeriodsPerTeam: PeriodsPerTeam = {};
    const newSelections: AllSelections = {};
    const newPerformanceCategories: PerformanceCategories = {};
    const newTeamCaptains: TeamCaptains = {};

    // Initialize one period for each team
    for (let i = 1; i <= (fixture.number_of_teams || 1); i++) {
      const teamId = i.toString();
      const periodId = `period-1`;
      
      newPeriodsPerTeam[teamId] = [{ id: periodId, duration: 20 }];
      
      // Initialize empty selections for this period/team
      if (!newSelections[periodId]) {
        newSelections[periodId] = {};
      }
      newSelections[periodId][teamId] = {};
      
      // Set initial performance category for the period
      newPerformanceCategories[`${periodId}-${teamId}`] = 'MESSI';
    }

    setPeriodsPerTeam(newPeriodsPerTeam);
    setSelections(newSelections);
    setPerformanceCategories(newPerformanceCategories);
    setTeamCaptains(newTeamCaptains);
  };

  // Load existing selections when they're fetched
  const processExistingSelections = () => {
    if (!existingSelections || existingSelections.length === 0) return;
    
    console.log("Processing existing selections:", existingSelections);
    
    try {
      // Create a structured map to organize selections by team and period
      const selectionsByTeamAndPeriod = existingSelections.reduce((acc: Record<string, Record<string, any[]>>, selection: any) => {
        const teamId = selection.team_number?.toString() || '1';
        const periodId = selection.period_id || 'period-1';
        
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
            // Extract period number from periodId (e.g., "period-2" -> 2)
            const periodNumber = parseInt(periodId.replace('period-', '')) || 1;
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
          const aNum = parseInt(a.id.replace('period-', ''));
          const bNum = parseInt(b.id.replace('period-', ''));
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
        updateSelectedPlayersFromSelections(loadedSelections);
      }
    } catch (error) {
      console.error("Error processing existing selections:", error);
    }
  };

  // Helper to update selected players from selections
  const updateSelectedPlayersFromSelections = (selectionsData: AllSelections) => {
    const newSelectedPlayers = new Set<string>();
    
    Object.values(selectionsData).forEach(periodSelections => {
      Object.values(periodSelections).forEach(teamSelections => {
        Object.values(teamSelections).forEach(selection => {
          if (selection.playerId && selection.playerId !== "unassigned") {
            newSelectedPlayers.add(selection.playerId);
          }
        });
      });
    });
    
    setSelectedPlayers(newSelectedPlayers);
  };

  // Update selected players
  const updateSelectedPlayers = () => {
    updateSelectedPlayersFromSelections(selections);
  };

  // Handler for captain changes
  const handleCaptainChange = (teamId: string, playerId: string) => {
    setTeamCaptains(prev => ({
      ...prev,
      [teamId]: playerId
    }));
  };

  // Handler for deleting periods
  const handleDeletePeriod = (teamId: string, periodId: string) => {
    setPeriodsPerTeam(prev => {
      const newPeriodsPerTeam = { ...prev };
      newPeriodsPerTeam[teamId] = prev[teamId].filter(p => p.id !== periodId);
      return newPeriodsPerTeam;
    });
    
    // Clean up selections for deleted period
    setSelections(prev => {
      const newSelections = { ...prev };
      if (newSelections[periodId]) {
        delete newSelections[periodId][teamId];
        if (Object.keys(newSelections[periodId]).length === 0) {
          delete newSelections[periodId];
        }
      }
      return newSelections;
    });

    // Clean up performance categories for deleted period
    setPerformanceCategories(prev => {
      const newCategories = { ...prev };
      delete newCategories[`${periodId}-${teamId}`];
      return newCategories;
    });
  };

  // Handler for adding periods
  const handleAddPeriod = (teamId: string) => {
    const currentPeriods = periodsPerTeam[teamId] || [];
    const newPeriodNumber = currentPeriods.length + 1;
    const newPeriodId = `period-${newPeriodNumber}`;
    
    // Get the last period's selections to duplicate
    let lastPeriodSelections = {};
    if (currentPeriods.length > 0) {
      const lastPeriodId = currentPeriods[currentPeriods.length - 1].id;
      if (selections[lastPeriodId] && selections[lastPeriodId][teamId]) {
        // Deep clone to avoid reference issues
        lastPeriodSelections = JSON.parse(JSON.stringify(selections[lastPeriodId][teamId]));
        console.log(`Duplicating selections from ${lastPeriodId} to ${newPeriodId}:`, lastPeriodSelections);
      }
    }
    
    // Add new period
    setPeriodsPerTeam(prev => ({
      ...prev,
      [teamId]: [...(prev[teamId] || []), { id: newPeriodId, duration: 20 }]
    }));

    // Duplicate the selections from the last period
    setSelections(prev => {
      const newSelections = { ...prev };
      if (!newSelections[newPeriodId]) {
        newSelections[newPeriodId] = {};
      }
      newSelections[newPeriodId][teamId] = lastPeriodSelections;
      return newSelections;
    });

    // Copy performance category from the last period
    if (currentPeriods.length > 0) {
      const lastPeriodId = currentPeriods[currentPeriods.length - 1].id;
      const lastCategory = performanceCategories[`${lastPeriodId}-${teamId}`] || 'MESSI';
      setPerformanceCategories(prev => ({
        ...prev,
        [`${newPeriodId}-${teamId}`]: lastCategory
      }));
    } else {
      setPerformanceCategories(prev => ({
        ...prev,
        [`${newPeriodId}-${teamId}`]: 'MESSI'
      }));
    }
  };

  // Handler for team selection changes
  const handleTeamSelectionChange = (periodId: string, teamId: string, teamSelections: TeamSelections) => {
    console.log(`TeamSelectionManager: Received selection change for period ${periodId}, team ${teamId}:`, JSON.stringify(teamSelections));
    
    // Update selections with a deep clone to ensure no reference issues
    setSelections(prev => {
      const newSelections = { ...prev };
      if (!newSelections[periodId]) {
        newSelections[periodId] = {};
      }
      // Deep clone to ensure no reference issues
      newSelections[periodId][teamId] = JSON.parse(JSON.stringify(teamSelections));
      return newSelections;
    });

    // Update selected players across all periods and teams
    updateSelectedPlayers();
  };

  // Handler for duration changes
  const handleDurationChange = (teamId: string, periodId: string, duration: number) => {
    setPeriodsPerTeam(prev => ({
      ...prev,
      [teamId]: prev[teamId].map(period => 
        period.id === periodId ? { ...period, duration } : period
      )
    }));
  };

  // Effect to initialize data when fixture changes
  useEffect(() => {
    if (fixtureId) {
      processExistingSelections();
    }
  }, [existingSelections]);

  return {
    availablePlayers,
    selectedPlayers,
    periodsPerTeam,
    selections,
    performanceCategories,
    teamCaptains,
    isLoading: isLoadingPlayers || isLoadingSelections,
    actions: {
      handleCaptainChange,
      handleDeletePeriod,
      handleAddPeriod,
      handleTeamSelectionChange,
      handleDurationChange,
      setPerformanceCategories,
      updateSelectedPlayers,
      initializeTeamPeriods
    }
  };
};
