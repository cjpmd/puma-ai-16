import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PlayerDetails } from "@/components/PlayerDetails";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Player } from "@/types/player";

const PlayerDetailsPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: player, isLoading } = useQuery({
    queryKey: ["player", id],
    queryFn: async () => {
      if (!id) throw new Error("No player ID provided");

      const { data, error } = await supabase
        .from("players")
        .select(`
          *,
          player_attributes (*)
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching player:", error);
        throw error;
      }

      if (!data) throw new Error("Player not found");

      console.log("Raw player data:", data);

      return {
        id: data.id,
        name: data.name,
        age: data.age,
        dateOfBirth: data.date_of_birth,
        squadNumber: data.squad_number,
        playerCategory: data.player_category,
        playerType: data.player_type || "OUTFIELD",
        attributes: data.player_attributes.map((attr: any) => ({
          id: attr.id,
          name: attr.name,
          value: attr.value,
          category: attr.category,
          player_id: attr.player_id,
          created_at: attr.created_at,
        })),
        attributeHistory: {},
        created_at: data.created_at,
        updated_at: data.updated_at,
      } as Player;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (!player) {
    return <div className="container mx-auto p-6">Player not found</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto space-y-8"
      >
        <div className="flex items-center gap-4">
          <Link to="/squad">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-4xl font-bold">Player Details</h1>
        </div>

        <PlayerDetails player={player} />
      </motion.div>
    </div>
  );
};

export default PlayerDetailsPage;