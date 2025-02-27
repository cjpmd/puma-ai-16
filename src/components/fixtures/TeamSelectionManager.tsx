
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormationSelector } from "@/components/FormationSelector";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamHeaderControls } from "./TeamHeaderControls";
import { TeamPeriodCard } from "./TeamPeriodCard";

interface TeamSelectionManagerProps {
  fixture: any | null;
  onSuccess?: () => void;
}

export const TeamSelectionManager = ({ fixture, onSuccess }: TeamSelectionManagerProps) => {
  const { toast } = useToast();
  const [activeTeam, setActiveTeam] = useState<string>("1");
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [periodsPerTeam, setPeriodsPerTeam] = useState<Record<string, Array<{ id: string; duration: number }>>>({});
  const [selections, setSelections] = useState<Record<string, Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>>>({});
  const [performanceCategories, setPerformanceCategories] = useState<Record<string, string>>({});
  const [teamCaptains, setTeamCaptains] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [columnsInfo, setColumnsInfo] = useState<string[]>([]);

  // Fetch available columns from the fixture_team_selections table
  useEffect(() => {
    const fetchTableColumns = async () => {
      try {
        console.log("Checking available columns in fixture_team_selections table");
        
        const { data, error } = await supabase
          .rpc('get_table_columns', { table_name: 'fixture_team_selections' });
        
        if (error) {
          console.error("Error fetching table columns:", error);
          // If the RPC function doesn't exist, we'll use a fallback approach
          // Set basic columns that should exist in any table
          setColumnsInfo(['fixture_id', 'selections_data']);
          return;
        }
        
        if (data && Array.isArray(data)) {
          console.log("Available columns in fixture_team_selections:", data);
          setColumnsInfo(data);
        } else {
          // Fallback to basic columns
          setColumnsInfo(['fixture_id', 'selections_data']);
        }
      } catch (error) {
        console.error("Exception fetching table columns:", error);
        // Fallback to basic columns
        setColumnsInfo(['fixture_id', 'selections_data']);
      }
    };
    
    fetchTableColumns();
  }, []);

  // Fetch available players
  const { data: availablePlayers = [], isLoading: isLoadingPlayers } = useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch existing team selections when fixture is loaded
  const { data: existingSelections = [], isLoading: isLoadingSelections } = useQuery({
    queryKey: ["fixture-selections", fixture?.id, columnsInfo],
    queryFn: async () => {
      if (!fixture?.id || columnsInfo.length === 0) return [];
      
      console.log("Fetching existing selections for fixture:", fixture.id);
      
      try {
        const { data, error } = await supabase
          .from("fixture_team_selections")
          .select("*")
          .eq("fixture_id", fixture.id);
        
        if (error) {
          console.error("Error fetching selections:", error);
          return [];
        }
        
        console.log("Fetched selections:", data);
        return data || [];
      } catch (error) {
        console.error("Exception fetching selections:", error);
        return [];
      }
    },
    enabled: !!fixture?.id && columnsInfo.length > 0,
  });

  // Initialize periods for each team when fixture loads
  useEffect(() => {
    if (!fixture) return;

    const newPeriodsPerTeam: Record<string, Array<{ id: string; duration: number }>> = {};
    const newSelections: Record<string, Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>> = {};
    const newPerformanceCategories: Record<string, string> = {};
    const newTeamCaptains: Record<string, string> = {};

    // Initialize one period for each team
    for (let i = 1; i <= (fixture.number_of_teams || 1); i++) {
      const teamId = i.toString();
      const periodId = `period-1`;
      
      newPeriodsPerTeam[teamId] = [{ id: periodId, duration: 20 }];
      
      // Initialize empty selections for this period/team
      if (!newSelections[periodId]) {
        newSelections[periodId] = {};
      }
      newSelections[periodId][teamId] = {};
      
      // Set initial performance category for the period
      newPerformanceCategories[`${periodId}-${teamId}`] = 'MESSI';
    }

    setPeriodsPerTeam(newPeriodsPerTeam);
    setSelections(newSelections);
    setPerformanceCategories(newPerformanceCategories);
    setTeamCaptains(newTeamCaptains);
  }, [fixture]);

  // Load existing selections when they're fetched
  useEffect(() => {
    if (!existingSelections || existingSelections.length === 0) return;
    
    console.log("Processing existing selections:", existingSelections);
    
    try {
      const loadedSelections = {};
      const loadedTeamCaptains = {};
      const loadedPeriodsPerTeam = {};
      const loadedPerformanceCategories = {};
      
      existingSelections.forEach(selection => {
        // Extract data differently based on what columns are available
        const fixtureId = selection.fixture_id;
        const selectionsData = selection.selections_data ? 
          (typeof selection.selections_data === 'string' ? 
            JSON.parse(selection.selections_data) : 
            selection.selections_data) : 
          {};
        
        // If we have simple JSON selections_data only, we'll store one entry per fixture
        if (!columnsInfo.includes('team_id') && !columnsInfo.includes('period_id')) {
          // Initialize default periods and teams
          const teamId = "1";
          const periodId = "period-1";
          
          if (!loadedPeriodsPerTeam[teamId]) {
            loadedPeriodsPerTeam[teamId] = [];
          }
          
          if (!loadedPeriodsPerTeam[teamId].some(p => p.id === periodId)) {
            loadedPeriodsPerTeam[teamId].push({ 
              id: periodId, 
              duration: selection.duration || 20 
            });
          }
          
          if (!loadedSelections[periodId]) {
            loadedSelections[periodId] = {};
          }
          
          if (!loadedSelections[periodId][teamId]) {
            loadedSelections[periodId][teamId] = {};
          }
          
          // Store the selections for this team/period
          loadedSelections[periodId][teamId] = selectionsData;
          
          // Set performance category
          if (selection.performance_category) {
            loadedPerformanceCategories[`${periodId}-${teamId}`] = selection.performance_category;
          }
          
          // Set team captain
          if (selection.captain_id) {
            loadedTeamCaptains[teamId] = selection.captain_id;
          }
        } 
        // If we have team_id and period_id columns, process with those
        else if (columnsInfo.includes('team_id') && columnsInfo.includes('period_id')) {
          const teamId = selection.team_id || "1";
          const periodId = selection.period_id || "period-1";
          
          if (!loadedPeriodsPerTeam[teamId]) {
            loadedPeriodsPerTeam[teamId] = [];
          }
          
          if (!loadedPeriodsPerTeam[teamId].some(p => p.id === periodId)) {
            loadedPeriodsPerTeam[teamId].push({ 
              id: periodId, 
              duration: selection.duration || 20 
            });
          }
          
          if (!loadedSelections[periodId]) {
            loadedSelections[periodId] = {};
          }
          
          if (!loadedSelections[periodId][teamId]) {
            loadedSelections[periodId][teamId] = {};
          }
          
          // Store the selections for this team/period
          loadedSelections[periodId][teamId] = selectionsData;
          
          // Set performance category
          if (selection.performance_category) {
            loadedPerformanceCategories[`${periodId}-${teamId}`] = selection.performance_category;
          }
          
          // Set team captain
          if (selection.captain_id) {
            loadedTeamCaptains[teamId] = selection.captain_id;
          }
        }
      });
      
      console.log("Processed existing selections:", {
        loadedSelections,
        loadedTeamCaptains,
        loadedPeriodsPerTeam,
        loadedPerformanceCategories
      });
      
      // Only update state if we have data
      if (Object.keys(loadedSelections).length > 0) {
        setSelections(loadedSelections);
        setTeamCaptains(loadedTeamCaptains);
        
        if (Object.keys(loadedPeriodsPerTeam).length > 0) {
          setPeriodsPerTeam(loadedPeriodsPerTeam);
        }
        
        if (Object.keys(loadedPerformanceCategories).length > 0) {
          setPerformanceCategories(loadedPerformanceCategories);
        }
        
        // Update selected players based on loaded selections
        updateSelectedPlayersFromSelections(loadedSelections);
      }
    } catch (error) {
      console.error("Error processing existing selections:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load saved team selections",
      });
    }
  }, [existingSelections, columnsInfo, toast]);

  const updateSelectedPlayersFromSelections = (selectionsData: Record<string, Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>>) => {
    const newSelectedPlayers = new Set<string>();
    
    Object.values(selectionsData).forEach(periodSelections => {
      Object.values(periodSelections).forEach(teamSelections => {
        Object.values(teamSelections).forEach(selection => {
          if (selection.playerId && selection.playerId !== "unassigned") {
            newSelectedPlayers.add(selection.playerId);
          }
        });
      });
    });
    
    setSelectedPlayers(newSelectedPlayers);
  };

  const handleCaptainChange = (teamId: string, playerId: string) => {
    setTeamCaptains(prev => ({
      ...prev,
      [teamId]: playerId
    }));
  };

  const handleDeletePeriod = (teamId: string, periodId: string) => {
    setPeriodsPerTeam(prev => {
      const newPeriodsPerTeam = { ...prev };
      newPeriodsPerTeam[teamId] = prev[teamId].filter(p => p.id !== periodId);
      return newPeriodsPerTeam;
    });
    
    // Clean up selections for deleted period
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

    // Clean up performance categories for deleted period
    setPerformanceCategories(prev => {
      const newCategories = { ...prev };
      delete newCategories[`${periodId}-${teamId}`];
      return newCategories;
    });
  };

  const handleAddPeriod = (teamId: string) => {
    const currentPeriods = periodsPerTeam[teamId] || [];
    const newPeriodNumber = currentPeriods.length + 1;
    const newPeriodId = `period-${newPeriodNumber}`;
    
    // Get the last period's selections to duplicate
    let lastPeriodSelections = {};
    if (currentPeriods.length > 0) {
      const lastPeriodId = currentPeriods[currentPeriods.length - 1].id;
      if (selections[lastPeriodId] && selections[lastPeriodId][teamId]) {
        // Deep clone to avoid reference issues
        lastPeriodSelections = JSON.parse(JSON.stringify(selections[lastPeriodId][teamId]));
        console.log(`Duplicating selections from ${lastPeriodId} to ${newPeriodId}:`, lastPeriodSelections);
      }
    }
    
    // Add new period
    setPeriodsPerTeam(prev => ({
      ...prev,
      [teamId]: [...(prev[teamId] || []), { id: newPeriodId, duration: 20 }]
    }));

    // Duplicate the selections from the last period
    setSelections(prev => {
      const newSelections = { ...prev };
      if (!newSelections[newPeriodId]) {
        newSelections[newPeriodId] = {};
      }
      newSelections[newPeriodId][teamId] = lastPeriodSelections;
      return newSelections;
    });

    // Copy performance category from the last period
    if (currentPeriods.length > 0) {
      const lastPeriodId = currentPeriods[currentPeriods.length - 1].id;
      const lastCategory = performanceCategories[`${lastPeriodId}-${teamId}`] || 'MESSI';
      setPerformanceCategories(prev => ({
        ...prev,
        [`${newPeriodId}-${teamId}`]: lastCategory
      }));
    } else {
      setPerformanceCategories(prev => ({
        ...prev,
        [`${newPeriodId}-${teamId}`]: 'MESSI'
      }));
    }

    toast({
      title: "Period Added",
      description: `Period ${newPeriodNumber} has been added with previous period's selections.`,
    });
  };

  const handleTeamSelectionChange = (periodId: string, teamId: string, teamSelections: Record<string, { playerId: string; position: string; performanceCategory?: string }>) => {
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

  // Utility function to update the set of selected players
  const updateSelectedPlayers = () => {
    const newSelectedPlayers = new Set<string>();
    
    // Iterate through all periods and teams to collect selected players
    Object.values(selections).forEach(periodSelections => {
      Object.values(periodSelections).forEach(teamSelections => {
        Object.values(teamSelections).forEach(selection => {
          if (selection.playerId && selection.playerId !== "unassigned") {
            newSelectedPlayers.add(selection.playerId);
          }
        });
      });
    });
    
    setSelectedPlayers(newSelectedPlayers);
  };

  const handleDurationChange = (teamId: string, periodId: string, duration: number) => {
    setPeriodsPerTeam(prev => ({
      ...prev,
      [teamId]: prev[teamId].map(period => 
        period.id === periodId ? { ...period, duration } : period
      )
    }));
  };

  // Save team selections to database based on available columns
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      if (!fixture?.id) {
        throw new Error("Missing fixture ID");
      }
      
      console.log("Saving team selections to database using columns:", columnsInfo);
      
      // First delete existing selections for this fixture
      const { error: deleteError } = await supabase
        .from("fixture_team_selections")
        .delete()
        .eq("fixture_id", fixture.id);
        
      if (deleteError) {
        console.error("Error deleting existing selections:", deleteError);
        throw deleteError;
      }
      
      // We need to adapt our save logic based on the available columns
      if (columnsInfo.includes('team_id') && columnsInfo.includes('period_id')) {
        // We can save with team_id and period_id
        const selectionsToSave = [];
        
        for (const teamId of Object.keys(periodsPerTeam)) {
          const teamPeriods = periodsPerTeam[teamId] || [];
          
          for (const period of teamPeriods) {
            const periodId = period.id;
            const teamSelections = selections[periodId]?.[teamId] || {};
            
            // Prepare the record with only the columns we know exist
            const record: any = {
              fixture_id: fixture.id,
              team_id: teamId,
              period_id: periodId,
              selections_data: JSON.stringify(teamSelections)
            };
            
            // Add optional columns if they exist
            if (columnsInfo.includes('duration')) {
              record.duration = period.duration;
            }
            
            if (columnsInfo.includes('performance_category')) {
              record.performance_category = performanceCategories[`${periodId}-${teamId}`] || 'MESSI';
            }
            
            if (columnsInfo.includes('captain_id')) {
              record.captain_id = teamCaptains[teamId] || null;
            }
            
            selectionsToSave.push(record);
          }
        }
        
        console.log("Saving selections with multiple records:", selectionsToSave);
        
        if (selectionsToSave.length > 0) {
          const { data, error } = await supabase
            .from("fixture_team_selections")
            .insert(selectionsToSave)
            .select();
            
          if (error) {
            console.error("Error saving selections:", error);
            throw error;
          }
          
          console.log("Selections saved successfully:", data);
        }
      } else {
        // Fallback: Save one record per fixture with all selections in the JSON
        const allSelectionsData = {};
        
        // Combine all selections into a single JSON object
        Object.entries(selections).forEach(([periodId, periodData]) => {
          allSelectionsData[periodId] = {};
          
          Object.entries(periodData).forEach(([teamId, teamSelections]) => {
            allSelectionsData[periodId][teamId] = teamSelections;
          });
        });
        
        // Create a single record with minimal columns
        const record: any = {
          fixture_id: fixture.id,
          selections_data: allSelectionsData
        };
        
        console.log("Saving selections with single record:", record);
        
        const { data, error } = await supabase
          .from("fixture_team_selections")
          .insert(record)
          .select();
          
        if (error) {
          console.error("Error saving selections:", error);
          throw error;
        }
        
        console.log("Selections saved successfully:", data);
      }
      
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
        description: "Failed to save team selections: " + (error.message || "Unknown error"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isLoadingPlayers || isLoadingSelections || !fixture || columnsInfo.length === 0;

  if (isLoading) {
    return <div className="flex items-center justify-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <span className="ml-2">Loading team selection data...</span>
    </div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Team Selection - {fixture.opponent}</h2>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Selections'}
        </Button>
      </div>

      <Tabs defaultValue="1" className="w-full" onValueChange={setActiveTeam}>
        <TabsList className="w-full mb-4">
          {Array.from({ length: fixture.number_of_teams || 1 }).map((_, index) => (
            <TabsTrigger 
              key={index} 
              value={(index + 1).toString()}
              className="flex-1"
            >
              Team {index + 1}
            </TabsTrigger>
          ))}
        </TabsList>

        {Array.from({ length: fixture.number_of_teams || 1 }).map((_, teamIndex) => {
          const teamId = (teamIndex + 1).toString();
          const teamPeriods = periodsPerTeam[teamId] || [];

          return (
            <TabsContent 
              key={teamIndex} 
              value={teamId}
              className="mt-0"
            >
              <TeamHeaderControls
                teamId={teamId}
                teamCaptains={teamCaptains}
                availablePlayers={availablePlayers}
                onCaptainChange={handleCaptainChange}
                performanceCategory={performanceCategories[`period-1-${teamId}`] || "MESSI"}
                onPerformanceCategoryChange={(value) => {
                  const updatedCategories = { ...performanceCategories };
                  teamPeriods.forEach(period => {
                    updatedCategories[`${period.id}-${teamId}`] = value;
                  });
                  setPerformanceCategories(updatedCategories);
                }}
                onAddPeriod={() => handleAddPeriod(teamId)}
              />

              <div className="flex flex-col space-y-6">
                {teamPeriods.map((period, index) => (
                  <TeamPeriodCard
                    key={`${period.id}-${teamId}-${performanceCategories[`${period.id}-${teamId}`] || 'MESSI'}`}
                    periodId={period.id}
                    periodNumber={index + 1}
                    teamId={teamId}
                    format={fixture.format}
                    teamName={fixture.team_name}
                    onSelectionChange={handleTeamSelectionChange}
                    selectedPlayers={selectedPlayers}
                    availablePlayers={availablePlayers}
                    initialSelections={selections[period.id]?.[teamId]}
                    performanceCategory={performanceCategories[`${period.id}-${teamId}`]}
                    onDeletePeriod={handleDeletePeriod}
                    duration={period.duration}
                    onDurationChange={(duration) => handleDurationChange(teamId, period.id, duration)}
                  />
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
