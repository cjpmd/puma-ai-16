
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormationSelector } from "@/components/FormationSelector";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TeamSelectionManagerProps {
  fixture: any | null;
}

export const TeamSelectionManager = ({ fixture }: TeamSelectionManagerProps) => {
  const { toast } = useToast();
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [periodsPerTeam, setPeriodsPerTeam] = useState<Record<string, Array<{ id: string; duration: number }>>>({});
  const [activeTeam, setActiveTeam] = useState<string>("1");
  const [selections, setSelections] = useState<Record<string, Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>>>({});
  const [performanceCategories, setPerformanceCategories] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

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

  useEffect(() => {
    const fetchSelections = async () => {
      if (!fixture) return;

      const { data: eventPeriods, error: periodsError } = await supabase
        .from('event_periods')
        .select('*')
        .eq('event_id', fixture.id)
        .eq('event_type', 'FIXTURE')
        .order('period_number');

      if (periodsError) {
        console.error("Error fetching periods:", periodsError);
        return;
      }

      const { data: selections, error: selectionsError } = await supabase
        .from('team_selections')
        .select('*')
        .eq('event_id', fixture.id)
        .eq('event_type', 'FIXTURE');

      if (selectionsError) {
        console.error("Error fetching selections:", selectionsError);
        return;
      }

      // Transform periods into periodsPerTeam structure
      const newPeriodsPerTeam: Record<string, Array<{ id: string; duration: number }>> = {};
      const transformedSelections: Record<string, Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>> = {};
      const newPerformanceCategories: Record<string, string> = {};

      // Initialize structure for all teams
      for (let i = 1; i <= (fixture.number_of_teams || 1); i++) {
        const teamKey = i.toString();
        newPeriodsPerTeam[teamKey] = [];
      }

      // Process event periods
      eventPeriods.forEach(period => {
        for (let i = 1; i <= (fixture.number_of_teams || 1); i++) {
          const teamKey = i.toString();
          const periodKey = `period-${period.period_number}`;
          newPeriodsPerTeam[teamKey].push({
            id: periodKey,
            duration: period.duration_minutes
          });
        }
      });

      // If no periods exist, initialize with one period per team
      if (Object.values(newPeriodsPerTeam).every(periods => periods.length === 0)) {
        Object.keys(newPeriodsPerTeam).forEach(teamKey => {
          newPeriodsPerTeam[teamKey] = [{ id: "period-1", duration: 20 }];
        });
      }

      // Process selections
      selections.forEach(selection => {
        const periodKey = `period-${selection.period_number}`;
        const teamKey = selection.team_number.toString();

        if (!transformedSelections[periodKey]) {
          transformedSelections[periodKey] = {};
        }
        if (!transformedSelections[periodKey][teamKey]) {
          transformedSelections[periodKey][teamKey] = {};
        }

        transformedSelections[periodKey][teamKey][selection.position] = {
          playerId: selection.player_id,
          position: selection.position,
          performanceCategory: selection.performance_category
        };

        newPerformanceCategories[`${periodKey}-${teamKey}`] = selection.performance_category || 'MESSI';
      });

      setPeriodsPerTeam(newPeriodsPerTeam);
      setSelections(transformedSelections);
      setPerformanceCategories(newPerformanceCategories);

      // Update selected players
      const newSelectedPlayers = new Set<string>();
      selections.forEach(selection => {
        if (selection.player_id !== "unassigned") {
          newSelectedPlayers.add(selection.player_id);
        }
      });
      setSelectedPlayers(newSelectedPlayers);
    };

    fetchSelections();
  }, [fixture]);

  const handleDeletePeriod = (teamId: string, periodId: string) => {
    const periodNumber = parseInt(periodId.split('-')[1]);
    
    // Remove period from periodsPerTeam
    setPeriodsPerTeam(prev => ({
      ...prev,
      [teamId]: prev[teamId].filter(p => p.id !== periodId)
    }));
    
    // Remove selections for this period
    setSelections(prev => {
      const newSelections = { ...prev };
      delete newSelections[periodId];
      return newSelections;
    });

    // Remove performance category for this period
    setPerformanceCategories(prev => {
      const newCategories = { ...prev };
      delete newCategories[`${periodId}-${teamId}`];
      return newCategories;
    });
  };

  const handleTeamSelectionChange = (periodId: string, teamId: string, teamSelections: Record<string, { playerId: string; position: string; performanceCategory?: string }>) => {
    // Update selections for this period and team
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

    // Add newly selected players
    Object.values(teamSelections).forEach(selection => {
      if (selection.playerId !== "unassigned") {
        newSelectedPlayers.add(selection.playerId);
      }
    });

    setSelectedPlayers(newSelectedPlayers);
  };

  const handlePerformanceCategoryChange = (periodId: string, teamId: string, category: string) => {
    setPerformanceCategories(prev => ({
      ...prev,
      [`${periodId}-${teamId}`]: category
    }));

    setSelections(prev => ({
      ...prev,
      [periodId]: {
        ...prev[periodId],
        [teamId]: Object.fromEntries(
          Object.entries(prev[periodId]?.[teamId] || {}).map(([pos, sel]) => [
            pos,
            { ...sel, performanceCategory: category }
          ])
        )
      }
    }));
  };

  const handleSave = async () => {
    if (!fixture) return;

    try {
      setIsSaving(true);

      // First, delete existing periods and selections
      await supabase
        .from('event_periods')
        .delete()
        .match({ event_id: fixture.id, event_type: 'FIXTURE' });

      await supabase
        .from('team_selections')
        .delete()
        .match({ event_id: fixture.id, event_type: 'FIXTURE' });

      // Create new periods one by one to avoid conflicts
      for (const [teamId, periods] of Object.entries(periodsPerTeam)) {
        for (const period of periods) {
          const periodNumber = parseInt(period.id.split('-')[1]);
          
          // Insert period
          const { data: periodData, error: periodError } = await supabase
            .from('event_periods')
            .upsert({
              event_id: fixture.id,
              event_type: 'FIXTURE',
              period_number: periodNumber,
              duration_minutes: period.duration
            })
            .select()
            .single();

          if (periodError) {
            console.error("Error creating period:", periodError);
            throw periodError;
          }

          // Insert selections for this period
          const periodSelections = selections[period.id]?.[teamId] || {};
          const selectionRecords = Object.entries(periodSelections)
            .filter(([_, selection]) => selection.playerId !== "unassigned")
            .map(([_, selection]) => ({
              event_id: fixture.id,
              event_type: 'FIXTURE',
              team_number: parseInt(teamId),
              player_id: selection.playerId,
              position: selection.position,
              period_number: periodNumber,
              performance_category: performanceCategories[`${period.id}-${teamId}`] || 'MESSI'
            }));

          if (selectionRecords.length > 0) {
            const { error: selectionsError } = await supabase
              .from('team_selections')
              .insert(selectionRecords);

            if (selectionsError) {
              console.error("Error creating selections:", selectionsError);
              throw selectionsError;
            }
          }
        }
      }

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
              <div className="flex justify-end mb-4">
                <Button 
                  onClick={() => {
                    const maxPeriodNumber = Math.max(...teamPeriods.map(p => 
                      parseInt(p.id.split('-')[1])
                    ), 0);
                    const newPeriodId = `period-${maxPeriodNumber + 1}`;
                    
                    // Get the performance category from the last period
                    const lastPeriod = teamPeriods[teamPeriods.length - 1];
                    const lastCategory = lastPeriod ? performanceCategories[`${lastPeriod.id}-${teamId}`] || 'MESSI' : 'MESSI';
                    
                    setPeriodsPerTeam(prev => ({
                      ...prev,
                      [teamId]: [...(prev[teamId] || []), { id: newPeriodId, duration: 20 }]
                    }));

                    // Set the performance category for the new period
                    setPerformanceCategories(prev => ({
                      ...prev,
                      [`${newPeriodId}-${teamId}`]: lastCategory
                    }));
                  }} 
                  variant="outline"
                >
                  Add Period
                </Button>
              </div>

              <div className="flex flex-col space-y-6">
                {teamPeriods.map((period) => (
                  <Card key={period.id} className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3"
                      onClick={() => handleDeletePeriod(teamId, period.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-center">
                        <CardTitle>Period {period.id.split('-')[1]}</CardTitle>
                        <Select
                          value={performanceCategories[`${period.id}-${teamId}`] || "MESSI"}
                          onValueChange={(value) => handlePerformanceCategoryChange(period.id, teamId, value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MESSI">Messi</SelectItem>
                            <SelectItem value="RONALDO">Ronaldo</SelectItem>
                            <SelectItem value="JAGS">Jags</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="min-h-[500px]">
                        <FormationSelector
                          format={fixture.format as "7-a-side"}
                          teamName={fixture.team_name}
                          onSelectionChange={(teamSelections) => 
                            handleTeamSelectionChange(period.id, teamId, teamSelections)
                          }
                          selectedPlayers={selectedPlayers}
                          availablePlayers={availablePlayers}
                          initialSelections={selections[period.id]?.[teamId]}
                          performanceCategory={performanceCategories[`${period.id}-${teamId}`]}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
