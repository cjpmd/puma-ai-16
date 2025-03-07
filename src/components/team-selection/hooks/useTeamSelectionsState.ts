
import { useState, useCallback } from "react";
import { PerformanceCategory } from "@/types/player";

interface UseTeamSelectionsStateProps {
  onTeamSelectionsChange?: (selections: Record<string, Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>>) => void;
}

export const useTeamSelectionsState = ({ onTeamSelectionsChange }: UseTeamSelectionsStateProps = {}) => {
  const [teamSelections, setTeamSelections] = useState<Record<string, Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>>>({});
  const [periodSelections, setPeriodSelections] = useState<Record<string, Record<number, Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>>>>({});
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [performanceCategories, setPerformanceCategories] = useState<Record<string, PerformanceCategory>>({});
  const [teamFormationTemplates, setTeamFormationTemplates] = useState<Record<string, string>>({});
  const [periodDurations, setPeriodDurations] = useState<Record<string, Record<number, number>>>({});

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

  return {
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
    setTeamSelections,
    setPeriodSelections,
    setSelectedPlayers,
    setPerformanceCategories,
    setTeamFormationTemplates,
    setPeriodDurations
  };
};
