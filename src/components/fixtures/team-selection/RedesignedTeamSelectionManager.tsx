
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { NewTeamTabContent } from "./components/NewTeamTabContent";
import { TeamSelectionManagerProps } from "./types";
import { useTeamSelectionData } from "./hooks/useTeamSelectionData";
import { useTeamSelectionSave } from "./hooks/useTeamSelectionSave";

export const RedesignedTeamSelectionManager = ({ fixture, onSuccess }: TeamSelectionManagerProps) => {
  const [activeTab, setActiveTab] = useState("0");
  const [teams, setTeams] = useState<Record<string, { name: string; squadPlayers: string[] }>>({});
  const [teamCaptains, setTeamCaptains] = useState<Record<string, string>>({});
  const [selections, setSelections] = useState<Record<string, Record<string, Record<string, Record<string, { playerId: string; position: string; isSubstitution?: boolean }>>>>>({}); 
  const { toast } = useToast();

  // Use the existing data and save hooks
  const {
    availablePlayers,
    isLoading,
  } = useTeamSelectionData(fixture?.id);

  // Initialize the teams when the fixture changes
  useEffect(() => {
    if (fixture) {
      const numTeams = fixture.number_of_teams || 1;
      const newTeams: Record<string, { name: string; squadPlayers: string[] }> = {};
      
      for (let i = 0; i < numTeams; i++) {
        const teamId = String(i);
        newTeams[teamId] = {
          name: `Team ${i + 1}`,
          squadPlayers: []
        };
      }
      
      setTeams(newTeams);
    }
  }, [fixture]);

  // Convert the new structure to the format expected by useTeamSelectionSave
  const convertToSaveFormat = () => {
    // Create the converted data structure
    const allSelections = {};
    const periodsPerTeam = {};
    
    // Process each team
    Object.keys(selections).forEach(teamId => {
      if (!selections[teamId]) return;
      
      // Process each half
      Object.keys(selections[teamId]).forEach(halfId => {
        if (!selections[teamId][halfId]) return;
        
        // Process each period in the half
        Object.keys(selections[teamId][halfId]).forEach(periodId => {
          if (!selections[teamId][halfId][periodId]) return;
          
          // Create period ID for the save format
          const formattedPeriodId = `${halfId}-period-${periodId}`;
          
          // Initialize the period if it doesn't exist
          if (!allSelections[formattedPeriodId]) {
            allSelections[formattedPeriodId] = {};
          }
          
          // Initialize the team if it doesn't exist
          const adjustedTeamId = (parseInt(teamId) + 1).toString(); // Team IDs are 1-indexed in the save format
          if (!allSelections[formattedPeriodId][adjustedTeamId]) {
            allSelections[formattedPeriodId][adjustedTeamId] = {};
          }
          
          // Add selections for this team/period
          allSelections[formattedPeriodId][adjustedTeamId] = selections[teamId][halfId][periodId];
          
          // Add period to periodsPerTeam
          if (!periodsPerTeam[adjustedTeamId]) {
            periodsPerTeam[adjustedTeamId] = [];
          }
          
          // Add period with duration (assuming 20 minutes by default)
          const periodExists = periodsPerTeam[adjustedTeamId].some(p => p.id === formattedPeriodId);
          if (!periodExists) {
            periodsPerTeam[adjustedTeamId].push({
              id: formattedPeriodId,
              duration: 20 // Default duration
            });
          }
        });
      });
    });
    
    // Convert team captains (also 1-indexed in save format)
    const adjustedTeamCaptains = {};
    Object.keys(teamCaptains).forEach(teamId => {
      const adjustedTeamId = (parseInt(teamId) + 1).toString();
      adjustedTeamCaptains[adjustedTeamId] = teamCaptains[teamId];
    });
    
    return {
      allSelections,
      periodsPerTeam,
      teamCaptains: adjustedTeamCaptains
    };
  };

  // Handle squad selection
  const handleSquadSelection = (teamId: string, playerIds: string[]) => {
    setTeams(prev => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        squadPlayers: playerIds
      }
    }));
  };

  // Handle captain selection
  const handleCaptainChange = (teamId: string, playerId: string) => {
    setTeamCaptains(prev => ({
      ...prev,
      [teamId]: playerId
    }));
  };

  // Handle formation changes
  const handleFormationChange = (teamId: string, halfId: string, periodId: string, newSelections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>) => {
    setSelections(prev => {
      const updated = { ...prev };
      
      // Initialize the structures if they don't exist
      if (!updated[teamId]) updated[teamId] = {};
      if (!updated[teamId][halfId]) updated[teamId][halfId] = {};
      if (!updated[teamId][halfId][periodId]) updated[teamId][halfId][periodId] = {};
      
      // Update the selections
      updated[teamId][halfId][periodId] = newSelections;
      
      return updated;
    });
  };

  // Get which teams a player is in
  const getPlayerTeams = (playerId: string): string[] => {
    return Object.entries(teams)
      .filter(([_, team]) => team.squadPlayers.includes(playerId))
      .map(([teamId]) => teamId);
  };

  // Initialize save hook with our converted data
  const { isSaving, handleSave } = useTeamSelectionSave(
    fixture?.id,
    convertToSaveFormat().allSelections,
    convertToSaveFormat().periodsPerTeam,
    convertToSaveFormat().teamCaptains,
    onSuccess
  );

  // Save all selections
  const handleSaveSelections = async () => {
    try {
      await handleSave();
      toast({
        title: "Success",
        description: "Team selections saved successfully",
      });
    } catch (error) {
      console.error("Error saving team selections:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save team selections",
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <span className="ml-2">Loading team selection data...</span>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Team Selection - {fixture?.opponent}</h2>
        <Button 
          onClick={handleSaveSelections} 
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Selections'}
        </Button>
      </div>

      <Tabs defaultValue="0" onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4">
          {Object.keys(teams).map((teamId) => (
            <TabsTrigger key={teamId} value={teamId}>
              Team {parseInt(teamId) + 1}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {Object.entries(teams).map(([teamId, team]) => (
          <TabsContent key={teamId} value={teamId}>
            <NewTeamTabContent
              teamId={teamId}
              team={team}
              fixture={fixture}
              teamCaptains={teamCaptains}
              availablePlayers={availablePlayers}
              onCaptainChange={handleCaptainChange}
              onSquadSelection={handleSquadSelection}
              onFormationChange={handleFormationChange}
              getPlayerTeams={getPlayerTeams}
            />
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="flex justify-end mt-8">
        <Button 
          onClick={handleSaveSelections} 
          disabled={isSaving}
          size="lg"
        >
          {isSaving ? 'Saving...' : 'Save Team Selections'}
        </Button>
      </div>
    </div>
  );
};
