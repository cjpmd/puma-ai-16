
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerHeader } from "@/components/player/PlayerHeader";
import { PlayerAttributes } from "@/components/player/PlayerAttributes";
import { GameMetricsSection } from "@/components/player/GameMetricsSection";
import { AttributeTrends } from "@/components/analytics/AttributeTrends";
import { ParentDetails } from "@/components/player/ParentDetails";
import { Player } from "@/types/player";
import { PlayerObjectives } from "@/components/coaching/PlayerObjectives";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PlayerDetailsProps {
  player: Player;
  onPlayerUpdated?: () => void;
}

export const PlayerDetails = ({ player, onPlayerUpdated }: PlayerDetailsProps) => {
  const [showAttributeVisuals, setShowAttributeVisuals] = useState(true);

  // Query for player position suitability
  const { data: positionsData } = useQuery({
    queryKey: ["player-positions", player.id],
    queryFn: async () => {
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

      if (error) throw error;
      return data;
    },
  });

  // Query for parents data
  const { data: parentsData } = useQuery({
    queryKey: ["player-parents", player.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_parents")
        .select("*")
        .eq("player_id", player.id);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <PlayerHeader 
        player={player} 
        topPositions={positionsData} 
        showAttributeVisuals={showAttributeVisuals}
        onPlayerUpdated={onPlayerUpdated}
      />

      <Tabs defaultValue="attributes" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="attributes" className="flex-1">Attributes</TabsTrigger>
          <TabsTrigger value="objectives" className="flex-1">Objectives</TabsTrigger>
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
          {player.attributeHistory && <AttributeTrends attributeHistory={player.attributeHistory} />}
        </TabsContent>
        
        <TabsContent value="parents">
          <ParentDetails playerId={player.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
