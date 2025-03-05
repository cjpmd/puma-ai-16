
import { useState, useCallback } from "react";
import { PerformanceCategory } from "@/types/player";
import { toast } from "sonner";

export const useTeamSelections = (onTeamSelectionsChange?: (selections: any) => void) => {
  const [teamSelections, setTeamSelections] = useState<Record<string, Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>>>({});
  const [periodSelections, setPeriodSelections] = useState<Record<string, Record<number, Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>>>>({});
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [performanceCategories, setPerformanceCategories] = useState<Record<string, PerformanceCategory>>({});
  const [teamFormationTemplates, setTeamFormationTemplates] = useState<Record<string, string>>({});
  const [squadSelections, setSquadSelections] = useState<Record<string, string[]>>({});
  const [dragEnabled, setDragEnabled] = useState<boolean>(true); // Default to true
  const [periodDurations, setPeriodDurations] = useState<Record<string, Record<number, number>>>({});

  // Handler for team selection changes
  const handleTeamSelectionChange = useCallback((teamId: string, selections: Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>) => {
    setTeamSelections(prev => ({
      ...prev,
      [teamId]: selections
    }));

    // Update selectedPlayers set
    const currentSelectedPlayers = new Set(selectedPlayers);
    Object.values(selections).forEach(selection => {
      if (selection.playerId && selection.playerId !== "unassigned") {
        currentSelectedPlayers.add(selection.playerId);
      }
    });
    setSelectedPlayers(currentSelectedPlayers);

    // Notify parent component if callback is provided
    if (onTeamSelectionsChange) {
      onTeamSelectionsChange({
        ...teamSelections,
        [teamId]: selections
      });
    }
  }, [teamSelections, selectedPlayers, onTeamSelectionsChange]);

  // Handler for period-specific team selection changes
  const handlePeriodSelectionChange = useCallback((teamId: string, periodNumber: number, selections: Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>) => {
    setPeriodSelections(prev => ({
      ...prev,
      [teamId]: {
        ...(prev[teamId] || {}),
        [periodNumber]: selections
      }
    }));
  }, []);

  // Handler for period durations
  const handlePeriodDurationChange = useCallback((teamId: string, periodNumber: number, duration: number) => {
    setPeriodDurations(prev => ({
      ...prev,
      [teamId]: {
        ...(prev[teamId] || {}),
        [periodNumber]: duration
      }
    }));
  }, []);

  // Handler for performance category changes
  const handlePerformanceCategoryChange = useCallback((teamId: string, category: PerformanceCategory) => {
    setPerformanceCategories(prev => ({
      ...prev,
      [teamId]: category
    }));
  }, []);

  // Handler for formation template changes
  const handleTemplateChange = useCallback((teamId: string, template: string) => {
    setTeamFormationTemplates(prev => ({
      ...prev,
      [teamId]: template
    }));
  }, []);

  // Handler for squad selection changes
  const handleSquadSelectionChange = useCallback((teamId: string, playerIds: string[]) => {
    setSquadSelections(prev => ({
      ...prev,
      [teamId]: playerIds
    }));
  }, []);

  // Toggle drag and drop feature
  const toggleDragEnabled = useCallback((enabled: boolean) => {
    console.log(`Toggling drag and drop: ${enabled}`);
    setDragEnabled(enabled);
  }, []);

  // Save selections
  const saveSelections = useCallback(async () => {
    try {
      // Here you would typically make an API call to save the selections
      // For now, we'll just simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success("Team selections saved successfully");

      return true;
    } catch (error) {
      console.error("Error saving team selections:", error);
      toast.error("Failed to save team selections");
      return false;
    }
  }, [teamSelections, periodSelections]);

  return {
    teamSelections,
    selectedPlayers,
    performanceCategories,
    teamFormationTemplates,
    periodSelections,
    squadSelections,
    periodDurations,
    dragEnabled,
    handleTeamSelectionChange,
    handlePeriodSelectionChange,
    handlePeriodDurationChange,
    handlePerformanceCategoryChange,
    handleTemplateChange,
    handleSquadSelectionChange,
    toggleDragEnabled,
    saveSelections
  };
};
