import { Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlayersStore } from "@/store/players";
import { motion } from "framer-motion";
import { AttributeSection } from "./AttributeSection";
import { CoachingComments } from "./coaching/CoachingComments";
import { PlayerObjectives } from "./coaching/PlayerObjectives";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PlayerDetailsProps {
  player: Player;
}

export const PlayerDetails = ({ player }: PlayerDetailsProps) => {
  const updateAttribute = usePlayersStore((state) => state.updateAttribute);
  const globalMultiplier = usePlayersStore((state) => state.globalMultiplier);

  const { data: attributeHistory } = useQuery({
    queryKey: ["attribute-history", player.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_attributes")
        .select("*")
        .eq("player_id", player.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group attributes by name for history tracking
      const history: Record<string, { date: string; value: number }[]> = {};
      data.forEach((attr) => {
        if (!history[attr.name]) {
          history[attr.name] = [];
        }
        history[attr.name].push({
          date: attr.created_at,
          value: attr.value,
        });
      });

      return history;
    },
  });

  const handleUpdateAttribute = (name: string, value: number) => {
    updateAttribute(player.id, name, value);
  };

  const categories = ["TECHNICAL", "MENTAL", "PHYSICAL", "GOALKEEPING"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>
            {player.name} - #{player.squadNumber} ({player.playerCategory})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {categories.map((category) => {
              const categoryAttributes = player.attributes.filter(
                (attr) => attr.category === category
              );
              
              // Only render section if there are attributes
              if (categoryAttributes.length > 0) {
                return (
                  <AttributeSection
                    key={category}
                    category={category}
                    attributes={categoryAttributes}
                    attributeHistory={attributeHistory || {}}
                    onUpdateAttribute={handleUpdateAttribute}
                    playerCategory={player.playerCategory}
                    globalMultiplier={globalMultiplier}
                    playerId={player.id}
                  />
                );
              }
              return null;
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <PlayerObjectives playerId={player.id} />
        <CoachingComments playerId={player.id} />
      </div>
    </motion.div>
  );
};