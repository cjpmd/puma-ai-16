import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PlayerHeader } from "@/components/player/PlayerHeader";
import { PlayerAttributes } from "@/components/player/PlayerAttributes";
import { GameMetrics } from "@/components/player/GameMetrics";
import { CoachingComments } from "@/components/coaching/CoachingComments";
import { PlayerObjectives } from "@/components/coaching/PlayerObjectives";
import { ParentDetails } from "@/components/player/ParentDetails";

interface Player {
  id: string;
  name: string;
  squad_number: number;
  player_category: string;
  player_type: string;
}

const PlayerDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<Player | null>(null);
  const [gameMetrics, setGameMetrics] = useState<any>(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      if (!id) return;
      
      const [playerResult, metricsResult] = await Promise.all([
        supabase
          .from("players")
          .select("*")
          .eq("id", id)
          .single(),
        supabase
          .from("player_fixture_stats")
          .select("*")
          .eq("player_id", id)
          .single()
      ]);

      if (playerResult.data) {
        setPlayer(playerResult.data);
      }
      if (metricsResult.data) {
        setGameMetrics(metricsResult.data);
      }
    };
    
    fetchPlayer();
  }, [id]);

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
          />
          <ParentDetails playerId={id} />
        </div>
        <div className="space-y-6">
          {gameMetrics && (
            <GameMetrics 
              stats={gameMetrics}
              motmCount={gameMetrics.motm_appearances || 0}
              recentGames={gameMetrics.fixture_history || []}
            />
          )}
          <PlayerObjectives playerId={id} />
          <CoachingComments playerId={id} />
        </div>
      </div>
    </div>
  );
};

export default PlayerDetailsPage;