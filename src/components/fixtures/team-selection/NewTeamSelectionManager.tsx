
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Fixture } from "@/types/fixture";
import { PerformanceCategory } from "@/types/player";
import { FormationFormat } from "@/components/formation/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormationSelector } from "@/components/FormationSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TeamSelections, 
  TeamSelection, 
  AllSelections, 
  Period, 
  PeriodsPerTeam, 
  TeamCaptains, 
  PerformanceCategories, 
  TeamFormData 
} from "./types";

interface NewTeamSelectionManagerProps {
  fixture?: Fixture;
  onSuccess?: () => void;
}

export const NewTeamSelectionManager: React.FC<NewTeamSelectionManagerProps> = ({ 
  fixture, 
  onSuccess 
}) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTeamTab, setActiveTeamTab] = useState("team-1");
  const [activePeriodTab, setActivePeriodTab] = useState("all-periods");
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  
  // State for all selections, organized by team and period
  const [allSelections, setAllSelections] = useState<AllSelections>({});
  
  // State for performance categories
  const [performanceCategories, setPerformanceCategories] = useState<PerformanceCategories>({});
  
  // State for team captains
  const [teamCaptains, setTeamCaptains] = useState<TeamCaptains>({});

  // State for periods and durations
  const [periodsPerTeam, setPeriodsPerTeam] = useState<PeriodsPerTeam>({});
  
  // State for formation templates
  const [teamFormationTemplates, setTeamFormationTemplates] = useState<Record<string, string>>({});
  
  // Get format from fixture, default to 7-a-side
  const format = (fixture?.format || "7-a-side") as FormationFormat;
  
  // Determine how many teams this fixture has
  const numberOfTeams = fixture?.number_of_teams || 1;

  // Initialize periods when the component mounts
  useEffect(() => {
    const initialPeriodsPerTeam: PeriodsPerTeam = {};
    const initialPerformanceCategories: PerformanceCategories = {};
    
    // For each team, set up default periods and performance category
    for (let i = 1; i <= numberOfTeams; i++) {
      const teamId = `team-${i}`;
      initialPeriodsPerTeam[teamId] = [
        { id: "period-1", duration: 45 },
        { id: "period-2", duration: 45 }
      ];
      initialPerformanceCategories[teamId] = "MESSI" as PerformanceCategory;
    }
    
    setPeriodsPerTeam(initialPeriodsPerTeam);
    setPerformanceCategories(initialPerformanceCategories);
  }, [numberOfTeams]);

  // Get players with attendance status
  const { data: players, isLoading, error } = useQuery({
    queryKey: ["players-with-attendance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleTeamPerformanceCategoryChange = (teamId: string, category: PerformanceCategory) => {
    setPerformanceCategories(prev => ({
      ...prev,
      [teamId]: category
    }));

    // Update performance category for all selections in this team
    setAllSelections(prev => {
      const teamSelections = prev[teamId] || {};
      const updatedTeamSelections: Record<string, TeamSelections> = {};
      
      Object.entries(teamSelections).forEach(([periodKey, periodSelections]) => {
        const updatedPeriodSelections: TeamSelections = {};
        
        Object.entries(periodSelections).forEach(([positionKey, selection]) => {
          updatedPeriodSelections[positionKey] = {
            ...selection,
            performanceCategory: category
          };
        });
        
        updatedTeamSelections[periodKey] = updatedPeriodSelections;
      });
      
      return {
        ...prev,
        [teamId]: updatedTeamSelections
      };
    });
  };

  const handleTeamSelectionChange = (teamId: string, periodKey: string, selections: TeamSelections) => {
    console.log(`Team ${teamId}, Period ${periodKey} selections changed:`, selections);
    
    // Update selected players
    const newSelectedPlayers = new Set<string>(selectedPlayers);
    
    // First remove any players that were previously selected in this team/period
    const prevSelections = allSelections[teamId]?.[periodKey] || {};
    Object.values(prevSelections).forEach(selection => {
      if (selection.playerId && selection.playerId !== "unassigned") {
        // Check if this player is used elsewhere before removing
        let playerUsedElsewhere = false;
        
        Object.entries(allSelections).forEach(([currentTeamId, teamSelections]) => {
          Object.entries(teamSelections).forEach(([currentPeriodKey, periodSelections]) => {
            // Skip the current team/period we're updating
            if (currentTeamId === teamId && currentPeriodKey === periodKey) return;
            
            // Check if player is used in other positions
            Object.values(periodSelections).forEach(otherSelection => {
              if (otherSelection.playerId === selection.playerId) {
                playerUsedElsewhere = true;
              }
            });
          });
        });
        
        if (!playerUsedElsewhere) {
          newSelectedPlayers.delete(selection.playerId);
        }
      }
    });
    
    // Then add the new selections
    Object.values(selections).forEach(selection => {
      if (selection.playerId && selection.playerId !== "unassigned") {
        newSelectedPlayers.add(selection.playerId);
      }
    });
    
    setSelectedPlayers(newSelectedPlayers);
    
    // Update all selections with the new values
    setAllSelections(prev => ({
      ...prev,
      [teamId]: {
        ...(prev[teamId] || {}),
        [periodKey]: selections
      }
    }));
  };

  const handleTeamCaptainChange = (teamId: string, captainId: string) => {
    setTeamCaptains(prev => ({
      ...prev,
      [teamId]: captainId
    }));
  };

  const handlePeriodChange = (teamId: string, periodId: string, duration: number) => {
    setPeriodsPerTeam(prev => {
      const teamPeriods = [...(prev[teamId] || [])];
      const periodIndex = teamPeriods.findIndex(p => p.id === periodId);
      
      if (periodIndex >= 0) {
        teamPeriods[periodIndex] = { ...teamPeriods[periodIndex], duration };
      }
      
      return {
        ...prev,
        [teamId]: teamPeriods
      };
    });
  };

  const handleAddPeriod = (teamId: string) => {
    setPeriodsPerTeam(prev => {
      const teamPeriods = [...(prev[teamId] || [])];
      const newPeriodNumber = teamPeriods.length + 1;
      teamPeriods.push({ id: `period-${newPeriodNumber}`, duration: 45 });
      
      return {
        ...prev,
        [teamId]: teamPeriods
      };
    });
  };

  const handleRemovePeriod = (teamId: string, periodId: string) => {
    setPeriodsPerTeam(prev => {
      const teamPeriods = [...(prev[teamId] || [])];
      const updatedPeriods = teamPeriods.filter(p => p.id !== periodId);
      
      return {
        ...prev,
        [teamId]: updatedPeriods
      };
    });
    
    // Also remove selections for this period
    setAllSelections(prev => {
      const teamSelections = { ...(prev[teamId] || {}) };
      delete teamSelections[periodId];
      
      return {
        ...prev,
        [teamId]: teamSelections
      };
    });
  };

  const handleTemplateChange = (teamId: string, template: string) => {
    setTeamFormationTemplates(prev => ({
      ...prev,
      [teamId]: template
    }));
  };

  const prepareSelectionsForSaving = (): TeamFormData[] => {
    const formData: TeamFormData[] = [];
    
    // Process each team's selections
    Object.entries(allSelections).forEach(([teamId, teamSelections]) => {
      const playerSelectionsMap = new Map<string, { 
        player_id: string;
        position: string;
        is_substitute: boolean;
        period_number: number;
      }[]>();
      
      // Process each period's selections
      Object.entries(teamSelections).forEach(([periodKey, periodSelections]) => {
        // Extract period number from period key (e.g., "period-1" -> 1)
        const periodNumber = parseInt(periodKey.split('-')[1]);
        
        // Process each position in this period
        Object.values(periodSelections).forEach(selection => {
          const playerId = selection.playerId;
          if (playerId && playerId !== "unassigned") {
            // Get or initialize array for this player
            const playerSelections = playerSelectionsMap.get(playerId) || [];
            
            // Add this selection
            playerSelections.push({
              player_id: playerId,
              position: selection.position,
              is_substitute: selection.position.startsWith('sub-'),
              period_number: periodNumber
            });
            
            // Update map
            playerSelectionsMap.set(playerId, playerSelections);
          }
        });
      });
      
      // Convert map to array
      const playerSelections = Array.from(playerSelectionsMap.values()).flat();
      
      // Create form data for this team
      formData.push({
        team_id: teamId,
        fixture_id: fixture?.id || '',
        performance_category: performanceCategories[teamId],
        player_selections: playerSelections,
        captain_id: teamCaptains[teamId]
      });
    });
    
    return formData;
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Prepare selections for saving
      const formData = prepareSelectionsForSaving();
      console.log("Saving team selections:", formData);
      
      // Example API call - replace with your actual implementation
      // const { error } = await supabase.from('fixture_team_selections').upsert(formData);
      // if (error) throw error;
      
      // For now, just simulate a successful API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Team selections saved successfully",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving team selections:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save team selections",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading players...</div>;
  }

  if (error) {
    return <div>Error loading players: {error instanceof Error ? error.message : 'Unknown error'}</div>;
  }

  if (!fixture) {
    return <div>No fixture information provided</div>;
  }

  // Generate team tabs based on number of teams
  const teamTabs = Array.from({ length: numberOfTeams }).map((_, index) => {
    const teamId = `team-${index + 1}`;
    const teamName = index === 0 ? fixture.team_name || "Home Team" : `Away Team ${index}`;
    
    return (
      <TabsTrigger key={teamId} value={teamId}>
        {teamName}
      </TabsTrigger>
    );
  });

  // Generate team tab contents
  const teamTabContents = Array.from({ length: numberOfTeams }).map((_, index) => {
    const teamId = `team-${index + 1}`;
    const teamName = index === 0 ? fixture.team_name || "Home Team" : `Away Team ${index}`;
    
    // Get periods for this team
    const periods = periodsPerTeam[teamId] || [];
    
    // Get current performance category for this team
    const currentPerformanceCategory = performanceCategories[teamId] || "MESSI" as PerformanceCategory;
    
    // Get current formation template for this team
    const currentFormationTemplate = teamFormationTemplates[teamId] || "All";
    
    // Get current captain for this team
    const currentCaptain = teamCaptains[teamId] || "";
    
    return (
      <TabsContent key={teamId} value={teamId} className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{teamName}</CardTitle>
            <Select value={currentPerformanceCategory} onValueChange={(value) => handleTeamPerformanceCategoryChange(teamId, value as PerformanceCategory)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MESSI">Messi</SelectItem>
                <SelectItem value="RONALDO">Ronaldo</SelectItem>
                <SelectItem value="JAGS">Jags</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all-periods">
              <TabsList>
                <TabsTrigger value="all-periods">All Periods</TabsTrigger>
                {periods.map(period => (
                  <TabsTrigger key={period.id} value={period.id}>
                    Period {period.id.split('-')[1]}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="all-periods">
                {/* All periods view */}
                <div className="space-y-4">
                  {periods.map(period => {
                    const periodNumber = parseInt(period.id.split('-')[1]);
                    const periodSelections = allSelections[teamId]?.[period.id] || {};
                    
                    return (
                      <Card key={period.id} className="mb-4">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle>Period {periodNumber} ({period.duration} min)</CardTitle>
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={period.duration}
                                onChange={(e) => handlePeriodChange(teamId, period.id, parseInt(e.target.value))}
                                className="w-16 h-9 rounded-md border border-input bg-background px-3"
                                min={1}
                                max={90}
                              />
                              {periods.length > 1 && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleRemovePeriod(teamId, period.id)}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <FormationSelector
                            format={format}
                            teamName={teamName}
                            onSelectionChange={(selections) => {
                              // Ensure performanceCategory is properly typed
                              const typedSelections = Object.entries(selections).reduce((acc, [key, value]) => {
                                return {
                                  ...acc,
                                  [key]: {
                                    ...value,
                                    performanceCategory: currentPerformanceCategory
                                  }
                                };
                              }, {} as TeamSelections);
                              
                              handleTeamSelectionChange(teamId, period.id, typedSelections);
                            }}
                            selectedPlayers={selectedPlayers}
                            availablePlayers={players}
                            performanceCategory={currentPerformanceCategory}
                            initialSelections={periodSelections}
                            viewMode="team-sheet"
                            periodNumber={periodNumber}
                            duration={period.duration}
                            formationTemplate={currentFormationTemplate}
                            onTemplateChange={(template) => handleTemplateChange(teamId, template)}
                          />
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  <Button onClick={() => handleAddPeriod(teamId)}>
                    Add Period
                  </Button>
                </div>
              </TabsContent>
              
              {/* Individual period tabs */}
              {periods.map(period => {
                const periodNumber = parseInt(period.id.split('-')[1]);
                const periodSelections = allSelections[teamId]?.[period.id] || {};
                
                return (
                  <TabsContent key={period.id} value={period.id}>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Period {periodNumber} ({period.duration} min)</CardTitle>
                        <input
                          type="number"
                          value={period.duration}
                          onChange={(e) => handlePeriodChange(teamId, period.id, parseInt(e.target.value))}
                          className="w-16 h-9 rounded-md border border-input bg-background px-3"
                          min={1}
                          max={90}
                        />
                      </CardHeader>
                      <CardContent>
                        <FormationSelector
                          format={format}
                          teamName={teamName}
                          onSelectionChange={(selections) => {
                            // Ensure performanceCategory is properly typed
                            const typedSelections = Object.entries(selections).reduce((acc, [key, value]) => {
                              return {
                                ...acc,
                                [key]: {
                                  ...value,
                                  performanceCategory: currentPerformanceCategory
                                }
                              };
                            }, {} as TeamSelections);
                            
                            handleTeamSelectionChange(teamId, period.id, typedSelections);
                          }}
                          selectedPlayers={selectedPlayers}
                          availablePlayers={players}
                          performanceCategory={currentPerformanceCategory}
                          initialSelections={periodSelections}
                          viewMode="team-sheet"
                          periodNumber={periodNumber}
                          duration={period.duration}
                          formationTemplate={currentFormationTemplate}
                          onTemplateChange={(template) => handleTemplateChange(teamId, template)}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Team Captain Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Team Captain</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={currentCaptain} onValueChange={(value) => handleTeamCaptainChange(teamId, value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select captain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Captain</SelectItem>
                {Array.from(selectedPlayers).map(playerId => {
                  const player = players?.find(p => p.id === playerId);
                  return player ? (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name} {player.squad_number ? `(${player.squad_number})` : ''}
                    </SelectItem>
                  ) : null;
                })}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </TabsContent>
    );
  });

  return (
    <div className="space-y-6">
      {numberOfTeams > 1 ? (
        <Tabs defaultValue="team-1" onValueChange={setActiveTeamTab}>
          <TabsList>{teamTabs}</TabsList>
          {teamTabContents}
        </Tabs>
      ) : (
        teamTabContents[0]
      )}
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Team Selections'}
        </Button>
      </div>
    </div>
  );
};
