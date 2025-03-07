
import { useCallback, useState } from "react";
import { PerformanceCategory } from "@/types/player";
import { toast } from "sonner";
import { useTeamSelectionsState } from "./useTeamSelectionsState";
import { usePeriodManagement } from "./usePeriodManagement";
import { useDragAndDrop } from "./useDragAndDrop";
import { useSquadManagement } from "./useSquadManagement";

export type PeriodData = {
  id: number;
  name: string;
  duration: number;
  selections: Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>;
};

export const useTeamSelections = (onTeamSelectionsChange?: (selections: any) => void) => {
  // Use the extracted hooks
  const {
    teamSelections,
    periodSelections,
    selectedPlayers,
    performanceCategories,
    teamFormationTemplates,
    periodDurations,
    handleTeamSelectionChange,
    handlePeriodSelectionChange,
    handlePeriodDurationChange,
    handlePerformanceCategoryChange,
    handleTemplateChange,
  } = useTeamSelectionsState({ onTeamSelectionsChange });
  
  const {
    periods,
    addPeriod,
    editPeriod,
    deletePeriod,
    initializeDefaultPeriods
  } = usePeriodManagement();
  
  const { dragEnabled, toggleDragEnabled } = useDragAndDrop(true);
  
  // Initialize squad management hook with empty initial squad
  // In a real implementation, you would pass the actual squad players
  const [squadSelections, setSquadSelections] = useState<Record<string, string[]>>({});
  
  const handleSquadSelectionChange = useCallback((teamId: string, playerIds: string[]) => {
    setSquadSelections(prev => ({
      ...prev,
      [teamId]: playerIds
    }));
  }, []);

  const saveSelections = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success("Team selections saved successfully");

      return true;
    } catch (error) {
      console.error("Error saving team selections:", error);
      toast.error("Failed to save team selections");
      return false;
    }
  }, [teamSelections, periodSelections, periods]);

  return {
    teamSelections,
    selectedPlayers,
    performanceCategories,
    teamFormationTemplates,
    periodSelections,
    squadSelections,
    periods,
    periodDurations,
    dragEnabled,
    handleTeamSelectionChange,
    handlePeriodSelectionChange,
    handlePeriodDurationChange,
    handlePerformanceCategoryChange,
    handleTemplateChange,
    handleSquadSelectionChange,
    toggleDragEnabled,
    saveSelections,
    addPeriod,
    editPeriod,
    deletePeriod,
    initializeDefaultPeriods
  };
};
