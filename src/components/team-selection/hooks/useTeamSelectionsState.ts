import { useState, useCallback, useEffect } from "react";
import { PerformanceCategory } from "@/types/player";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseTeamSelectionsStateProps {
  onTeamSelectionsChange?: (selections: Record<string, Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>>) => void;
  fixtureId?: string;
}

// Define a type for the selection object that includes optional isSubstitution property
interface PlayerSelection {
  playerId: string;
  position: string;
  performanceCategory?: PerformanceCategory;
}

// Interface for loaded selection that may include isSubstitution
interface LoadedPlayerSelection extends PlayerSelection {
  isSubstitution?: boolean;
}

export const useTeamSelectionsState = ({ onTeamSelectionsChange, fixtureId }: UseTeamSelectionsStateProps = {}) => {
  const [teamSelections, setTeamSelections] = useState<Record<string, Record<string, PlayerSelection>>>({});
  const [periodSelections, setPeriodSelections] = useState<Record<string, Record<number, Record<string, PlayerSelection>>>>({});
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [performanceCategories, setPerformanceCategories] = useState<Record<string, PerformanceCategory>>({});
  const [teamFormationTemplates, setTeamFormationTemplates] = useState<Record<string, string>>({});
  const [periodDurations, setPeriodDurations] = useState<Record<string, Record<number, number>>>({});
  const [teamCaptains, setTeamCaptains] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load saved team selections from database if fixtureId is provided
  useEffect(() => {
    const loadSavedSelections = async () => {
      if (!fixtureId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log("Loading saved selections for fixture:", fixtureId);
        
        // Load team selections from database
        const { data: selectionsData, error: selectionsError } = await supabase
          .from('team_selections')
          .select('*')
          .eq('fixture_id', fixtureId);

        if (selectionsError) throw selectionsError;

        if (selectionsData && selectionsData.length > 0) {
          // Process team selections
          const loadedTeamSelections: Record<string, Record<string, PlayerSelection>> = {};
          const loadedPeriodSelections: Record<string, Record<number, Record<string, PlayerSelection>>> = {};
          const loadedPerformanceCategories: Record<string, PerformanceCategory> = {};
          const loadedTeamCaptains: Record<string, string> = {};
          const loadedSelectedPlayers = new Set<string>();
          const loadedTeamFormationTemplates: Record<string, string> = {};
          const loadedPeriodDurations: Record<string, Record<number, number>> = {};

          selectionsData.forEach(selection => {
            const teamId = selection?.team_id;
            
            // Initialize team selections if needed
            if (!loadedTeamSelections[teamId]) {
              loadedTeamSelections[teamId] = {};
            }
            
            // Process team formations
            if (selection?.formation_template) {
              loadedTeamFormationTemplates[teamId] = selection.formation_template;
              console.log(`Loaded template for team ${teamId}:`, selection.formation_template);
            }
            
            // Process performance categories
            if (selection?.performance_category) {
              loadedPerformanceCategories[teamId] = selection.performance_category as PerformanceCategory;
              console.log(`Loaded performance category for team ${teamId}:`, selection.performance_category);
            }
            
            // Process captains
            if (selection?.captain_id) {
              loadedTeamCaptains[teamId] = selection.captain_id;
              console.log(`Loaded captain for team ${teamId}:`, selection.captain_id);
            }
            
            // Process player selections
            if (selection?.player_selections && selection?.player_selections.length > 0) {
              console.log(`Processing ${selection?.player_selections.length} player selections for team ${teamId}`);
              
              // Process each player selection
              selection?.player_selections.forEach((playerSelection: any) => {
                const { player_id, position, period_number = 0, is_substitute, duration } = playerSelection;
                
                if (player_id && position) {
                  const slotId = `${position.toLowerCase()}-${player_id}`;
                  
                  // Add to selected players set
                  loadedSelectedPlayers.add(player_id);
                  
                  // Handle period selections
                  if (period_number > 0) {
                    if (!loadedPeriodSelections[teamId]) {
                      loadedPeriodSelections[teamId] = {};
                    }
                    
                    if (!loadedPeriodSelections[teamId][period_number]) {
                      loadedPeriodSelections[teamId][period_number] = {};
                    }
                    
                    // Create the properly typed PlayerSelection object
                    const playerSelectionObj: PlayerSelection = {
                      playerId: player_id,
                      position,
                      performanceCategory: loadedPerformanceCategories[teamId] || 'MESSI'
                    };
                    
                    loadedPeriodSelections[teamId][period_number][slotId] = playerSelectionObj;
                    
                    // Store period durations
                    if (duration) {
                      if (!loadedPeriodDurations[teamId]) {
                        loadedPeriodDurations[teamId] = {};
                      }
                      loadedPeriodDurations[teamId][period_number] = duration;
                      console.log(`Loaded duration for team ${teamId}, period ${period_number}:`, duration);
                    }
                  } else {
                    // Default team selections (no period)
                    // Create the properly typed PlayerSelection object
                    const playerSelectionObj: PlayerSelection = {
                      playerId: player_id,
                      position,
                      performanceCategory: loadedPerformanceCategories[teamId] || 'MESSI'
                    };
                    
                    loadedTeamSelections[teamId][slotId] = playerSelectionObj;
                  }
                }
              });
            }
          });

          // Update state with loaded data
          setTeamSelections(loadedTeamSelections);
          setPeriodSelections(loadedPeriodSelections);
          setSelectedPlayers(loadedSelectedPlayers);
          setPerformanceCategories(loadedPerformanceCategories);
          setTeamFormationTemplates(loadedTeamFormationTemplates);
          setPeriodDurations(loadedPeriodDurations);
          setTeamCaptains(loadedTeamCaptains);
          setDataLoaded(true);
          
          console.log("Successfully loaded team selections:", {
            teams: Object.keys(loadedTeamSelections).length,
            players: loadedSelectedPlayers.size,
            captains: Object.keys(loadedTeamCaptains).length,
            periods: Object.values(loadedPeriodSelections).reduce((acc, team) => acc + Object.keys(team).length, 0)
          });
        } else {
          console.log("No saved selections found for fixture:", fixtureId);
        }
      } catch (error) {
        console.error("Error loading team selections:", error);
        toast.error("Failed to load team selections");
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedSelections();
  }, [fixtureId]);

  const handleTeamSelectionChange = useCallback((teamId: string, selections: Record<string, PlayerSelection>) => {
    setTeamSelections(prev => {
      const updated = {
        ...prev,
        [teamId]: selections
      };
      
      if (onTeamSelectionsChange) {
        onTeamSelectionsChange(updated);
      }
      
      return updated;
    });

    const currentSelectedPlayers = new Set(selectedPlayers);
    Object.values(selections).forEach(selection => {
      if (selection.playerId && selection.playerId !== "unassigned") {
        currentSelectedPlayers.add(selection.playerId);
      }
    });
    setSelectedPlayers(currentSelectedPlayers);
  }, [selectedPlayers, onTeamSelectionsChange]);

  const handlePeriodSelectionChange = useCallback((teamId: string, periodId: number, selections: Record<string, PlayerSelection>) => {
    setPeriodSelections(prev => {
      const updated = {
        ...prev,
        [teamId]: {
          ...(prev[teamId] || {}),
          [periodId]: selections
        }
      };
      console.log(`Updated period selections for team ${teamId}, period ${periodId}`, Object.keys(selections).length);
      return updated;
    });
  }, []);

  const handlePeriodDurationChange = useCallback((teamId: string, periodId: number, duration: number) => {
    setPeriodDurations(prev => {
      const updated = {
        ...prev,
        [teamId]: {
          ...(prev[teamId] || {}),
          [periodId]: duration
        }
      };
      console.log(`Updated period duration for team ${teamId}, period ${periodId}:`, duration);
      return updated;
    });
  }, []);

  const handlePerformanceCategoryChange = useCallback((teamId: string, category: PerformanceCategory) => {
    setPerformanceCategories(prev => {
      const updated = {
        ...prev,
        [teamId]: category
      };
      console.log(`Updated performance category for team ${teamId}:`, category);
      return updated;
    });
  }, []);

  const handleTemplateChange = useCallback((teamId: string, template: string) => {
    setTeamFormationTemplates(prev => {
      const updated = {
        ...prev,
        [teamId]: template
      };
      console.log(`Updated formation template for team ${teamId}:`, template);
      return updated;
    });
  }, []);

  const handleCaptainChange = useCallback((teamId: string, playerId: string) => {
    setTeamCaptains(prev => {
      const updated = {
        ...prev,
        [teamId]: playerId
      };
      console.log(`Updated captain for team ${teamId}:`, playerId);
      return updated;
    });
  }, []);

  return {
    teamSelections,
    periodSelections,
    selectedPlayers,
    performanceCategories,
    teamFormationTemplates,
    periodDurations,
    teamCaptains,
    isLoading,
    dataLoaded, // Make sure this property is returned
    handleTeamSelectionChange,
    handlePeriodSelectionChange,
    handlePeriodDurationChange,
    handlePerformanceCategoryChange,
    handleTemplateChange,
    handleCaptainChange,
    setTeamSelections,
    setPeriodSelections,
    setSelectedPlayers,
    setPerformanceCategories,
    setTeamFormationTemplates,
    setPeriodDurations,
    setTeamCaptains
  };
};
