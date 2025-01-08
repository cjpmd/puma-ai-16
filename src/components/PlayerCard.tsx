import { Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePlayersStore } from "@/store/players";
import { motion } from "framer-motion";

interface PlayerCardProps {
  player: Player;
  onSelect: (player: Player) => void;
}

export const PlayerCard = ({ player, onSelect }: PlayerCardProps) => {
  const deletePlayer = usePlayersStore((state) => state.deletePlayer);

  const averageAttribute = (category: string) => {
    const categoryAttributes = player.attributes.filter((attr) => attr.category === category);
    const sum = categoryAttributes.reduce((acc, curr) => acc + curr.value, 0);
    return (sum / categoryAttributes.length).toFixed(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">#{player.squadNumber}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700"
            onClick={() => deletePlayer(player.id)}
          >
            Delete
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{player.name}</h3>
              <p className="text-sm text-muted-foreground">Age: {player.age}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Goalkeeping</p>
                <p className="font-medium">{averageAttribute("GOALKEEPING")}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Technical</p>
                <p className="font-medium">{averageAttribute("TECHNICAL")}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Mental</p>
                <p className="font-medium">{averageAttribute("MENTAL")}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Physical</p>
                <p className="font-medium">{averageAttribute("PHYSICAL")}</p>
              </div>
            </div>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => onSelect(player)}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};