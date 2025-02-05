import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormationSelector } from "@/components/FormationSelector";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import type { Fixture } from "@/types/fixture";

interface TeamSelectionManagerProps {
  fixture: Fixture | null;
}

export const TeamSelectionManager = ({ fixture }: TeamSelectionManagerProps) => {
  const { toast } = useToast();
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [periods, setPeriods] = useState<Array<{ id: string; duration: number }>>([
    { id: "period-1", duration: 20 }
  ]);
  const [activeTeam, setActiveTeam] = useState<string>("1");
  const [activePeriod, setActivePeriod] = useState<string>("period-1");
  const [selections, setSelections] = useState<Record<string, Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: availablePlayers } = useQuery({
    queryKey: ["available-players"],
    queryFn: async () => {
      console.log("Fetching all players");
      const { data, error } = await supabase
        .from("players")
        .select("id, name, squad_number")
        .order('name');
      
      if (error) {
        console.error("Error fetching players:", error);
        throw error;
      }
      console.log("Fetched players:", data);
      return data || [];
    },
  });

  const handleSelectionChange = (teamSelections: Record<string, { playerId: string; position: string; performanceCategory?: string }>) => {
    setSelections(prev => ({
      ...prev,
      [activePeriod]: {
        ...prev[activePeriod],
        [activeTeam]: teamSelections
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
    setSelectedPlayers(newSelectedPlayers);
  };

  const handleSave = async () => {
    if (!fixture) return;

    try {
      setIsSaving(true);

      // First, create or get the period records
      const periodPromises = periods.map(async (period) => {
        const periodNumber = parseInt(period.id.split('-')[1]);
        const { data, error } = await supabase
          .from('event_periods')
          .upsert({
            event_id: fixture.id,
            event_type: 'FIXTURE',
            period_number: periodNumber,
            duration_minutes: period.duration
          }, {
            onConflict: 'event_id,event_type,period_number'
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      });

      const periodRecords = await Promise.all(periodPromises);

      // Delete existing selections
      await supabase
        .from("team_selections")
        .delete()
        .match({
          event_id: fixture.id,
          event_type: 'FIXTURE'
        });

      // Prepare all selections for insertion, filtering out unassigned players
      const allSelections = Object.entries(selections).flatMap(([periodKey, periodSelections]) =>
        Object.entries(periodSelections).flatMap(([teamNumber, teamSelections]) =>
          Object.entries(teamSelections)
            .filter(([_, selection]) => selection.playerId !== "unassigned") // Filter out unassigned players
            .map(([_, selection]) => {
              const periodNumber = parseInt(periodKey.split('-')[1]);
              const currentPeriodId = periodRecords.find(p => p.period_number === periodNumber)?.id;
              
              return {
                event_id: fixture.id,
                event_type: 'FIXTURE',
                team_number: parseInt(teamNumber),
                player_id: selection.playerId,
                position: selection.position,
                period_id: currentPeriodId,
                performance_category: selection.performanceCategory || 'MESSI'
              };
            })
        )
      );

      // Insert new selections only if there are valid selections
      if (allSelections.length > 0) {
        const { error } = await supabase
          .from("team_selections")
          .insert(allSelections);

        if (error) throw error;
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Selection - {fixture.opponent}</h2>
        <div className="space-x-2">
          <Button onClick={() => {
            const newPeriodId = `period-${periods.length + 1}`;
            setPeriods([...periods, { id: newPeriodId, duration: 20 }]);
            setActivePeriod(newPeriodId);
          }} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Period
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            variant="default"
          >
            {isSaving ? 'Saving...' : 'Save Selections'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="period-1" value={activePeriod} onValueChange={setActivePeriod}>
        <TabsList>
          {periods.map((period) => (
            <TabsTrigger key={period.id} value={period.id}>
              Period {period.id.split('-')[1]}
            </TabsTrigger>
          ))}
        </TabsList>

        {periods.map((period) => (
          <TabsContent key={period.id} value={period.id}>
            <Tabs defaultValue="1" value={activeTeam} onValueChange={setActiveTeam}>
              <TabsList>
                {Array.from({ length: fixture.number_of_teams || 1 }).map((_, index) => (
                  <TabsTrigger key={index + 1} value={(index + 1).toString()}>
                    Team {index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Array.from({ length: fixture.number_of_teams || 1 }).map((_, index) => (
                <TabsContent key={index + 1} value={(index + 1).toString()}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{fixture.team_name} - Team {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormationSelector
                        format={fixture.format as "7-a-side"}
                        teamName={fixture.team_name}
                        onSelectionChange={(teamSelections) => handleSelectionChange(teamSelections)}
                        selectedPlayers={selectedPlayers}
                        availablePlayers={availablePlayers}
                        initialSelections={selections[activePeriod]?.[activeTeam]}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};