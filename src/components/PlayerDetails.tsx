import { Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlayersStore } from "@/store/players";
import { motion } from "framer-motion";
import { AttributeSection } from "./AttributeSection";
import { CoachingComments } from "./coaching/CoachingComments";
import { PlayerObjectives } from "./coaching/PlayerObjectives";
import { RadarChart } from "./analytics/RadarChart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "./ui/badge";

interface PlayerDetailsProps {
  player: Player;
}

export const PlayerDetails = ({ player }: PlayerDetailsProps) => {
  const updateAttribute = usePlayersStore((state) => state.updateAttribute);

  const { data: attributeHistory } = useQuery({
    queryKey: ["attribute-history", player.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_attributes")
        .select("*")
        .eq("player_id", player.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

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

  const { data: topPositions } = useQuery({
    queryKey: ["top-positions", player.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('position_suitability')
        .select(`
          suitability_score,
          position_definitions (
            abbreviation,
            full_name
          )
        `)
        .eq('player_id', player.id)
        .order('suitability_score', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  const handleUpdateAttribute = (name: string, value: number) => {
    updateAttribute(player.id, name, value);
  };

  const calculateCategoryAverage = (category: string) => {
    const categoryAttributes = player.attributes.filter(
      (attr) => attr.category === category
    );
    if (categoryAttributes.length === 0) return 0;
    const sum = categoryAttributes.reduce((acc, curr) => acc + curr.value, 0);
    return (sum / categoryAttributes.length).toFixed(1);
  };

  const getRadarData = (category: string) => {
    return player.attributes
      .filter((attr) => attr.category === category)
      .map((attr) => ({
        name: attr.name,
        value: attr.value,
      }));
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
          <div className="flex justify-between items-start">
            <CardTitle>
              {player.name} - #{player.squadNumber} ({player.playerCategory})
            </CardTitle>
            {topPositions && (
              <div className="flex gap-2">
                {topPositions.map((pos: any) => (
                  <Badge key={pos.position_definitions.abbreviation} variant="outline">
                    {pos.position_definitions.abbreviation} ({pos.suitability_score.toFixed(1)})
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {categories.map((category) => {
              const categoryAttributes = player.attributes.filter(
                (attr) => attr.category === category
              );
              
              if (categoryAttributes.length > 0) {
                return (
                  <AttributeSection
                    key={category}
                    category={`${category} (${calculateCategoryAverage(category)})`}
                    attributes={categoryAttributes}
                    attributeHistory={attributeHistory || {}}
                    onUpdateAttribute={handleUpdateAttribute}
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

      <div className="grid gap-6 md:grid-cols-2">
        {categories.map((category) => {
          const radarData = getRadarData(category);
          if (radarData.length > 0) {
            return (
              <Card key={category}>
                <CardContent className="pt-6">
                  <RadarChart data={radarData} title={category} />
                </CardContent>
              </Card>
            );
          }
          return null;
        })}
      </div>
    </motion.div>
  );
};