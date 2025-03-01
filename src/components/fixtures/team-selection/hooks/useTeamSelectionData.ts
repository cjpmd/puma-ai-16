
import { useEffect } from "react";
import { usePlayers } from "./usePlayers";
import { useFixtureSelections } from "./useFixtureSelections";
import { usePeriods } from "./usePeriods";
import { useSelections } from "./useSelections";
import { usePerformanceCategories } from "./usePerformanceCategories";
import { useCaptains } from "./useCaptains";
import { useProcessSelections } from "./useProcessSelections";

export const useTeamSelectionData = (fixtureId: string | undefined) => {
  // Use the smaller hooks
  const { data: availablePlayers = [], isLoading: isLoadingPlayers } = usePlayers();
  const { data: existingSelections = [], isLoading: isLoadingSelections } = useFixtureSelections(fixtureId);
  
  const {
    periodsPerTeam,
    setPeriodsPerTeam,
    handleDeletePeriod: deletePeriod,
    handleAddPeriod: addPeriod,
    handleDurationChange,
    initializeTeamPeriods
  } = usePeriods();
  
  const {
    selections,
    setSelections,
    selectedPlayers,
    setSelectedPlayers,
    handleTeamSelectionChange,
    initializePeriodsSelections,
    cleanupPeriodSelections,
    updateSelectedPlayers
  } = useSelections();
  
  const {
    performanceCategories,
    setPerformanceCategories,
    initializePerformanceCategory,
    cleanupPerformanceCategory
  } = usePerformanceCategories();
  
  const {
    teamCaptains,
    setTeamCaptains,
    handleCaptainChange
  } = useCaptains();
  
  const { processExistingSelections } = useProcessSelections();

  // Function to get teams for a player
  const getPlayerTeams = (playerId: string) => {
    // This should be implemented based on your app's requirements
    // For now, returning an empty array
    return [];
  };

  // Enhanced delete period handler that coordinates all state updates
  const handleDeletePeriod = (teamId: string, periodId: string) => {
    const result = deletePeriod(teamId, periodId);
    cleanupPeriodSelections(teamId, periodId);
    cleanupPerformanceCategory(teamId, periodId);
    updateSelectedPlayers();
  };

  // Enhanced add period handler that coordinates all state updates
  const handleAddPeriod = (teamId: string) => {
    const { newPeriodId, lastPeriodId } = addPeriod(teamId);
    initializePeriodsSelections(newPeriodId, teamId, lastPeriodId, selections);
    initializePerformanceCategory(newPeriodId, teamId, lastPeriodId, performanceCategories);
  };

  // Handler for updating squad selection
  const handleSquadSelection = (teamId: string, playerIds: string[]) => {
    // This would need custom implementation based on your app's requirements
    console.log(`Squad selection for team ${teamId} updated:`, playerIds);
  };

  // Check if a position is a substitution
  const checkIsSubstitution = (teamId: string, periodIndex: number, position: string) => {
    // This would need custom implementation based on your app's requirements
    return false;
  };

  // Effect to process existing selections when they're fetched
  useEffect(() => {
    if (fixtureId && existingSelections.length > 0) {
      processExistingSelections(
        existingSelections,
        setPeriodsPerTeam,
        setSelections,
        setTeamCaptains,
        setPerformanceCategories,
        setSelectedPlayers
      );
    }
  }, [existingSelections, fixtureId]);

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
      initializeTeamPeriods,
      handleSquadSelection,
      checkIsSubstitution,
      getPlayerTeams
    }
  };
};
