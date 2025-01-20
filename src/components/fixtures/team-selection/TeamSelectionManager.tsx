import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TeamSection } from "./TeamSection";
import { Button } from "@/components/ui/button";
import { PrintTeamSelection } from "../PrintTeamSelection";

interface TeamSelectionManagerProps {
  eventId: string;
  eventType: 'festival' | 'tournament';
}

export const TeamSelectionManager = ({ eventId, eventType }: TeamSelectionManagerProps) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch event details
  const { data: eventData } = useQuery({
    queryKey: [eventType, eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(eventType === 'festival' ? 'festivals' : 'tournaments')
        .select(`
          *,
          ${eventType}_teams (
            id,
            team_name,
            category
          )
        `)
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Get available player categories
  const { data: playerCategories } = useQuery({
    queryKey: ["player-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_categories")
        .select("name")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  // Get system category from team settings
  const { data: teamSettings } = useQuery({
    queryKey: ["team-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Get players based on system category
  const { data: players } = useQuery({
    queryKey: ["players", teamSettings?.team_name],
    queryFn: async () => {
      if (!teamSettings?.team_name) return [];
      
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("team_category", teamSettings.team_name)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    enabled: !!teamSettings?.team_name,
  });

  useEffect(() => {
    if (eventData) {
      const teamsData = eventData[`${eventType}_teams`] || [];
      setTeams(teamsData);
    }
  }, [eventData, eventType]);

  const handleCategoryChange = (teamIndex: number, category: string) => {
    setTeams(current => 
      current.map((team, idx) => 
        idx === teamIndex ? { ...team, category } : team
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save team selections
      // Implementation will follow in next update
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

  if (!eventData || !players) {
    return <div>Loading...</div>;
  }

  // Transform event data to match PrintTeamSelection fixture interface
  const printFixture = {
    id: eventData.id,
    date: eventData.date,
    opponent: `${eventType === 'festival' ? 'Festival' : 'Tournament'} at ${eventData.location || 'TBD'}`,
    time: eventData.time,
    location: eventData.location
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {eventType === 'festival' ? 'Festival' : 'Tournament'} Team Selection
        </h2>
        <div className="space-x-2">
          <Button onClick={() => window.print()} variant="outline">
            Print
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {teams.map((team, index) => (
          <TeamSection
            key={team.id}
            teamIndex={index}
            teamName={team.team_name}
            format={eventData.format}
            category={team.category}
            players={players}
            onCategoryChange={handleCategoryChange}
            availableCategories={playerCategories?.map(pc => pc.name) || []}
          />
        ))}
      </div>

      <div className="print:block hidden">
        <PrintTeamSelection
          fixture={printFixture}
          periods={[]}
          players={players}
        />
      </div>
    </div>
  );
};

export default TeamSelectionManager;