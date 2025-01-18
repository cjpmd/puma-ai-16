import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PlayerHeader } from "@/components/player/PlayerHeader";
import { PlayerAttributes } from "@/components/player/PlayerAttributes";
import { GameMetrics } from "@/components/player/GameMetrics";
import { CoachingComments } from "@/components/coaching/CoachingComments";
import { PlayerObjectives } from "@/components/coaching/PlayerObjectives";
import { ParentDetails } from "@/components/player/ParentDetails";

const PlayerDetailsPage = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      if (!id) return;
      const { data } = await supabase
        .from("players")
        .select("*")
        .eq("id", id)
        .single();
      setPlayer(data);
    };
    fetchPlayer();
  }, [id]);

  if (!player || !id) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PlayerHeader player={player} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <PlayerAttributes playerId={id} />
          <ParentDetails playerId={id} />
        </div>
        <div className="space-y-6">
          <GameMetrics playerId={id} />
          <PlayerObjectives playerId={id} />
          <CoachingComments playerId={id} />
        </div>
      </div>
    </div>
  );
};

export default PlayerDetailsPage;