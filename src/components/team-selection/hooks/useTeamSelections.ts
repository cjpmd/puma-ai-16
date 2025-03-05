import { useState, useCallback } from "react";
import { PerformanceCategory } from "@/types/player";
import { toast } from "sonner";

export type PeriodData = {
  id: number;
  name: string;
  duration: number;
  selections: Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>;
};

export const useTeamSelections = (onTeamSelectionsChange?: (selections: any) => void) => {
  const [teamSelections, setTeamSelections] = useState<Record<string, Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>>>({});
  
  const [periodSelections, setPeriodSelections] = useState<Record<string, Record<number, Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>>>>({});
  
  const [periods, setPeriods] = useState<Record<string, PeriodData[]>>({});
  
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [performanceCategories, setPerformanceCategories] = useState<Record<string, PerformanceCategory>>({});
  const [teamFormationTemplates, setTeamFormationTemplates] = useState<Record<string, string>>({});
  const [squadSelections, setSquadSelections] = useState<Record<string, string[]>>({});
  const [dragEnabled, setDragEnabled] = useState<boolean>(true); // Default to true
  const [periodDurations, setPeriodDurations] = useState<Record<string, Record<number, number>>>({});

  const handleTeamSelectionChange = useCallback((teamId: string, selections: Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>) => {
    setTeamSelections(prev => ({
      ...prev,
      [teamId]: selections
    }));

    const currentSelectedPlayers = new Set(selectedPlayers);
    Object.values(selections).forEach(selection => {
      if (selection.playerId && selection.playerId !== "unassigned") {
        currentSelectedPlayers.add(selection.playerId);
      }
    });
    setSelectedPlayers(currentSelectedPlayers);

    if (onTeamSelectionsChange) {
      onTeamSelectionsChange({
        ...teamSelections,
        [teamId]: selections
      });
    }
  }, [teamSelections, selectedPlayers, onTeamSelectionsChange]);

  const handlePeriodSelectionChange = useCallback((teamId: string, periodId: number, selections: Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>) => {
    setPeriodSelections(prev => ({
      ...prev,
      [teamId]: {
        ...(prev[teamId] || {}),
        [periodId]: selections
      }
    }));
  }, []);

  const addPeriod = useCallback((teamId: string, halfNumber: number, periodName: string, duration: number) => {
    setPeriods(prev => {
      const teamPeriods = prev[teamId] || [];
      
      const baseId = halfNumber * 100;
      const existingIds = teamPeriods.filter(p => Math.floor(p.id / 100) === halfNumber).map(p => p.id);
      const nextId = existingIds.length > 0 
        ? Math.max(...existingIds) + 1 
        : baseId;
      
      const newPeriod: PeriodData = {
        id: nextId,
        name: periodName,
        duration,
        selections: {}
      };
      
      return {
        ...prev,
        [teamId]: [...teamPeriods, newPeriod].sort((a, b) => a.id - b.id)
      };
    });
  }, []);

  const editPeriod = useCallback((teamId: string, periodId: number, updates: Partial<PeriodData>) => {
    setPeriods(prev => {
      const teamPeriods = prev[teamId] || [];
      return {
        ...prev,
        [teamId]: teamPeriods.map(period => 
          period.id === periodId 
            ? { ...period, ...updates } 
            : period
        )
      };
    });
  }, []);

  const deletePeriod = useCallback((teamId: string, periodId: number) => {
    setPeriods(prev => {
      const teamPeriods = prev[teamId] || [];
      return {
        ...prev,
        [teamId]: teamPeriods.filter(period => period.id !== periodId)
      };
    });
    
    setPeriodSelections(prev => {
      const teamPeriodSelections = { ...(prev[teamId] || {}) };
      delete teamPeriodSelections[periodId];
      return {
        ...prev,
        [teamId]: teamPeriodSelections
      };
    });
  }, []);

  const initializeDefaultPeriods = useCallback((teamId: string) => {
    setPeriods(prev => {
      if (prev[teamId] && prev[teamId].length > 0) {
        return prev;
      }
      
      return {
        ...prev,
        [teamId]: [
          { id: 100, name: "First Half", duration: 45, selections: {} },
          { id: 200, name: "Second Half", duration: 45, selections: {} }
        ]
      };
    });
  }, []);

  const handlePeriodDurationChange = useCallback((teamId: string, periodId: number, duration: number) => {
    setPeriods(prev => {
      const teamPeriods = prev[teamId] || [];
      return {
        ...prev,
        [teamId]: teamPeriods.map(period => 
          period.id === periodId
            ? { ...period, duration }
            : period
        )
      };
    });
    
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

  const handleSquadSelectionChange = useCallback((teamId: string, playerIds: string[]) => {
    setSquadSelections(prev => ({
      ...prev,
      [teamId]: playerIds
    }));
  }, []);

  const toggleDragEnabled = useCallback((enabled: boolean) => {
    console.log(`Toggling drag and drop: ${enabled}`);
    setDragEnabled(enabled);
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
