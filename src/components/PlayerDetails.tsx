import { Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlayersStore } from "@/store/players";
import { motion } from "framer-motion";
import { AttributeSection } from "./AttributeSection";
import { CoachingComments } from "./coaching/CoachingComments";
import { PlayerObjectives } from "./coaching/PlayerObjectives";

interface PlayerDetailsProps {
  player: Player;
}

export const PlayerDetails = ({ player }: PlayerDetailsProps) => {
  const updateAttribute = usePlayersStore((state) => state.updateAttribute);
  const globalMultiplier = usePlayersStore((state) => state.globalMultiplier);

  const handleUpdateAttribute = (name: string, value: number) => {
    updateAttribute(player.id, name, value);
  };

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
            {["GOALKEEPING", "TECHNICAL", "MENTAL", "PHYSICAL"].map((category) => (
              <AttributeSection
                key={category}
                category={category}
                attributes={player.attributes.filter((attr) => attr.category === category)}
                attributeHistory={player.attributeHistory}
                onUpdateAttribute={handleUpdateAttribute}
                playerCategory={player.playerCategory}
                globalMultiplier={globalMultiplier}
                playerId={player.id}
              />
            ))}
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