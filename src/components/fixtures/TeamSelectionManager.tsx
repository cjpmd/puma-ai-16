
import { useState } from "react";
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
}

export const TeamSelectionManager = ({ fixture }: TeamSelectionManagerProps) => {
  const { toast } = useToast();
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [periods, setPeriods] = useState<Array<{ id: string; duration: number }>>([
    { id: "period-1", duration: 20 }
  ]);
  const [activeTeam, setActiveTeam] = useState<string>("1");
  const [activePeriod, setActivePeriod] = useState<string>("period-1");
  const [selections, setSelections] = useState<Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>>({});

  const { data: availablePlayers } = useQuery({
    queryKey: ["available-players", fixture?.category],
    queryFn: async () => {
      console.log("Fetching players for category:", fixture?.category);
      const { data, error } = await supabase
        .from("players")
        .select("id, name, squad_number")
        .eq("team_category", fixture?.category)
        .order('name');
      
      if (error) {
        console.error("Error fetching players:", error);
        throw error;
      }
      console.log("Fetched players:", data);
      return data || [];
    },
    enabled: !!fixture,
  });

  const handleSelectionChange = (teamSelections: Record<string, { playerId: string; position: string; performanceCategory?: string }>) => {
    setSelections(prev => ({
      ...prev,
      [activeTeam]: teamSelections
    }));
  };

  const handleSave = async () => {
    if (!fixture) return;

    try {
      // Delete existing selections
      await supabase
        .from("team_selections")
        .delete()
        .match({
          event_id: fixture.id,
          event_type: 'FIXTURE'
        });

      // Prepare all selections for insertion
      const allSelections = Object.entries(selections).flatMap(([teamNumber, teamSelections]) =>
        Object.entries(teamSelections).map(([_, selection]) => ({
          event_id: fixture.id,
          event_type: 'FIXTURE',
          team_number: parseInt(teamNumber),
          player_id: selection.playerId,
          position: selection.position,
          period_id: activePeriod,
          performance_category: selection.performanceCategory || 'MESSI'
        }))
      );

      // Insert new selections
      const { error } = await supabase
        .from("team_selections")
        .insert(allSelections);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team selections saved successfully",
      });

      // Update selected players
      const newSelectedPlayers = new Set<string>();
      Object.values(selections).forEach(teamSelection => {
        Object.values(teamSelection).forEach(selection => {
          if (selection.playerId !== "unassigned") {
            newSelectedPlayers.add(selection.playerId);
          }
        });
      });
      setSelectedPlayers(newSelectedPlayers);

    } catch (error) {
      console.error("Error saving team selections:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save team selections",
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
        <div className="space-x-2">
          <Button onClick={addPeriod} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Period
          </Button>
          <Button onClick={handleSave} variant="default">
            Save Selections
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
