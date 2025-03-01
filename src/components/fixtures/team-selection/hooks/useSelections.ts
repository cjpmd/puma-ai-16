
import { useState } from "react";
import { AllSelections, TeamSelections } from "../types";
import { extractSelectedPlayers } from "../utils/selectionUtils";

export const useSelections = () => {
  const [selections, setSelections] = useState<AllSelections>({});
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());

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

  // Initialize selections for a new period
  const initializePeriodsSelections = (
    newPeriodId: string, 
    teamId: string, 
    lastPeriodId: string | null,
    existingSelections: AllSelections
  ) => {
    // Get the last period's selections to duplicate
    let lastPeriodSelections = {};
    if (lastPeriodId && existingSelections[lastPeriodId] && existingSelections[lastPeriodId][teamId]) {
      // Deep clone to avoid reference issues
      lastPeriodSelections = JSON.parse(JSON.stringify(existingSelections[lastPeriodId][teamId]));
      console.log(`Duplicating selections from ${lastPeriodId} to ${newPeriodId}:`, lastPeriodSelections);
    }
    
    // Add new period selections
    setSelections(prev => {
      const newSelections = { ...prev };
      if (!newSelections[newPeriodId]) {
        newSelections[newPeriodId] = {};
      }
      newSelections[newPeriodId][teamId] = lastPeriodSelections;
      return newSelections;
    });

    return lastPeriodSelections;
  };

  // Clean up selection for deleted period
  const cleanupPeriodSelections = (teamId: string, periodId: string) => {
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
  };

  // Update selected players
  const updateSelectedPlayers = () => {
    const newSelectedPlayers = extractSelectedPlayers(selections);
    setSelectedPlayers(newSelectedPlayers);
  };

  return {
    selections,
    setSelections,
    selectedPlayers,
    setSelectedPlayers,
    handleTeamSelectionChange,
    initializePeriodsSelections,
    cleanupPeriodSelections,
    updateSelectedPlayers
  };
};
