import { Player, Attribute } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { usePlayersStore } from "@/store/players";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface PlayerDetailsProps {
  player: Player;
}

export const PlayerDetails = ({ player }: PlayerDetailsProps) => {
  const updateAttribute = usePlayersStore((state) => state.updateAttribute);
  const updateMultiplier = usePlayersStore((state) => state.updateMultiplier);

  const renderAttributeSection = (category: string, attributes: Attribute[]) => (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{category}</h3>
      <div className="space-y-6">
        {attributes.map((attr) => (
          <div key={attr.name} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{attr.name}</span>
              <div className="flex items-center gap-2">
                {player.playerCategory === "RONALDO" && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Multiplier:</span>
                    <Input
                      type="number"
                      value={attr.multiplier}
                      onChange={(e) => updateMultiplier(player.id, attr.name, parseFloat(e.target.value))}
                      className="w-20"
                      step="0.1"
                      min="0.1"
                      max="2"
                    />
                  </div>
                )}
                <span className="text-sm text-muted-foreground">
                  {attr.value}/20 {player.playerCategory === "RONALDO" && `(${(attr.value * attr.multiplier).toFixed(1)} adjusted)`}
                </span>
              </div>
            </div>
            <Slider
              value={[attr.value]}
              min={1}
              max={20}
              step={1}
              onValueChange={(value) => updateAttribute(player.id, attr.name, value[0])}
            />
            {player.attributeHistory[attr.name]?.length > 1 && (
              <div className="h-32 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={player.attributeHistory[attr.name].map((h) => ({
                      date: format(new Date(h.date), "MMM d"),
                      value: h.value,
                      adjustedValue: player.playerCategory === "RONALDO" ? h.value * attr.multiplier : h.value,
                    }))}
                    margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                  >
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 20]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#4ADE80"
                      strokeWidth={2}
                      dot={false}
                    />
                    {player.playerCategory === "RONALDO" && (
                      <Line
                        type="monotone"
                        dataKey="adjustedValue"
                        stroke="#F87171"
                        strokeWidth={2}
                        dot={false}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

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
              <div key={category}>
                {renderAttributeSection(
                  category,
                  player.attributes.filter((attr) => attr.category === category)
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};