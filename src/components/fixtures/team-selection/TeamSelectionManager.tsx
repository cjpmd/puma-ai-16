import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamSelectionHeader } from "./TeamSelectionHeader";
import { FormationView } from "../FormationView";
import { PrintTeamSelection } from "../PrintTeamSelection";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface TeamSelectionManagerProps {
  fixtureId: string;
  category?: string;
}

interface Period {
  id: string;
  startMinute: number;
  durationMinutes: number;
}

export const TeamSelectionManager = ({ fixtureId }: TeamSelectionManagerProps) => {
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(0);
  const [showFormation, setShowFormation] = useState(false);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [captain, setCaptain] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch event details (festival or tournament)
  const { data: eventData } = useQuery({
    queryKey: ["event", fixtureId],
    queryFn: async () => {
      // Try to fetch festival first
      const { data: festivalData } = await supabase
        .from("festivals")
        .select(`
          *,
          festival_teams (
            id,
            team_name,
            category
          )
        `)
        .eq("id", fixtureId)
        .single();

      if (festivalData) {
        return { ...festivalData, event_type: 'festival' };
      }

      // If not a festival, try tournament
      const { data: tournamentData } = await supabase
        .from("tournaments")
        .select(`
          *,
          tournament_teams (
            id,
            team_name,
            category
          )
        `)
        .eq("id", fixtureId)
        .single();

      if (tournamentData) {
        return { ...tournamentData, event_type: 'tournament' };
      }

      return null;
    },
  });

  const eventType = eventData?.event_type;
  const teams = eventType === 'festival' ? eventData?.festival_teams : eventData?.tournament_teams;
  const currentTeam = teams?.[selectedTeamIndex];
  
  // Fetch players based on current team's category
  const { data: playersData } = useQuery({
    queryKey: ["players", currentTeam?.category],
    queryFn: async () => {
      if (!currentTeam?.category) return [];
      
      const { data } = await supabase
        .from("players")
        .select("id, name, squad_number")
        .eq("player_category", currentTeam.category)
        .order("name");
      
      return data || [];
    },
    enabled: !!currentTeam?.category,
  });

  // Get number of positions based on format
  const getPositionsCount = (format: string) => {
    const formatMap: { [key: string]: number } = {
      "4-a-side": 4,
      "5-a-side": 5,
      "7-a-side": 7,
      "9-a-side": 9,
      "11-a-side": 11
    };
    return formatMap[format] || 7; // Default to 7 if format not found
  };

  const handleAddPeriod = () => {
    const newPeriod: Period = {
      id: crypto.randomUUID(),
      startMinute: 0,
      durationMinutes: 20,
    };
    setPeriods((current) => [...current, newPeriod]);
  };

  const handlePeriodChange = (
    index: number,
    field: keyof Period,
    value: number
  ) => {
    setPeriods((current) =>
      current.map((period, i) =>
        i === index ? { ...period, [field]: value } : period
      )
    );
  };

  const handleRemovePeriod = (index: number) => {
    setPeriods((current) => current.filter((_, i) => i !== index));
  };

  const saveTeamSelection = async () => {
    setIsSaving(true);
    try {
      if (!eventData || !currentTeam) return;

      const tableName = eventType === 'festival' ? 'festival_team_players' : 'tournament_team_players';
      const teamIdField = eventType === 'festival' ? 'festival_team_id' : 'tournament_team_id';

      // Delete existing selections for this team
      await supabase
        .from(tableName)
        .delete()
        .eq(teamIdField, currentTeam.id);

      // Insert new selections
      const selections = periods.flatMap((period) =>
        period.positions?.map((pos: any) => ({
          [teamIdField]: currentTeam.id,
          player_id: pos.playerId,
          position: pos.position,
          is_substitute: pos.isSubstitute || false,
        })) || []
      );

      if (selections.length > 0) {
        const { error } = await supabase.from(tableName).insert(selections);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Team selection saved successfully",
      });
    } catch (error) {
      console.error("Error saving team selection:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save team selection",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFormation = () => {
    setShowFormation(!showFormation);
  };

  if (!eventData || !teams) {
    return <div>Loading...</div>;
  }

  const positionsCount = getPositionsCount(eventData.format);

  return (
    <div className="space-y-6">
      <Tabs value={selectedTeamIndex.toString()} onValueChange={(v) => setSelectedTeamIndex(parseInt(v))}>
        <TabsList>
          {teams.map((team, index) => (
            <TabsTrigger key={team.id} value={index.toString()}>
              {team.team_name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={selectedTeamIndex.toString()}>
          <div className="space-y-6">
            <TeamSelectionHeader
              players={playersData || []}
              captain={captain}
              onCaptainChange={setCaptain}
              onShowFormationToggle={toggleFormation}
              onAddPeriod={handleAddPeriod}
              onSave={saveTeamSelection}
              isSaving={isSaving}
            />

            {showFormation && (
              <FormationView
                format={eventData.format}
                numPositions={positionsCount}
                players={playersData || []}
                periods={periods}
                onPeriodChange={handlePeriodChange}
                onRemovePeriod={handleRemovePeriod}
              />
            )}

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>

            <div className="print-only">
              {playersData && eventData && (
                <PrintTeamSelection
                  fixture={{
                    id: eventData.id,
                    date: eventData.date,
                    opponent: `${eventType === 'festival' ? 'Festival' : 'Tournament'} at ${eventData.location || 'TBD'}`,
                    time: eventData.time,
                    location: eventData.location
                  }}
                  periods={periods}
                  players={playersData}
                />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamSelectionManager;