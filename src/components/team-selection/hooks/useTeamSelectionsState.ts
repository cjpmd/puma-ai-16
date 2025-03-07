
import { useState, useCallback, useEffect } from "react";
import { PerformanceCategory } from "@/types/player";
import { supabase } from "@/integrations/supabase/client";

interface UseTeamSelectionsStateProps {
  onTeamSelectionsChange?: (selections: Record<string, Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>>) => void;
  fixtureId?: string;
}

export const useTeamSelectionsState = ({ onTeamSelectionsChange, fixtureId }: UseTeamSelectionsStateProps = {}) => {
  const [teamSelections, setTeamSelections] = useState<Record<string, Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>>>({});
  const [periodSelections, setPeriodSelections] = useState<Record<string, Record<number, Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>>>>({});
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [performanceCategories, setPerformanceCategories] = useState<Record<string, PerformanceCategory>>({});
  const [teamFormationTemplates, setTeamFormationTemplates] = useState<Record<string, string>>({});
  const [periodDurations, setPeriodDurations] = useState<Record<string, Record<number, number>>>({});
  const [teamCaptains, setTeamCaptains] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load saved team selections from database if fixtureId is provided
  useEffect(() => {
    const loadSavedSelections = async () => {
      if (!fixtureId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Load team selections from database
        const { data: selectionsData, error: selectionsError } = await supabase
          .from('team_selections')
          .select('*')
          .eq('fixture_id', fixtureId);

        if (selectionsError) throw selectionsError;

        if (selectionsData && selectionsData.length > 0) {
          // Process team selections
          const loadedTeamSelections: Record<string, Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>> = {};
          const loadedPeriodSelections: Record<string, Record<number, Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>>> = {};
          const loadedPerformanceCategories: Record<string, PerformanceCategory> = {};
          const loadedTeamCaptains: Record<string, string> = {};
          const loadedSelectedPlayers = new Set<string>();
          const loadedTeamFormationTemplates: Record<string, string> = {};
          const loadedPeriodDurations: Record<string, Record<number, number>> = {};

          selectionsData.forEach(selection => {
            const teamId = selection.team_id;
            
            // Process team formations
            if (selection.formation_template) {
              loadedTeamFormationTemplates[teamId] = selection.formation_template;
            }
            
            // Process performance categories
            if (selection.performance_category) {
              loadedPerformanceCategories[teamId] = selection.performance_category as PerformanceCategory;
            }
            
            // Process captains
            if (selection.captain_id) {
              loadedTeamCaptains[teamId] = selection.captain_id;
            }
            
            // Process player selections
            if (selection.player_selections && selection.player_selections.length > 0) {
              // Initialize team selections if needed
              if (!loadedTeamSelections[teamId]) {
                loadedTeamSelections[teamId] = {};
              }
              
              // Process each player selection
              selection.player_selections.forEach((playerSelection: any) => {
                const { player_id, position, period_number = 0 } = playerSelection;
                
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
                    
                    loadedPeriodSelections[teamId][period_number][slotId] = {
                      playerId: player_id,
                      position,
                      performanceCategory: loadedPerformanceCategories[teamId] || 'MESSI'
                    };
                    
                    // Store period durations
                    if (playerSelection.duration) {
                      if (!loadedPeriodDurations[teamId]) {
                        loadedPeriodDurations[teamId] = {};
                      }
                      loadedPeriodDurations[teamId][period_number] = playerSelection.duration;
                    }
                  } else {
                    // Default team selections (no period)
                    loadedTeamSelections[teamId][slotId] = {
                      playerId: player_id,
                      position,
                      performanceCategory: loadedPerformanceCategories[teamId] || 'MESSI'
                    };
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
        }
      } catch (error) {
        console.error("Error loading team selections:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedSelections();
  }, [fixtureId]);

  const handleTeamSelectionChange = useCallback((teamId: string, selections: Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>) => {
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

  const handlePeriodSelectionChange = useCallback((teamId: string, periodId: number, selections: Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>) => {
    setPeriodSelections(prev => ({
      ...prev,
      [teamId]: {
        ...(prev[teamId] || {}),
        [periodId]: selections
      }
    }));
  }, []);

  const handlePeriodDurationChange = useCallback((teamId: string, periodId: number, duration: number) => {
    setPeriodDurations(prev => ({
      ...prev,
      [teamId]: {
        ...(prev[teamId] || {}),
        [periodId]: duration
      }
    }));
  }, []);

  const handlePerformanceCategoryChange = useCallback((teamId: string, category: PerformanceCategory) => {
    setPerformanceCategories(prev => ({
      ...prev,
      [teamId]: category
    }));
  }, []);

  const handleTemplateChange = useCallback((teamId: string, template: string) => {
    setTeamFormationTemplates(prev => ({
      ...prev,
      [teamId]: template
    }));
  }, []);

  const handleCaptainChange = useCallback((teamId: string, playerId: string) => {
    setTeamCaptains(prev => ({
      ...prev,
      [teamId]: playerId
    }));
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
