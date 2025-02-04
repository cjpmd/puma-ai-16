import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormationSelector } from "@/components/FormationSelector";
import { useToast } from "@/hooks/use-toast";
import type { Fixture } from "@/types/fixture";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

interface TeamSelectionManagerProps {
  fixture: Fixture | null;
  onSave?: (selectedPlayers: string[], captainId: string | null) => void;
}

export const TeamSelectionManager = ({ fixture }: TeamSelectionManagerProps) => {
  const { toast } = useToast();
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [periods, setPeriods] = useState<Array<{ id: string; duration: number }>>([
    { id: "period-1", duration: 20 }
  ]);
  const [activeTeam, setActiveTeam] = useState<string>("1");
  const [activePeriod, setActivePeriod] = useState<string>("period-1");

  const { data: availablePlayers } = useQuery({
    queryKey: ["available-players", fixture?.team_name],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("id, name, squad_number")
        .eq("team_category", fixture?.team_name?.toUpperCase())
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!fixture,
  });

  const { data: existingSelections } = useQuery({
    queryKey: ["team-selections", fixture?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixture_team_selections")
        .select("*")
        .eq("fixture_id", fixture?.id);

      if (error) throw error;
      return data;
    },
  });

  const handleSelectionChange = async (selections: Record<string, { playerId: string; position: string; performanceCategory?: string }>) => {
    if (!fixture) return;

    try {
      // Delete existing selections for this team and period
      await supabase
        .from("fixture_team_selections")
        .delete()
        .eq("fixture_id", fixture.id)
        .eq("team_number", parseInt(activeTeam));

      // Insert new selections
      const { error } = await supabase
        .from("fixture_team_selections")
        .insert(
          Object.values(selections).map(({ playerId, position, performanceCategory }) => ({
            fixture_id: fixture.id,
            team_number: parseInt(activeTeam),
            player_id: playerId,
            position,
            performance_category: performanceCategory || 'MESSI',
            period_id: activePeriod
          }))
        );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team selection saved successfully",
      });

      setSelectedPlayers(new Set(Object.values(selections).map(s => s.playerId)));
    } catch (error) {
      console.error("Error saving team selection:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save team selection",
      });
    }
  };

  const addPeriod = () => {
    const newPeriodId = `period-${periods.length + 1}`;
    setPeriods([...periods, { id: newPeriodId, duration: 20 }]);
    setActivePeriod(newPeriodId);
  };

  if (!fixture || !availablePlayers) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Selection - {fixture.opponent}</h2>
        <Button onClick={addPeriod} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Period
        </Button>
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
                      <CardTitle>Broughty Pumas 2015s - Team {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormationSelector
                        format={fixture.format as "7-a-side"}
                        teamName="Broughty Pumas 2015s"
                        onSelectionChange={handleSelectionChange}
                        selectedPlayers={selectedPlayers}
                        availablePlayers={availablePlayers}
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