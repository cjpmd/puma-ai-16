
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SquadSelectionGrid } from "@/components/formation/SquadSelectionGrid";
import { DraggableFormation } from "@/components/formation/DraggableFormation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeamHeaderControls } from "@/components/fixtures/TeamHeaderControls";
import { Fixture } from "@/types/fixture";
import { useTeamSelectionData } from "./hooks/useTeamSelectionData";
import { useTeamSelectionSave } from "./hooks/useTeamSelectionSave";
import { ArrowRight } from "lucide-react";
import { SubstitutesList } from "@/components/formation/SubstitutesList";
import { isPlayerSubstitution } from "@/components/formation/utils/playerUtils";
import { TeamSelectionManagerProps, TeamSelections, AllSelections, PeriodsPerTeam, TeamCaptains } from "./types";

export const NewTeamSelectionManager = ({ fixture, onSuccess }: TeamSelectionManagerProps) => {
  const [activeTab, setActiveTab] = useState("0");
  const [teams, setTeams] = useState<Record<string, { name: string; squadPlayers: string[] }>>({});
  const [periods, setPeriods] = useState<Record<string, { id: string; teamId: string; duration: number }[]>>({});
  const [teamSelections, setTeamSelections] = useState<Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>>({});
  const [teamCaptains, setTeamCaptains] = useState<Record<string, string>>({});
  const [performanceCategories, setPerformanceCategories] = useState<Record<string, string>>({});

  // Use the existing data and save hooks
  const {
    availablePlayers,
    selectedPlayers: existingSelectedPlayers,
    periodsPerTeam,
    selections: existingSelections,
    performanceCategories: existingPerformanceCategories,
    teamCaptains: existingTeamCaptains,
    isLoading,
    actions
  } = useTeamSelectionData(fixture?.id);

  // Initialize save hook
  const { isSaving, handleSave } = useTeamSelectionSave(
    fixture?.id,
    convertToAllSelections(),
    convertToPeriodsPerTeam(),
    convertToTeamCaptains(),
    onSuccess
  );

  // Function to convert our state format to the format expected by useTeamSelectionSave
  function convertToAllSelections(): AllSelections {
    const result: AllSelections = {};
    
    // Process each team and its periods
    Object.keys(periods).forEach(teamId => {
      periods[teamId].forEach(period => {
        const periodId = period.id;
        
        // Initialize period if it doesn't exist
        if (!result[periodId]) {
          result[periodId] = {};
        }
        
        // Initialize team if it doesn't exist
        if (!result[periodId][teamId]) {
          result[periodId][teamId] = {};
        }
        
        // Add selections for this team/period if they exist
        if (teamSelections[`${teamId}-${periodId}`]) {
          result[periodId][teamId] = {...teamSelections[`${teamId}-${periodId}`]};
          
          // Apply performance category to all selections
          const performanceCategory = performanceCategories[`${teamId}-${periodId}`] || 'MESSI';
          Object.keys(result[periodId][teamId]).forEach(slotId => {
            result[periodId][teamId][slotId].performanceCategory = performanceCategory;
          });
        }
      });
    });
    
    return result;
  }
  
  function convertToPeriodsPerTeam(): PeriodsPerTeam {
    const result: PeriodsPerTeam = {};
    
    Object.keys(periods).forEach(teamId => {
      result[teamId] = periods[teamId].map(period => ({
        id: period.id,
        duration: period.duration
      }));
    });
    
    return result;
  }
  
  function convertToTeamCaptains(): TeamCaptains {
    const result: TeamCaptains = {};
    
    Object.keys(teamCaptains).forEach(teamId => {
      result[teamId] = teamCaptains[teamId];
    });
    
    return result;
  }

  // Initialize teams data
  useEffect(() => {
    if (fixture) {
      const numTeams = fixture.number_of_teams || 1;
      const newTeams: Record<string, { name: string; squadPlayers: string[] }> = {};
      const newPeriods: Record<string, { id: string; teamId: string; duration: number }[]> = {};
      
      for (let i = 0; i < numTeams; i++) {
        const teamId = String(i);
        newTeams[teamId] = {
          name: `Team ${i + 1}`,
          squadPlayers: []
        };
        
        // Initialize with one period for each team
        newPeriods[teamId] = [
          { id: `period-1`, teamId, duration: 20 }
        ];
      }
      
      setTeams(newTeams);
      setPeriods(newPeriods);
    }
  }, [fixture]);

  // Load existing data when it's available
  useEffect(() => {
    if (!isLoading && fixture) {
      const newTeamSelections: Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>> = {};
      const newTeamCaptains: Record<string, string> = {};
      const newPerformanceCategories: Record<string, string> = {};
      const newPeriods: Record<string, { id: string; teamId: string; duration: number }[]> = {};
      const newTeams: Record<string, { name: string; squadPlayers: string[] }> = {};
      
      // Process existing periods and selections
      Object.keys(periodsPerTeam).forEach(teamId => {
        const teamPeriods = periodsPerTeam[teamId] || [];
        const teamNumber = parseInt(teamId);
        
        // Initialize team
        newTeams[String(teamNumber - 1)] = {
          name: `Team ${teamNumber}`,
          squadPlayers: [] // Will populate from selections
        };
        
        // Add periods
        newPeriods[String(teamNumber - 1)] = teamPeriods.map(period => ({
          id: period.id,
          teamId: String(teamNumber - 1),
          duration: period.duration
        }));
        
        // Add team captain
        if (existingTeamCaptains[teamId]) {
          newTeamCaptains[String(teamNumber - 1)] = existingTeamCaptains[teamId];
        }
        
        // Process selections for each period
        teamPeriods.forEach(period => {
          const periodId = period.id;
          
          // Get existing selections for this period and team
          if (existingSelections[periodId] && existingSelections[periodId][teamId]) {
            const selectionKey = `${String(teamNumber - 1)}-${periodId}`;
            newTeamSelections[selectionKey] = {...existingSelections[periodId][teamId]};
            
            // Add all players to squad
            Object.values(existingSelections[periodId][teamId]).forEach(selection => {
              if (selection.playerId && selection.playerId !== "unassigned") {
                if (!newTeams[String(teamNumber - 1)].squadPlayers.includes(selection.playerId)) {
                  newTeams[String(teamNumber - 1)].squadPlayers.push(selection.playerId);
                }
              }
            });
            
            // Get performance category
            const perfCatKey = `${periodId}-${teamId}`;
            if (existingPerformanceCategories[perfCatKey]) {
              newPerformanceCategories[`${String(teamNumber - 1)}-${periodId}`] = 
                existingPerformanceCategories[perfCatKey];
            }
          }
        });
      });
      
      // Only update state if we have data
      if (Object.keys(newPeriods).length > 0) {
        setPeriods(newPeriods);
        setTeamSelections(newTeamSelections);
        setTeamCaptains(newTeamCaptains);
        setPerformanceCategories(newPerformanceCategories);
        setTeams(newTeams);
      }
    }
  }, [isLoading, fixture, periodsPerTeam, existingSelections, existingTeamCaptains, existingPerformanceCategories]);

  // Handle squad selection changes
  const handleSquadSelection = (teamId: string, playerIds: string[]) => {
    setTeams(prevTeams => ({
      ...prevTeams,
      [teamId]: {
        ...prevTeams[teamId],
        squadPlayers: playerIds
      }
    }));
  };

  // Handle formation changes (dragging players)
  const handleFormationChange = (teamId: string, periodId: string, selections: Record<string, { playerId: string; position: string }>) => {
    const selectionKey = `${teamId}-${periodId}`;
    
    // Apply performance category to all selections
    const updatedSelections = {...selections};
    const performanceCategory = performanceCategories[selectionKey] || 'MESSI';
    
    Object.keys(updatedSelections).forEach(slotId => {
      updatedSelections[slotId].performanceCategory = performanceCategory;
    });
    
    setTeamSelections(prev => ({
      ...prev,
      [selectionKey]: updatedSelections
    }));
  };

  // Handle captain selection
  const handleCaptainChange = (teamId: string, playerId: string) => {
    setTeamCaptains(prev => ({
      ...prev,
      [teamId]: playerId
    }));
  };

  // Handle performance category changes
  const handlePerformanceCategoryChange = (teamId: string, periodId: string, category: string) => {
    const key = `${teamId}-${periodId}`;
    
    setPerformanceCategories(prev => ({
      ...prev,
      [key]: category
    }));
    
    // Also update all existing selections with the new performance category
    if (teamSelections[key]) {
      const updatedSelections = {...teamSelections[key]};
      
      Object.keys(updatedSelections).forEach(slotId => {
        updatedSelections[slotId] = {
          ...updatedSelections[slotId],
          performanceCategory: category
        };
      });
      
      setTeamSelections(prev => ({
        ...prev,
        [key]: updatedSelections
      }));
    }
  };

  // Handle period duration changes
  const handleDurationChange = (teamId: string, periodId: string, duration: number) => {
    setPeriods(prev => ({
      ...prev,
      [teamId]: prev[teamId].map(p => 
        p.id === periodId ? { ...p, duration } : p
      )
    }));
  };

  // Handle adding a new period
  const handleAddPeriod = (teamId: string) => {
    setPeriods(prev => {
      const teamPeriods = prev[teamId] || [];
      const lastPeriodNumber = teamPeriods.length > 0 
        ? parseInt(teamPeriods[teamPeriods.length - 1].id.replace('period-', ''))
        : 0;
      const newPeriodId = `period-${lastPeriodNumber + 1}`;
      
      // Get the last period's selections to duplicate
      let lastPeriodSelections = {};
      if (teamPeriods.length > 0) {
        const lastPeriodId = teamPeriods[teamPeriods.length - 1].id;
        const lastSelectionKey = `${teamId}-${lastPeriodId}`;
        
        if (teamSelections[lastSelectionKey]) {
          lastPeriodSelections = JSON.parse(JSON.stringify(teamSelections[lastSelectionKey]));
        }
      }
      
      // Add the new period's selections
      const newSelectionKey = `${teamId}-${newPeriodId}`;
      setTeamSelections(prevSelections => ({
        ...prevSelections,
        [newSelectionKey]: lastPeriodSelections
      }));
      
      // Copy performance category from last period
      if (teamPeriods.length > 0) {
        const lastPeriodId = teamPeriods[teamPeriods.length - 1].id;
        const lastCategoryKey = `${teamId}-${lastPeriodId}`;
        const category = performanceCategories[lastCategoryKey] || 'MESSI';
        
        setPerformanceCategories(prevCategories => ({
          ...prevCategories,
          [newSelectionKey]: category
        }));
      }
      
      return {
        ...prev,
        [teamId]: [
          ...teamPeriods,
          { id: newPeriodId, teamId, duration: 20 }
        ]
      };
    });
  };

  // Handle deleting a period
  const handleDeletePeriod = (teamId: string, periodId: string) => {
    // Remove the period
    setPeriods(prev => ({
      ...prev,
      [teamId]: prev[teamId].filter(p => p.id !== periodId)
    }));
    
    // Remove selections for this period
    const selectionKey = `${teamId}-${periodId}`;
    setTeamSelections(prev => {
      const newSelections = {...prev};
      delete newSelections[selectionKey];
      return newSelections;
    });
    
    // Remove performance category
    setPerformanceCategories(prev => {
      const newCategories = {...prev};
      delete newCategories[selectionKey];
      return newCategories;
    });
  };

  // Save all selections
  const handleSaveSelections = async () => {
    // Convert our state to the format expected by useTeamSelectionSave
    const allSelections = convertToAllSelections();
    const periodsPerTeamData = convertToPeriodsPerTeam();
    const teamCaptainsData = convertToTeamCaptains();
    
    console.log("Saving team selections with:", {
      allSelections,
      periodsPerTeamData,
      teamCaptainsData
    });
    
    // Use the existing save mechanism
    await handleSave();
  };

  // Check if a player is a substitution compared to previous period
  const checkIsSubstitution = (teamId: string, periodIndex: number, position: string): boolean => {
    if (periodIndex <= 0) return false;
    
    const teamPeriods = periods[teamId] || [];
    if (teamPeriods.length <= 1) return false;
    
    const currentPeriodId = teamPeriods[periodIndex].id;
    const previousPeriodId = teamPeriods[periodIndex - 1].id;
    
    const currentSelections = teamSelections[`${teamId}-${currentPeriodId}`];
    const previousSelections = teamSelections[`${teamId}-${previousPeriodId}`];
    
    return isPlayerSubstitution(currentSelections, previousSelections, position);
  };

  // Get selected players across all teams
  const getSelectedPlayers = (): Set<string> => {
    const selected = new Set<string>();
    
    Object.values(teams).forEach(team => {
      team.squadPlayers.forEach(playerId => {
        if (playerId && playerId !== "unassigned") {
          selected.add(playerId);
        }
      });
    });
    
    return selected;
  };

  // Which teams a player is selected for
  const getPlayerTeams = (playerId: string): string[] => {
    return Object.entries(teams)
      .filter(([_, team]) => team.squadPlayers.includes(playerId))
      .map(([teamId]) => teamId);
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
            <div className="space-y-6">
              <TeamHeaderControls
                teamId={teamId}
                teamName={team.name}
                captain={teamCaptains[teamId] || ""}
                onCaptainChange={(playerId) => handleCaptainChange(teamId, playerId)}
                availablePlayers={availablePlayers}
                selectedPlayers={team.squadPlayers}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Squad Selection</CardTitle>
                </CardHeader>
                <CardContent>
                  <SquadSelectionGrid
                    availablePlayers={availablePlayers}
                    selectedPlayers={team.squadPlayers}
                    onSelectionChange={(playerIds) => handleSquadSelection(teamId, playerIds)}
                    getPlayerTeams={getPlayerTeams}
                  />
                </CardContent>
              </Card>
              
              {(periods[teamId] || []).map((period, index) => (
                <Card key={period.id} className="relative">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Period {index + 1}</CardTitle>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Label>Performance Category:</Label>
                        <select
                          value={performanceCategories[`${teamId}-${period.id}`] || 'MESSI'}
                          onChange={(e) => handlePerformanceCategoryChange(teamId, period.id, e.target.value)}
                          className="border rounded px-2 py-1"
                        >
                          <option value="MESSI">Messi</option>
                          <option value="RONALDO">Ronaldo</option>
                          <option value="JAGS">Jags</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label>Duration (mins):</Label>
                        <Input
                          type="number"
                          value={period.duration}
                          onChange={(e) => handleDurationChange(teamId, period.id, parseInt(e.target.value))}
                          className="w-20"
                        />
                      </div>
                      {index > 0 && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeletePeriod(teamId, period.id)}
                        >
                          Remove Period
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <DraggableFormation
                      format={fixture?.format as "7-a-side" || "7-a-side"}
                      availablePlayers={availablePlayers.filter(p => 
                        team.squadPlayers.includes(p.id)
                      )}
                      initialSelections={teamSelections[`${teamId}-${period.id}`] || {}}
                      onSelectionChange={(selections) => handleFormationChange(teamId, period.id, selections)}
                      renderSubstitutionIndicator={(position) => 
                        checkIsSubstitution(teamId, index, position) && (
                          <span className="absolute -top-4 -right-3 text-amber-500">
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        )
                      }
                    />
                    
                    <SubstitutesList
                      maxSubstitutes={5}
                      selections={teamSelections[`${teamId}-${period.id}`] || {}}
                      availablePlayers={availablePlayers.filter(p => 
                        team.squadPlayers.includes(p.id)
                      )}
                      onSelectionChange={(slotId, playerId, position) => {
                        // Update the selection for this substitute
                        const selectionKey = `${teamId}-${period.id}`;
                        const currentSelections = teamSelections[selectionKey] || {};
                        
                        setTeamSelections(prev => ({
                          ...prev,
                          [selectionKey]: {
                            ...currentSelections,
                            [slotId]: {
                              playerId,
                              position,
                              performanceCategory: performanceCategories[selectionKey] || 'MESSI'
                            }
                          }
                        }));
                      }}
                      selectedPlayers={new Set(
                        Object.values(teamSelections[`${teamId}-${period.id}`] || {})
                          .map(s => s.playerId)
                          .filter(id => id !== 'unassigned')
                      )}
                    />
                  </CardContent>
                </Card>
              ))}
              
              <div className="flex justify-center">
                <Button onClick={() => handleAddPeriod(teamId)}>
                  Add Period
                </Button>
              </div>
            </div>
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
