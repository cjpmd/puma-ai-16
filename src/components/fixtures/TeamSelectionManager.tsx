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

  const { data: existingSelections = [], isLoading: isLoadingSelections } = useQuery({
    queryKey: ["fixture-selections", fixture?.id],
    queryFn: async () => {
      if (!fixture?.id) return [];
      
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
    enabled: !!fixture?.id,
  });

  useEffect(() => {
    if (!fixture) return;

    const newPeriodsPerTeam: Record<string, Array<{ id: string; duration: number }>> = {};
    const newSelections: Record<string, Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>> = {};
    const newPerformanceCategories: Record<string, string> = {};
    const newTeamCaptains: Record<string, string> = {};

    for (let i = 1; i <= (fixture.number_of_teams || 1); i++) {
      const teamId = i.toString();
      const periodId = `period-1`;
      
      newPeriodsPerTeam[teamId] = [{ id: periodId, duration: 20 }];
      
      if (!newSelections[periodId]) {
        newSelections[periodId] = {};
      }
      newSelections[periodId][teamId] = {};
      
      newPerformanceCategories[`${periodId}-${teamId}`] = 'MESSI';
    }

    setPeriodsPerTeam(newPeriodsPerTeam);
    setSelections(newSelections);
    setPerformanceCategories(newPerformanceCategories);
    setTeamCaptains(newTeamCaptains);
  }, [fixture]);

  useEffect(() => {
    if (!existingSelections || existingSelections.length === 0) return;
    
    console.log("Processing existing selections:", existingSelections);
    
    try {
      const loadedSelections: Record<string, Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>> = {
        'period-1': {
          '1': {}
        }
      };
      const loadedTeamCaptains: Record<string, string> = {};
      const loadedPeriodsPerTeam: Record<string, Array<{ id: string; duration: number }>> = {
        '1': [{ id: 'period-1', duration: 20 }]
      };
      const loadedPerformanceCategories: Record<string, string> = {};

      existingSelections.forEach(selection => {
        const teamId = selection.team_number?.toString() || '1';
        const periodId = 'period-1';
        const position = selection.position;
        
        let slotId = '';
        switch (position) {
          case 'GK':
            slotId = 'gk-1';
            break;
          case 'DL':
            slotId = 'def-1';
            break;
          case 'DC':
            slotId = 'def-2';
            break;
          case 'DR':
            slotId = 'def-3';
            break;
          case 'MC':
            slotId = 'mid-1';
            break;
          case 'AMC':
            slotId = 'str-2';
            break;
          case 'STC':
            slotId = 'str-1';
            break;
          default:
            slotId = `pos-${Math.random()}`;
        }

        if (!loadedSelections[periodId]) {
          loadedSelections[periodId] = {};
        }
        if (!loadedSelections[periodId][teamId]) {
          loadedSelections[periodId][teamId] = {};
        }

        loadedSelections[periodId][teamId][slotId] = {
          playerId: selection.player_id,
          position: selection.position,
          performanceCategory: selection.performance_category || 'MESSI'
        };

        if (selection.is_captain) {
          loadedTeamCaptains[teamId] = selection.player_id;
        }

        loadedPerformanceCategories[`${periodId}-${teamId}`] = selection.performance_category || 'MESSI';
      });

      console.log("Processed selections into formation:", loadedSelections);

      if (Object.keys(loadedSelections).length > 0) {
        setSelections(loadedSelections);
        setTeamCaptains(loadedTeamCaptains);
        setPeriodsPerTeam(loadedPeriodsPerTeam);
        setPerformanceCategories(loadedPerformanceCategories);
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
    
    let lastPeriodSelections = {};
    if (currentPeriods.length > 0) {
      const lastPeriodId = currentPeriods[currentPeriods.length - 1].id;
      if (selections[lastPeriodId] && selections[lastPeriodId][teamId]) {
        lastPeriodSelections = JSON.parse(JSON.stringify(selections[lastPeriodId][teamId]));
        console.log(`Duplicating selections from ${lastPeriodId} to ${newPeriodId}:`, lastPeriodSelections);
      }
    }
    
    setPeriodsPerTeam(prev => ({
      ...prev,
      [teamId]: [...(prev[teamId] || []), { id: newPeriodId, duration: 20 }]
    }));

    setSelections(prev => {
      const newSelections = { ...prev };
      if (!newSelections[newPeriodId]) {
        newSelections[newPeriodId] = {};
      }
      newSelections[newPeriodId][teamId] = lastPeriodSelections;
      return newSelections;
    });

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
    
    setSelections(prev => {
      const newSelections = { ...prev };
      if (!newSelections[periodId]) {
        newSelections[periodId] = {};
      }
      newSelections[periodId][teamId] = JSON.parse(JSON.stringify(teamSelections));
      return newSelections;
    });

    updateSelectedPlayers();
  };

  const updateSelectedPlayers = () => {
    const newSelectedPlayers = new Set<string>();
    
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

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      if (!fixture?.id) {
        throw new Error("Missing fixture ID");
      }
      
      console.log("Saving team selections to database...");
      
      const { error: deleteError } = await supabase
        .from("fixture_team_selections")
        .delete()
        .eq("fixture_id", fixture.id);
        
      if (deleteError) {
        console.error("Error deleting existing selections:", deleteError);
        throw deleteError;
      }
      
      const teamSelectionsToSave = [];
      
      for (const teamId of Object.keys(periodsPerTeam)) {
        const teamPeriods = periodsPerTeam[teamId] || [];
        
        for (const period of teamPeriods) {
          const periodId = period.id;
          const teamSelections = selections[periodId]?.[teamId] || {};
          
          Object.entries(teamSelections).forEach(([slotId, selection]) => {
            if (selection.playerId && selection.playerId !== "unassigned") {
              teamSelectionsToSave.push({
                fixture_id: fixture.id,
                player_id: selection.playerId,
                position: selection.position,
                performance_category: selection.performanceCategory || "MESSI",
                team_number: parseInt(teamId),
                is_captain: teamCaptains[teamId] === selection.playerId
              });
            }
          });
        }
      }
      
      console.log("Saving player selections:", teamSelectionsToSave);
      
      if (teamSelectionsToSave.length > 0) {
        const { data, error } = await supabase
          .from("fixture_team_selections")
          .insert(teamSelectionsToSave)
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
        description: "Failed to save team selections: " + (error.message || "Unknown error"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isLoadingPlayers || isLoadingSelections || !fixture;

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
