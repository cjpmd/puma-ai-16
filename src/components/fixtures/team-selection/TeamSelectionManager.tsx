
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TeamSelectionManagerProps } from "./types";
import { useTeamSelectionData } from "./hooks/useTeamSelectionData";
import { useTeamSelectionSave } from "./hooks/useTeamSelectionSave";
import { TeamPeriodsList } from "./components/TeamPeriodsList";

export const TeamSelectionManager = ({ fixture, onSuccess }: TeamSelectionManagerProps) => {
  const [activeTeam, setActiveTeam] = useState<string>("1");
  
  // Use the custom hooks for data management and saving
  const {
    availablePlayers,
    selectedPlayers,
    periodsPerTeam,
    selections,
    performanceCategories,
    teamCaptains,
    isLoading,
    actions
  } = useTeamSelectionData(fixture?.id);

  // Initialize hook for saving team selections
  const { 
    isSaving, 
    handleSave 
  } = useTeamSelectionSave(
    fixture?.id,
    selections,
    periodsPerTeam,
    teamCaptains,
    onSuccess
  );

  // Initialize data when fixture changes
  useEffect(() => {
    if (fixture) {
      actions.initializeTeamPeriods(fixture);
    }
  }, [fixture]);

  // Handle performance category changes
  const handlePerformanceCategoryChange = (key: string, value: string) => {
    if (key === "batch") {
      // This is a special case for batch updates from the header controls
      // The actual implementation is in the TeamPeriodsList component
    } else {
      // Single category update
      actions.setPerformanceCategories(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <span className="ml-2">Loading team selection data...</span>
    </div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Team Selection - {fixture?.opponent}</h2>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Selections'}
        </Button>
      </div>

      {fixture && (
        <TeamPeriodsList
          fixture={fixture}
          activeTeam={activeTeam}
          setActiveTeam={setActiveTeam}
          periodsPerTeam={periodsPerTeam}
          selections={selections}
          performanceCategories={performanceCategories}
          teamCaptains={teamCaptains}
          selectedPlayers={selectedPlayers}
          availablePlayers={availablePlayers}
          onCaptainChange={actions.handleCaptainChange}
          onAddPeriod={actions.handleAddPeriod}
          onDeletePeriod={actions.handleDeletePeriod}
          onTeamSelectionChange={actions.handleTeamSelectionChange}
          onDurationChange={actions.handleDurationChange}
          onPerformanceCategoryChange={handlePerformanceCategoryChange}
        />
      )}
    </div>
  );
};
