import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PlayerDetails } from "@/components/PlayerDetails";
import { useQuery } from "@tanstack/react-query";
import { ParentDetailsDialog } from "@/components/parents/ParentDetailsDialog";
import { Button } from "@/components/ui/button";

interface Player {
  id: string;
  name: string;
  age: number;
  squad_number: number;
  player_category: string;
  player_type: string;
  attributes: Array<{
    id: string;
    name: string;
    value: number;
    category: string;
  }>;
}

const PlayerDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<Player | null>(null);

  // Query for player details and attributes
  const { data: playerData } = useQuery({
    queryKey: ["player-with-attributes", id],
    queryFn: async () => {
      const { data: playerResult, error: playerError } = await supabase
        .from("players")
        .select(`
          *,
          attributes:player_attributes(*)
        `)
        .eq("id", id)
        .single();

      if (playerError) throw playerError;
      return playerResult;
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{player.name}</h1>
        <ParentDetailsDialog playerId={id} onSave={() => {}} />
      </div>
      <PlayerDetails player={player} />
    </div>
  );
};

export default PlayerDetailsPage;