
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormationSelector } from "@/components/FormationSelector";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTeamSelections } from "@/hooks/useTeamSelections";
import { TeamHeaderControls } from "./TeamHeaderControls";
import { TeamPeriodCard } from "./TeamPeriodCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { saveTeamSelections } from "@/services/teamSelectionService";

interface TeamSelectionManagerProps {
  fixture: any | null;
  onSuccess?: () => void;
}

export const TeamSelectionManager = ({ fixture, onSuccess }: TeamSelectionManagerProps) => {
  const { toast } = useToast();
  const [activeTeam, setActiveTeam] = useState<string>("1");
  const [isSaving, setIsSaving] = useState(false);

  const {
    selectedPlayers,
    periodsPerTeam,
    setPeriodsPerTeam,
    selections,
    setSelections,
    performanceCategories,
    setPerformanceCategories,
    teamCaptains,
    setTeamCaptains
  } = useTeamSelections(fixture);

  // Fetch available players once and cache them
  const { data: availablePlayers, isLoading: isLoadingPlayers } = useQuery({
    queryKey: ["available-players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: Infinity, // Keep the data cached
  });

  // Fetch and set initial performance categories from fixture_team_times
  useEffect(() => {
    const fetchTeamTimes = async () => {
      if (!fixture?.id) return;

      const { data: teamTimes, error } = await supabase
        .from('fixture_team_times')
        .select('*')
        .eq('fixture_id', fixture.id);

      if (error) {
        console.error("Error fetching team times:", error);
        return;
      }

      if (teamTimes && teamTimes.length > 0) {
        const newPerformanceCategories = { ...performanceCategories };
        teamTimes.forEach(teamTime => {
          const teamId = teamTime.team_number.toString();
          // Set performance category for the first period of each team
          newPerformanceCategories[`period-1-${teamId}`] = teamTime.performance_category || 'MESSI';
        });
        setPerformanceCategories(newPerformanceCategories);
      }
    };

    fetchTeamTimes();
  }, [fixture?.id]);

  const handleCaptainChange = (teamId: string, playerId: string) => {
    setTeamCaptains(prev => ({
      ...prev,
      [teamId]: playerId
    }));
  };

  const handleDeletePeriod = (teamId: string, periodId: string) => {
    setPeriodsPerTeam(prev => ({
      ...prev,
      [teamId]: prev[teamId].filter(p => p.id !== periodId)
    }));
    
    setSelections(prev => {
      const newSelections = { ...prev };
      delete newSelections[periodId];
      return newSelections;
    });

    setPerformanceCategories(prev => {
      const newCategories = { ...prev };
      delete newCategories[`${periodId}-${teamId}`];
      return newCategories;
    });
  };

  const handleTeamSelectionChange = (periodId: string, teamId: string, teamSelections: Record<string, { playerId: string; position: string; performanceCategory?: string }>) => {
    console.log("Team selection change:", { periodId, teamId, teamSelections });
    
    setSelections(prev => ({
      ...prev,
      [periodId]: {
        ...prev[periodId],
        [teamId]: teamSelections
      }
    }));

    // Update selected players
    const newSelectedPlayers = new Set<string>();
    Object.values(selections).forEach(periodSelections => {
      Object.values(periodSelections).forEach(teamSelections => {
        Object.values(teamSelections).forEach(selection => {
          if (selection.playerId !== "unassigned") {
            newSelectedPlayers.add(selection.playerId);
          }
        });
      });
    });

    Object.values(teamSelections).forEach(selection => {
      if (selection.playerId !== "unassigned") {
        newSelectedPlayers.add(selection.playerId);
      }
    });
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
      await saveTeamSelections(
        fixture,
        periodsPerTeam,
        selections,
        performanceCategories,
        teamCaptains
      );
      
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

  const handleAddPeriod = (teamId: string) => {
    const currentPeriods = periodsPerTeam[teamId] || [];
    const maxPeriodNumber = Math.max(...currentPeriods.map(p => 
      parseInt(p.id.split('-')[1])
    ), 0);
    const newPeriodId = `period-${maxPeriodNumber + 1}`;
    
    // Get the last period's selections to duplicate
    const lastPeriodId = currentPeriods[currentPeriods.length - 1]?.id;
    const lastPeriodSelections = lastPeriodId ? selections[lastPeriodId]?.[teamId] : {};
    
    setPeriodsPerTeam(prev => ({
      ...prev,
      [teamId]: [...(prev[teamId] || []), { id: newPeriodId, duration: 20 }]
    }));

    // Duplicate the selections from the last period
    if (lastPeriodSelections) {
      setSelections(prev => ({
        ...prev,
        [newPeriodId]: {
          ...prev[newPeriodId],
          [teamId]: { ...lastPeriodSelections }
        }
      }));
    }

    const currentCategory = performanceCategories[`${lastPeriodId}-${teamId}`] || 'MESSI';
    setPerformanceCategories(prev => ({
      ...prev,
      [`${newPeriodId}-${teamId}`]: currentCategory
    }));

    toast({
      title: "Period Added",
      description: `Period ${maxPeriodNumber + 1} has been created with the previous period's selections.`,
    });
  };

  if (!fixture || !availablePlayers) {
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

                  setSelections(prev => {
                    const newSelections = { ...prev };
                    teamPeriods.forEach(period => {
                      if (newSelections[period.id]?.[teamId]) {
                        Object.keys(newSelections[period.id][teamId]).forEach(position => {
                          if (newSelections[period.id][teamId][position]) {
                            newSelections[period.id][teamId][position] = {
                              ...newSelections[period.id][teamId][position],
                              performanceCategory: value
                            };
                          }
                        });
                      }
                    });
                    return newSelections;
                  });
                }}
                onAddPeriod={() => handleAddPeriod(teamId)}
              />

              <div className="flex flex-col space-y-6">
                {teamPeriods.map((period) => (
                  <TeamPeriodCard
                    key={period.id}
                    periodId={period.id}
                    periodNumber={parseInt(period.id.split('-')[1])}
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
