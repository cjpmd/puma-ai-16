
import { useCallback, useState } from "react";
import { PerformanceCategory } from "@/types/player";
import { toast } from "sonner";
import { useTeamSelectionsState } from "./useTeamSelectionsState";
import { usePeriodManagement } from "./usePeriodManagement";
import { useDragAndDrop } from "./useDragAndDrop";
import { useSquadManagement } from "./useSquadManagement";
import { supabase } from "@/integrations/supabase/client";

export type PeriodData = {
  id: number;
  name: string;
  duration: number;
  selections: Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>;
};

export const useTeamSelections = (onTeamSelectionsChange?: (selections: any) => void, fixtureId?: string) => {
  // Use the extracted hooks
  const {
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
    handleCaptainChange
  } = useTeamSelectionsState({ onTeamSelectionsChange, fixtureId });
  
  const {
    periods,
    addPeriod,
    editPeriod,
    deletePeriod,
    initializeDefaultPeriods
  } = usePeriodManagement();
  
  const { dragEnabled, toggleDragEnabled } = useDragAndDrop(true);
  
  // Initialize squad management hook with empty initial squad
  const [squadSelections, setSquadSelections] = useState<Record<string, string[]>>({});
  
  const handleSquadSelectionChange = useCallback((teamId: string, playerIds: string[]) => {
    setSquadSelections(prev => ({
      ...prev,
      [teamId]: playerIds
    }));
  }, []);

  const saveSelections = useCallback(async () => {
    try {
      if (!fixtureId) {
        toast.error("No fixture ID provided, cannot save selections");
        return false;
      }

      // Format data for saving
      const selectionsToSave = Object.entries(teamSelections).map(([teamId, selections]) => {
        const teamPeriods = periods[teamId] || [];
        
        // Format player selections
        const playerSelections = Object.entries(selections).map(([slotId, selection]) => ({
          player_id: selection.playerId,
          position: selection.position,
          is_substitute: selection.position.startsWith('sub-'),
          period_number: 0 // Default period (overall formation)
        }));
        
        // Add period-specific selections
        if (periodSelections[teamId]) {
          Object.entries(periodSelections[teamId]).forEach(([periodIdStr, periodSelection]) => {
            const periodId = parseInt(periodIdStr);
            const period = teamPeriods.find(p => p.id === periodId);
            
            if (period) {
              Object.values(periodSelection).forEach(selection => {
                playerSelections.push({
                  player_id: selection.playerId,
                  position: selection.position,
                  is_substitute: selection.position.startsWith('sub-'),
                  period_number: periodId,
                  duration: periodDurations[teamId]?.[periodId] || period.duration
                });
              });
            }
          });
        }
        
        return {
          team_id: teamId,
          fixture_id: fixtureId,
          formation_template: teamFormationTemplates[teamId] || 'All',
          performance_category: performanceCategories[teamId] || 'MESSI',
          captain_id: teamCaptains[teamId] || null,
          player_selections: playerSelections
        };
      });

      // Save to database
      const { error } = await supabase
        .from('team_selections')
        .upsert(selectionsToSave, { onConflict: 'team_id,fixture_id' });

      if (error) throw error;

      toast.success("Team selections saved successfully");
      return true;
    } catch (error) {
      console.error("Error saving team selections:", error);
      toast.error("Failed to save team selections");
      return false;
    }
  }, [teamSelections, periodSelections, periods, periodDurations, teamFormationTemplates, performanceCategories, teamCaptains, fixtureId]);

  return {
    teamSelections,
    selectedPlayers,
    performanceCategories,
    teamFormationTemplates,
    periodSelections,
    squadSelections,
    periods,
    periodDurations,
    teamCaptains,
    dragEnabled,
    isLoading,
    handleTeamSelectionChange,
    handlePeriodSelectionChange,
    handlePeriodDurationChange,
    handlePerformanceCategoryChange,
    handleTemplateChange,
    handleCaptainChange,
    handleSquadSelectionChange,
    toggleDragEnabled,
    saveSelections,
    addPeriod,
    editPeriod,
    deletePeriod,
    initializeDefaultPeriods
  };
};
