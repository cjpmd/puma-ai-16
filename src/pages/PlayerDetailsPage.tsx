import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PlayerDetails } from "@/components/PlayerDetails";
import { useQuery } from "@tanstack/react-query";
import { ParentDetailsDialog } from "@/components/parents/ParentDetailsDialog";
import { Player } from "@/types/player";

const PlayerDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<Player | null>(null);

  // Query for player details, attributes, and attribute history
  const { data: playerData } = useQuery({
    queryKey: ["player-with-attributes", id],
    queryFn: async () => {
      // Fetch player details
      const { data: playerResult, error: playerError } = await supabase
        .from("players")
        .select(`
          *,
          attributes:player_attributes(*)
        `)
        .eq("id", id)
        .single();

      if (playerError) throw playerError;

      // Fetch attribute history
      const { data: historyData, error: historyError } = await supabase
        .from("player_attributes")
        .select("*")
        .eq("player_id", id)
        .order("created_at", { ascending: true });

      if (historyError) throw historyError;

      // Transform history data into the required format
      const attributeHistory: Record<string, { date: string; value: number }[]> = {};
      historyData?.forEach((attr) => {
        if (!attributeHistory[attr.name]) {
          attributeHistory[attr.name] = [];
        }
        attributeHistory[attr.name].push({
          date: attr.created_at,
          value: attr.value,
        });
      });

      // Transform the player data to match the Player type
      const transformedPlayer: Player = {
        id: playerResult.id,
        name: playerResult.name,
        age: playerResult.age,
        dateOfBirth: playerResult.date_of_birth,
        squadNumber: playerResult.squad_number,
        playerCategory: playerResult.player_category,
        playerType: playerResult.player_type,
        attributes: playerResult.attributes.map((attr: any) => ({
          id: attr.id,
          name: attr.name,
          value: attr.value,
          category: attr.category,
        })),
        attributeHistory,
        created_at: playerResult.created_at,
        updated_at: playerResult.updated_at,
      };

      return transformedPlayer;
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