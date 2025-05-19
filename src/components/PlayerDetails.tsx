
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerCardHeader } from "@/components/player/PlayerCardHeader";
import { PlayerAttributes } from "@/components/player/PlayerAttributes";
import { GameMetricsSection } from "@/components/player/GameMetricsSection";
import { AttributeTrends } from "@/components/analytics/AttributeTrends";
import { ParentDetails } from "@/components/player/ParentDetails";
import { Player } from "@/types/player";
import { PlayerObjectives } from "@/components/coaching/PlayerObjectives";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CoachingComments } from "@/components/coaching/CoachingComments";
import { columnExists } from "@/utils/database";
import { useToast } from "@/hooks/use-toast";

interface PlayerDetailsProps {
  player: Player;
  onPlayerUpdated?: () => void;
}

export const PlayerDetails = ({ player, onPlayerUpdated }: PlayerDetailsProps) => {
  const [showAttributeVisuals, setShowAttributeVisuals] = useState(true);
  const [hasCheckedSchema, setHasCheckedSchema] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key to force re-renders
  const { toast } = useToast();

  // Query for player position suitability
  const { data: positionsData, refetch: refetchPositions } = useQuery({
    queryKey: ["player-positions", player.id, refreshKey],
    queryFn: async () => {
      console.log("Fetching player positions for:", player.id);
      const { data, error } = await supabase
        .from("role_suitability")
        .select(`
          suitability_score,
          role_definitions (
            abbreviation,
            full_name
          )
        `)
        .eq("player_id", player.id)
        .order("suitability_score", { ascending: false });

      if (error) {
        console.error("Error fetching positions:", error);
        throw error;
      }
      console.log("Fetched positions data:", data);
      return data;
    },
  });

  // Query for parents data
  const { data: parentsData, refetch: refetchParents } = useQuery({
    queryKey: ["player-parents", player.id, refreshKey],
    queryFn: async () => {
      console.log("Fetching player parents for:", player.id);
      const { data, error } = await supabase
        .from("player_parents")
        .select("*")
        .eq("player_id", player.id);

      if (error) {
        console.error("Error fetching parents:", error);
        throw error;
      }
      console.log("Fetched parents data:", data?.length || 0, "parents");
      return data;
    },
  });

  useEffect(() => {
    // Check if necessary columns exist and update config
    const checkSchema = async () => {
      if (hasCheckedSchema) return;

      try {
        console.log("Checking and updating database schema...");
        
        // Check if profile_image column exists
        const profileImageExists = await columnExists('players', 'profile_image');
        console.log(`profile_image column exists: ${profileImageExists}`);
        
        if (!profileImageExists) {
          console.log("Profile image column does not exist");
          // We'll handle UI limitations based on the check at render time
        }
        
        setHasCheckedSchema(true);
      } catch (error) {
        console.error("Error checking schema:", error);
        toast({
          title: "Database Warning",
          description: "Could not verify database schema. Some features may be limited.",
          variant: "destructive",
        });
        
        setHasCheckedSchema(true); // Set to true anyway to avoid repeated checks
      }
    };
    
    checkSchema();
  }, [hasCheckedSchema, toast]);

  const handleLocalUpdate = () => {
    console.log("Local update triggered, refreshing queries");
    // Update the refresh key to force React Query to refetch
    setRefreshKey(prevKey => prevKey + 1);
    
    // Explicitly refetch all queries
    refetchPositions();
    refetchParents();
    
    // Call parent callback if provided
    if (onPlayerUpdated) {
      onPlayerUpdated();
    }
  };

  return (
    <div className="space-y-6">
      <PlayerCardHeader 
        player={player} 
        name={player.name}
        squadNumber={player.squadNumber || 0}
        playerType={player.playerType}
        topPositions={(positionsData || []).map((pos: any) => [pos.role_definitions.abbreviation, pos.suitability_score] as [string, number]).slice(0, 3)}
        onEdit={() => {}}
        onDownloadReport={() => {}}
      />

      <Tabs defaultValue="attributes" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="attributes" className="flex-1">Attributes</TabsTrigger>
          <TabsTrigger value="objectives" className="flex-1">Objectives</TabsTrigger>
          <TabsTrigger value="comments" className="flex-1">Comments</TabsTrigger>
          <TabsTrigger value="stats" className="flex-1">Match Stats</TabsTrigger>
          <TabsTrigger value="trends" className="flex-1">Trends</TabsTrigger>
          <TabsTrigger value="parents" className="flex-1">Parents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="attributes">
          <PlayerAttributes 
            attributes={player.attributes} 
            playerId={player.id}
            playerType={player.playerType}
            playerCategory={player.teamCategory || ""}
          />
        </TabsContent>
        
        <TabsContent value="objectives">
          <PlayerObjectives playerId={player.id} />
        </TabsContent>
        
        <TabsContent value="comments">
          <CoachingComments playerId={player.id} />
        </TabsContent>
        
        <TabsContent value="stats">
          <GameMetricsSection 
            gameMetrics={{ 
              stats: { 
                total_appearances: 0, 
                captain_appearances: 0, 
                total_minutes_played: 0, 
                positions_played: {} 
              }, 
              recentGames: [], 
              motmCount: 0 
            }} 
            positionMappings={{}} 
            playerCategory={player.teamCategory || ""}
          />
        </TabsContent>
        
        <TabsContent value="trends">
          {player.attributeHistory && (
            <AttributeTrends attributeHistory={player.attributeHistory} />
          )}
        </TabsContent>
        
        <TabsContent value="parents">
          <ParentDetails 
            playerId={player.id} 
            key={`parent-details-${refreshKey}`} // Force refresh when refreshKey changes
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
