
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TeamSelectionProvider } from "./context/TeamSelectionContext";
import { TeamTabs } from "./components/TeamTabs";
import { TeamSections } from "./components/TeamSections";
import { SaveSelectionButton } from "./components/SaveSelectionButton";
import { Fixture } from "@/types/fixture";
import { useTeamInitialization } from "./hooks/useTeamInitialization";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface TeamSelectionManagerProps {
  fixture: Fixture | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TeamSelectionManager = ({ fixture, onSuccess, onCancel }: TeamSelectionManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);

  // Check if this fixture exists
  const fixtureExists = !!fixture?.id;

  // Fetch players for this team category
  const { data: players, isLoading: isLoadingPlayers } = useQuery({
    queryKey: ["players", fixture?.team_name],
    queryFn: async () => {
      try {
        console.log("Fetching players for team category:", fixture?.team_name);
        
        // If team_name is not provided, fetch all players
        const query = supabase
          .from("players")
          .select("*")
          .order('name');
          
        if (fixture?.team_name) {
          query.eq("team_category", fixture.team_name);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        console.log(`Fetched ${data?.length || 0} players for team selection`);
        return data || [];
      } catch (error) {
        console.error("Error fetching players:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load players",
        });
        return [];
      }
    },
    enabled: fixtureExists,
  });
  
  // Remove loading state once all queries are complete
  useEffect(() => {
    if (!isLoadingPlayers) {
      setIsLoading(false);
    }
  }, [isLoadingPlayers]);

  if (!fixture) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Fixture Selected</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please select a fixture to manage team selections.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading team data...</span>
      </div>
    );
  }

  return (
    <TeamSelectionProvider fixture={fixture}>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {fixture.opponent ? `Team Selection - ${fixture.is_home ? 'vs' : '@'} ${fixture.opponent}` : 'Team Selection'}
          </h2>
          <div className="flex gap-2">
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <SaveSelectionButton 
              onSuccess={onSuccess}
              className="min-w-[180px]"
            />
          </div>
        </div>
        
        <useTeamInitialization />
        
        <TeamTabs />
        
        <TeamSections 
          availablePlayers={players || []} 
        />
      </div>
    </TeamSelectionProvider>
  );
};
