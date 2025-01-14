import { Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
}

const calculateAverageChange = (attributes: any[], attributeHistory: any) => {
  let totalChange = 0;
  let count = 0;

  attributes.forEach((attr) => {
    const history = attributeHistory[attr.name];
    if (history && history.length > 1) {
      const currentValue = attr.value;
      const previousValue = history[history.length - 2].value;
      totalChange += currentValue - previousValue;
      count++;
    }
  });

  return count > 0 ? totalChange / count : 0;
};

const getPerformanceStatus = (change: number) => {
  if (change > 0) return { label: "Improving", color: "bg-green-500" };
  if (change < 0) return { label: "Needs Improvement", color: "bg-amber-500" };
  return { label: "Maintaining", color: "bg-blue-500" };
};

export const PlayerCard = ({ player, onClick }: PlayerCardProps) => {
  const { data: playerStats } = useQuery({
    queryKey: ["player-stats", player.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_stats")
        .select("*")
        .eq("player_id", player.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: fixtureStats } = useQuery({
    queryKey: ["player-fixture-stats", player.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_fixture_stats")
        .select("*")
        .eq("player_id", player.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const averageChange = calculateAverageChange(player.attributes, player.attributeHistory);
  const performance = getPerformanceStatus(averageChange);

  const calculateCategoryAverage = (category: string) => {
    const categoryAttributes = player.attributes.filter(
      (attr) => attr.category === category
    );
    if (categoryAttributes.length === 0) return 0;
    const sum = categoryAttributes.reduce((acc, curr) => acc + curr.value, 0);
    return (sum / categoryAttributes.length).toFixed(1);
  };

  return (
    <Card className="hover:bg-accent cursor-pointer" onClick={onClick}>
      <CardHeader>
        <CardTitle className="text-xl">
          {player.name} - #{player.squadNumber}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Current Performance</span>
            <Badge className={performance.color}>{performance.label}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Technical</span>
              <p className={`text-xl font-bold ${performance.color}`}>
                {calculateCategoryAverage("TECHNICAL")}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Mental</span>
              <p className={`text-xl font-bold ${performance.color}`}>
                {calculateCategoryAverage("MENTAL")}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Physical</span>
              <p className={`text-xl font-bold ${performance.color}`}>
                {calculateCategoryAverage("PHYSICAL")}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Goalkeeping</span>
              <p className={`text-xl font-bold ${performance.color}`}>
                {calculateCategoryAverage("GOALKEEPING")}
              </p>
            </div>
          </div>
          {playerStats && (
            <div className="border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>Objectives:</span>
                <div className="space-x-2">
                  <Badge variant="outline" className="bg-green-500/10">
                    Complete: {playerStats.completed_objectives || 0}
                  </Badge>
                  <Badge variant="outline" className="bg-amber-500/10">
                    Improving: {playerStats.improving_objectives || 0}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-500/10">
                    Ongoing: {playerStats.ongoing_objectives || 0}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          {fixtureStats && (
            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Appearances:</span>
                  <Badge variant="outline" className="bg-blue-500/10">
                    {fixtureStats.total_appearances || 0}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Captain:</span>
                  <Badge variant="outline" className="bg-amber-500/10">
                    {fixtureStats.captain_appearances || 0}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Minutes Played:</span>
                  <Badge variant="outline" className="bg-green-500/10">
                    {fixtureStats.total_minutes_played || 0}
                  </Badge>
                </div>
                {fixtureStats.positions_played && (
                  <div className="flex justify-between text-sm items-start">
                    <span>Positions:</span>
                    <div className="flex flex-wrap justify-end gap-1 max-w-[60%]">
                      {(fixtureStats.positions_played as string[]).map((position, index) => (
                        <Badge key={index} variant="outline" className="bg-purple-500/10">
                          {position}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};