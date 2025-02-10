
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeamSelections } from "@/hooks/useTeamSelections";
import { TeamHeaderControls } from "./TeamHeaderControls";
import { TeamPeriodCard } from "./TeamPeriodCard";
import { saveTeamSelections } from "@/services/teamSelectionService";

interface TeamSelectionManagerProps {
  fixture: any | null;
}

export const TeamSelectionManager = ({ fixture }: TeamSelectionManagerProps) => {
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

  // Fetch existing team selections
  const { data: existingSelections, isLoading: isLoadingSelections } = useQuery({
    queryKey: ["team-selections", fixture?.id],
    queryFn: async () => {
      if (!fixture?.id) return null;
      
      const { data, error } = await supabase
        .from('team_selections')
        .select('*')
        .eq('event_id', fixture.id)
        .eq('event_type', 'FIXTURE');
      
      if (error) throw error;
      return data;
    },
    enabled: !!fixture?.id
  });

  // Fetch team captains
  const { data: existingCaptains, isLoading: isLoadingCaptains } = useQuery({
    queryKey: ["team-captains", fixture?.id],
    queryFn: async () => {
      if (!fixture?.id) return null;
      
      const { data, error } = await supabase
        .from('fixture_team_selections')
        .select('*')
        .eq('fixture_id', fixture.id)
        .eq('is_captain', true);
      
      if (error) throw error;
      return data;
    },
    enabled: !!fixture?.id
  });

  const { data: availablePlayers } = useQuery({
    queryKey: ["available-players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Initialize selections and periods from existing data
  useEffect(() => {
    if (existingSelections && !isLoadingSelections) {
      const newPeriodsPerTeam: Record<string, Array<{ id: string; duration: number }>> = {};
      const newSelections: Record<string, Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>> = {};
      const newPerformanceCategories: Record<string, string> = {};

      // Group selections by team and period
      existingSelections.forEach(selection => {
        const teamId = selection.team_number.toString();
        const periodId = `period-${selection.period_number}`;
        
        // Initialize team periods if not exists
        if (!newPeriodsPerTeam[teamId]) {
          newPeriodsPerTeam[teamId] = [];
        }
        
        // Add period if not exists
        if (!newPeriodsPerTeam[teamId].find(p => p.id === periodId)) {
          newPeriodsPerTeam[teamId].push({
            id: periodId,
            duration: selection.duration_minutes || 20
          });
        }

        // Initialize selections structure
        if (!newSelections[periodId]) {
          newSelections[periodId] = {};
        }
        if (!newSelections[periodId][teamId]) {
          newSelections[periodId][teamId] = {};
        }

        // Add selection
        newSelections[periodId][teamId][selection.position] = {
          playerId: selection.player_id,
          position: selection.position,
          performanceCategory: selection.performance_category
        };

        // Store performance category
        newPerformanceCategories[`${periodId}-${teamId}`] = selection.performance_category || 'MESSI';
      });

      // Sort periods by number to maintain order
      Object.keys(newPeriodsPerTeam).forEach(teamId => {
        newPeriodsPerTeam[teamId].sort((a, b) => {
          const aNum = parseInt(a.id.split('-')[1]);
          const bNum = parseInt(b.id.split('-')[1]);
          return aNum - bNum;
        });
      });

      setPeriodsPerTeam(newPeriodsPerTeam);
      setSelections(newSelections);
      setPerformanceCategories(newPerformanceCategories);
    }
  }, [existingSelections, isLoadingSelections, setPeriodsPerTeam, setSelections, setPerformanceCategories]);

  // Initialize team captains
  useEffect(() => {
    if (existingCaptains && !isLoadingCaptains) {
      const newTeamCaptains: Record<string, string> = {};
      existingCaptains.forEach(captain => {
        newTeamCaptains[captain.team_number.toString()] = captain.player_id;
      });
      setTeamCaptains(newTeamCaptains);
    }
  }, [existingCaptains, isLoadingCaptains, setTeamCaptains]);

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
    setSelections(prev => ({
      ...prev,
      [periodId]: {
        ...prev[periodId],
        [teamId]: teamSelections
      }
    }));

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
                onAddPeriod={() => {
                  const maxPeriodNumber = Math.max(...teamPeriods.map(p => 
                    parseInt(p.id.split('-')[1])
                  ), 0);
                  const newPeriodId = `period-${maxPeriodNumber + 1}`;
                  
                  const currentCategory = performanceCategories[`period-1-${teamId}`] || 'MESSI';
                  
                  setPeriodsPerTeam(prev => ({
                    ...prev,
                    [teamId]: [...(prev[teamId] || []), { id: newPeriodId, duration: 20 }]
                  }));

                  setPerformanceCategories(prev => ({
                    ...prev,
                    [`${newPeriodId}-${teamId}`]: currentCategory
                  }));
                }}
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
