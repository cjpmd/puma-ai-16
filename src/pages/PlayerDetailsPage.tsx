import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PlayerHeader } from "@/components/player/PlayerHeader";
import { PlayerAttributes } from "@/components/player/PlayerAttributes";
import { GameMetrics } from "@/components/player/GameMetrics";
import { CoachingComments } from "@/components/coaching/CoachingComments";
import { PlayerObjectives } from "@/components/coaching/PlayerObjectives";
import { ParentDetails } from "@/components/player/ParentDetails";
import { useQuery } from "@tanstack/react-query";

interface Player {
  id: string;
  name: string;
  squad_number: number;
  player_category: string;
  player_type: string;
}

interface Attribute {
  id: string;
  name: string;
  value: number;
}

const PlayerDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<Player | null>(null);

  // Query for player details
  const { data: playerData } = useQuery({
    queryKey: ["player", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Query for player attributes
  const { data: attributes = [] } = useQuery({
    queryKey: ["player-attributes", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_attributes")
        .select("*")
        .eq("player_id", id);

      if (error) throw error;
      return data as Attribute[];
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (playerData) {
      setPlayer(playerData);
    }
  }, [playerData]);

  if (!player || !id) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PlayerHeader 
        name={player.name}
        squadNumber={player.squad_number}
        category={player.player_category}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <PlayerAttributes 
            playerId={id}
            playerType={player.player_type}
            playerCategory={player.player_category}
            attributes={attributes}
          />
          <ParentDetails playerId={id} />
        </div>
        <div className="space-y-6">
          <GameMetrics 
            playerId={id}
          />
          <PlayerObjectives playerId={id} />
          <CoachingComments playerId={id} />
        </div>
      </div>
    </div>
  );
};

export default PlayerDetailsPage;