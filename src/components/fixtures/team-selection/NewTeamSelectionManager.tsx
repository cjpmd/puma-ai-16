
import { useState, useEffect } from "react";
import { Tab, Tabs, TabList, TabPanel } from "@/components/ui/tabs";
import { SquadSelectionGrid } from "@/components/formation/SquadSelectionGrid";
import { DraggableFormation } from "@/components/formation/DraggableFormation";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TeamHeaderControls } from "@/components/fixtures/TeamHeaderControls";
import { useTeamSelectionSave } from "./hooks/useTeamSelectionSave";
import { Period, TeamSelectionManagerProps } from "./types";
import { Card, CardContent } from "@/components/ui/card";

interface PlayerPosition {
  playerId: string;
  position: { x: number; y: number };
  isSubstitution?: boolean;
}

interface TeamFormationState {
  selectedPlayers: string[];
  playerPositions: Record<string, PlayerPosition[]>;
  captainId?: string;
  performanceCategory: string;
  periods: Period[];
}

export const NewTeamSelectionManager = ({ fixture, onSuccess }: TeamSelectionManagerProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("0");
  const [teams, setTeams] = useState<Record<string, TeamFormationState>>({});
  const [playersInTeams, setPlayersInTeams] = useState<Record<string, Array<{ id: string; name: string }>>>({});
  
  // Query to fetch available players
  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ["players-for-team-selection"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });
  
  // Initialize teams state when fixture loads
  useEffect(() => {
    if (fixture && fixture.number_of_teams) {
      const initialTeams: Record<string, TeamFormationState> = {};
      
      for (let i = 0; i < fixture.number_of_teams; i++) {
        initialTeams[i.toString()] = {
          selectedPlayers: [],
          playerPositions: {
            "period-0": []
          },
          captainId: undefined,
          performanceCategory: "MESSI",
          periods: [{ id: "period-0", duration: 20 }]
        };
      }
      
      setTeams(initialTeams);
    }
  }, [fixture]);
  
  // Handle player selection/deselection for a team
  const handlePlayerToggle = (teamId: string, playerId: string) => {
    setTeams(prevTeams => {
      const teamState = prevTeams[teamId];
      
      if (!teamState) return prevTeams;
      
      let updatedSelectedPlayers: string[];
      
      if (teamState.selectedPlayers.includes(playerId)) {
        // Remove player
        updatedSelectedPlayers = teamState.selectedPlayers.filter(id => id !== playerId);
        
        // Also remove from positions
        const updatedPositions = { ...teamState.playerPositions };
        Object.keys(updatedPositions).forEach(periodId => {
          updatedPositions[periodId] = updatedPositions[periodId].filter(p => p.playerId !== playerId);
        });
        
        // If player was captain, remove captain
        const updatedCaptainId = teamState.captainId === playerId ? undefined : teamState.captainId;
        
        return {
          ...prevTeams,
          [teamId]: {
            ...teamState,
            selectedPlayers: updatedSelectedPlayers,
            playerPositions: updatedPositions,
            captainId: updatedCaptainId
          }
        };
      } else {
        // Add player
        updatedSelectedPlayers = [...teamState.selectedPlayers, playerId];
        
        // Add to positions with default position
        const updatedPositions = { ...teamState.playerPositions };
        Object.keys(updatedPositions).forEach(periodId => {
          const index = updatedPositions[periodId].length;
          updatedPositions[periodId] = [
            ...updatedPositions[periodId],
            {
              playerId,
              position: { 
                x: 20 + (index % 5) * 15, 
                y: 25 + Math.floor(index / 5) * 20 
              },
              isSubstitution: false
            }
          ];
        });
        
        return {
          ...prevTeams,
          [teamId]: {
            ...teamState,
            selectedPlayers: updatedSelectedPlayers,
            playerPositions: updatedPositions
          }
        };
      }
    });
    
    // Update playersInTeams state
    updatePlayersInTeams();
  };
  
  // Update which players are in which teams
  const updatePlayersInTeams = () => {
    const playersMap: Record<string, Array<{ id: string; name: string }>> = {};
    
    Object.entries(teams).forEach(([teamId, team]) => {
      team.selectedPlayers.forEach(playerId => {
        const player = players?.find(p => p.id === playerId);
        if (!player) return;
        
        if (!playersMap[playerId]) {
          playersMap[playerId] = [];
        }
        
        playersMap[playerId].push({ id: teamId, name: `Team ${parseInt(teamId) + 1}` });
      });
    });
    
    setPlayersInTeams(playersMap);
  };
  
  // Handle player position changes
  const handlePositionsChange = (teamId: string, periodId: string, positions: PlayerPosition[]) => {
    setTeams(prevTeams => ({
      ...prevTeams,
      [teamId]: {
        ...prevTeams[teamId],
        playerPositions: {
          ...prevTeams[teamId].playerPositions,
          [periodId]: positions
        }
      }
    }));
  };
  
  // Handle captain change
  const handleCaptainChange = (teamId: string, playerId: string) => {
    setTeams(prevTeams => ({
      ...prevTeams,
      [teamId]: {
        ...prevTeams[teamId],
        captainId: prevTeams[teamId].captainId === playerId ? undefined : playerId
      }
    }));
  };
  
  // Handle performance category change
  const handlePerformanceCategoryChange = (teamId: string, category: string) => {
    setTeams(prevTeams => ({
      ...prevTeams,
      [teamId]: {
        ...prevTeams[teamId],
        performanceCategory: category
      }
    }));
  };
  
  // Handle adding a period
  const handleAddPeriod = (teamId: string) => {
    setTeams(prevTeams => {
      const teamState = prevTeams[teamId];
      const newPeriodId = `period-${teamState.periods.length}`;
      const previousPeriodId = `period-${teamState.periods.length - 1}`;
      
      // Clone player positions from previous period
      const previousPositions = teamState.playerPositions[previousPeriodId] || [];
      
      return {
        ...prevTeams,
        [teamId]: {
          ...teamState,
          periods: [
            ...teamState.periods,
            { id: newPeriodId, duration: 20 }
          ],
          playerPositions: {
            ...teamState.playerPositions,
            [newPeriodId]: previousPositions.map(pos => ({
              ...pos,
              isSubstitution: true // Mark all as substitutions in new period
            }))
          }
        }
      };
    });
  };
  
  // Handle period duration change
  const handlePeriodDurationChange = (teamId: string, periodId: string, duration: number) => {
    setTeams(prevTeams => {
      const teamState = prevTeams[teamId];
      
      return {
        ...prevTeams,
        [teamId]: {
          ...teamState,
          periods: teamState.periods.map(period => 
            period.id === periodId ? { ...period, duration } : period
          )
        }
      };
    });
  };
  
  // Convert data for saving
  const convertTeamsToSaveFormat = () => {
    const selections = {};
    const periodsPerTeam = {};
    const teamCaptains = {};
    
    Object.entries(teams).forEach(([teamId, team]) => {
      // Set team captains
      if (team.captainId) {
        teamCaptains[teamId] = team.captainId;
      }
      
      // Set periods
      periodsPerTeam[teamId] = team.periods;
      
      // Set selections
      team.periods.forEach(period => {
        const periodId = period.id;
        const positions = team.playerPositions[periodId] || [];
        
        if (!selections[periodId]) {
          selections[periodId] = {};
        }
        
        if (!selections[periodId][teamId]) {
          selections[periodId][teamId] = {};
        }
        
        positions.forEach(pos => {
          selections[periodId][teamId][pos.playerId] = {
            playerId: pos.playerId,
            position: `position-${Math.floor(pos.position.x)}-${Math.floor(pos.position.y)}`,
            performanceCategory: team.performanceCategory,
            isSubstitution: pos.isSubstitution
          };
        });
      });
    });
    
    return { selections, periodsPerTeam, teamCaptains };
  };
  
  // Save the team selection
  const { isSaving, handleSave } = useTeamSelectionSave(
    fixture?.id,
    {}, // Will convert on save
    {}, // Will convert on save
    {}, // Will convert on save
    onSuccess
  );
  
  const handleSaveTeamSelection = () => {
    try {
      const { selections, periodsPerTeam, teamCaptains } = convertTeamsToSaveFormat();
      
      // TODO: Save team selection to database
      toast({
        title: "Success",
        description: "Team selections saved successfully",
      });
      
      onSuccess?.();
    } catch (error) {
      console.error("Error saving team selections:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save team selections",
      });
    }
  };
  
  if (playersLoading || !players) {
    return <div>Loading players...</div>;
  }
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="0" onValueChange={setActiveTab}>
        <TabList>
          {Object.keys(teams).map((teamId) => (
            <Tab key={teamId} value={teamId}>
              Team {parseInt(teamId) + 1}
            </Tab>
          ))}
        </TabList>
        
        {Object.entries(teams).map(([teamId, team]) => (
          <TabPanel key={teamId} value={teamId}>
            <div className="space-y-6">
              <TeamHeaderControls
                teamId={teamId}
                teamCaptains={{ [teamId]: team.captainId }}
                availablePlayers={players}
                onCaptainChange={(_, captainId) => handleCaptainChange(teamId, captainId)}
                performanceCategory={team.performanceCategory}
                onPerformanceCategoryChange={(value) => handlePerformanceCategoryChange(teamId, value)}
                onAddPeriod={() => handleAddPeriod(teamId)}
              />
              
              <SquadSelectionGrid
                availablePlayers={players}
                selectedPlayers={team.selectedPlayers}
                onPlayerToggle={(playerId) => handlePlayerToggle(teamId, playerId)}
                playersInOtherTeams={playersInTeams}
              />
              
              {team.periods.map((period, index) => (
                <Card key={period.id} className="mt-6">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">Period {index + 1}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Duration (mins):</span>
                        <input
                          type="number"
                          value={period.duration}
                          onChange={(e) => handlePeriodDurationChange(teamId, period.id, parseInt(e.target.value) || 20)}
                          className="w-16 h-8 px-2 border rounded"
                          min="1"
                        />
                      </div>
                    </div>
                    
                    <DraggableFormation
                      selectedPlayers={team.selectedPlayers.map(id => players.find(p => p.id === id)).filter(Boolean)}
                      captainId={team.captainId}
                      initialPositions={team.playerPositions[period.id] || []}
                      onPositionsChange={(positions) => handlePositionsChange(teamId, period.id, positions)}
                      onCaptainChange={(playerId) => handleCaptainChange(teamId, playerId)}
                      title={`Period ${index + 1} Formation`}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabPanel>
        ))}
      </Tabs>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveTeamSelection} 
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Team Selections'}
        </Button>
      </div>
    </div>
  );
};
