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
  positions: Array<{
    position: string;
    playerId: string;
  }>;
  substitutes: Array<{
    playerId: string;
  }>;
}

interface EventTeam {
  id: string;
  team_name: string;
  category: string;
}

interface EventData {
  id: string;
  date: string;
  time?: string;
  location?: string;
  format: string;
  number_of_teams: number;
  event_type: 'festival' | 'tournament';
  festival_teams?: EventTeam[];
  tournament_teams?: EventTeam[];
}

export const TeamSelectionManager = ({ fixtureId }: TeamSelectionManagerProps) => {
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(0);
  const [showFormation, setShowFormation] = useState(false);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [captain, setCaptain] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch event details (festival or tournament)
  const { data: eventData } = useQuery<EventData>({
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
        return { ...festivalData, event_type: 'festival' as const };
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
        return { ...tournamentData, event_type: 'tournament' as const };
      }

      return null;
    },
  });

  const teams = eventData?.event_type === 'festival' ? eventData.festival_teams : eventData?.tournament_teams;
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
      positions: [],
      substitutes: []
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

      const tableName = eventData.event_type === 'festival' ? 'festival_team_players' : 'tournament_team_players';
      const teamIdField = eventData.event_type === 'festival' ? 'festival_team_id' : 'tournament_team_id';

      // Delete existing selections for this team
      await supabase
        .from(tableName)
        .delete()
        .eq(teamIdField, currentTeam.id);

      // Insert new selections
      const selections = periods.flatMap((period) =>
        period.positions?.map((pos) => ({
          [teamIdField]: currentTeam.id,
          player_id: pos.playerId,
          position: pos.position,
          is_substitute: false,
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
              showFormation={showFormation}
              onAddPeriod={handleAddPeriod}
              onSave={saveTeamSelection}
              isSaving={isSaving}
              onPrint={() => window.print()}
              playerCategories={[currentTeam?.category || '']}
              selectedCategory={currentTeam?.category || ''}
              onCategoryChange={() => {}} // Category is fixed per team
            />

            {showFormation && (
              <FormationView
                positions={periods[0]?.positions || []}
                players={playersData || []}
                periodNumber={1}
                duration={periods[0]?.durationMinutes || 20}
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
                    opponent: `${eventData.event_type === 'festival' ? 'Festival' : 'Tournament'} at ${eventData.location || 'TBD'}`,
                    time: eventData.time || null,
                    location: eventData.location || null
                  }}
                  periods={periods.map(p => ({
                    id: p.id,
                    start_minute: p.startMinute,
                    duration_minutes: p.durationMinutes
                  }))}
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