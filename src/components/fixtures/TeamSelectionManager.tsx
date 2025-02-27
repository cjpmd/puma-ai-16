
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
  const { data: existingSelections, isLoading: isLoadingSelections } = useQuery({
    queryKey: ["fixture-team-selections", fixture?.id],
    queryFn: async () => {
      if (!fixture?.id) return null;
      
      console.log("Fetching existing team selections for fixture:", fixture.id);
      const { data, error } = await supabase
        .from("fixture_team_selections")
        .select("*")
        .eq("fixture_id", fixture.id);
      
      if (error) {
        console.error("Error fetching team selections:", error);
        throw error;
      }
      
      console.log("Existing team selections:", data);
      return data || [];
    },
    enabled: !!fixture?.id,
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
    
    console.log("Processing existing team selections to restore state");
    
    try {
      const loadedPeriodsPerTeam: Record<string, Array<{ id: string; duration: number }>> = {};
      const loadedSelections: Record<string, Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>> = {};
      const loadedPerformanceCategories: Record<string, string> = {};
      const loadedTeamCaptains: Record<string, string> = {};
      
      // Process all selections from the database
      existingSelections.forEach(selection => {
        const { team_id, period_id, duration, selections_data, performance_category, captain_id } = selection;
        
        // Parse the selections data from JSON
        const parsedSelections = selections_data ? JSON.parse(selections_data) : {};
        
        // Initialize period for this team if not exist
        if (!loadedPeriodsPerTeam[team_id]) {
          loadedPeriodsPerTeam[team_id] = [];
        }
        
        // Add period if it doesn't exist
        if (!loadedPeriodsPerTeam[team_id].some(p => p.id === period_id)) {
          loadedPeriodsPerTeam[team_id].push({ id: period_id, duration: duration || 20 });
        }
        
        // Initialize selections structure if needed
        if (!loadedSelections[period_id]) {
          loadedSelections[period_id] = {};
        }
        if (!loadedSelections[period_id][team_id]) {
          loadedSelections[period_id][team_id] = {};
        }
        
        // Set the selections for this period and team
        loadedSelections[period_id][team_id] = parsedSelections;
        
        // Set performance category
        loadedPerformanceCategories[`${period_id}-${team_id}`] = performance_category || 'MESSI';
        
        // Set team captain if it exists
        if (captain_id) {
          loadedTeamCaptains[team_id] = captain_id;
        }
      });
      
      console.log("Restored state from database:", {
        loadedPeriodsPerTeam,
        loadedSelections,
        loadedPerformanceCategories,
        loadedTeamCaptains
      });
      
      // Only update state if there's data to restore
      if (Object.keys(loadedPeriodsPerTeam).length > 0) {
        setPeriodsPerTeam(loadedPeriodsPerTeam);
        setSelections(loadedSelections);
        setPerformanceCategories(loadedPerformanceCategories);
        setTeamCaptains(loadedTeamCaptains);
        
        // Update selectedPlayers based on loaded selections
        updateSelectedPlayersFromSelections(loadedSelections);
      }
    } catch (error) {
      console.error("Error processing existing team selections:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load saved team selections",
      });
    }
  }, [existingSelections, toast]);

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

  // Save team selections to database
  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log("Saving team selections to database:", selections);
      
      if (!fixture?.id) {
        throw new Error("Missing fixture ID");
      }
      
      // First delete existing selections for this fixture
      const { error: deleteError } = await supabase
        .from("fixture_team_selections")
        .delete()
        .eq("fixture_id", fixture.id);
        
      if (deleteError) {
        console.error("Error deleting existing selections:", deleteError);
        throw deleteError;
      }
      
      // Format the data for database insertion
      const selectionsToSave = [];
      
      for (const teamId of Object.keys(periodsPerTeam)) {
        const teamPeriods = periodsPerTeam[teamId] || [];
        
        for (const period of teamPeriods) {
          const periodId = period.id;
          const duration = period.duration;
          const performanceCategory = performanceCategories[`${periodId}-${teamId}`] || 'MESSI';
          const teamSelections = selections[periodId]?.[teamId] || {};
          
          selectionsToSave.push({
            fixture_id: fixture.id,
            team_id: teamId,
            period_id: periodId,
            duration: duration,
            performance_category: performanceCategory,
            selections_data: JSON.stringify(teamSelections),
            captain_id: teamCaptains[teamId] || null
          });
        }
      }
      
      console.log("Selections formatted for database:", selectionsToSave);
      
      // Insert all selections
      if (selectionsToSave.length > 0) {
        const { data, error } = await supabase
          .from("fixture_team_selections")
          .upsert(selectionsToSave)
          .select();
          
        if (error) {
          console.error("Error saving team selections:", error);
          throw error;
        }
        
        console.log("Team selections saved successfully:", data);
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
        description: "Failed to save team selections",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isLoadingPlayers || isLoadingSelections || !fixture;

  if (isLoading) {
    return <div>Loading...</div>;
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
