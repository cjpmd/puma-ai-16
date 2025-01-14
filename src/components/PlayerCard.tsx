import { Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        .maybeSingle();

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
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: gameDetails } = useQuery({
    queryKey: ["player-game-details", player.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixture_player_positions")
        .select(`
          *,
          fixtures:fixture_id (
            date,
            opponent
          ),
          fixture_playing_periods:period_id (
            duration_minutes
          )
        `)
        .eq("player_id", player.id)
        .order("created_at", { ascending: false });

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

  // Calculate position minutes
  const positionMinutes: Record<string, number> = {};
  if (gameDetails) {
    gameDetails.forEach((detail) => {
      const minutes = detail.fixture_playing_periods?.duration_minutes || 0;
      if (detail.position) {
        positionMinutes[detail.position] = (positionMinutes[detail.position] || 0) + minutes;
      }
    });
  }

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
              <p className="text-xl font-bold">
                {calculateCategoryAverage("TECHNICAL")}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Mental</span>
              <p className="text-xl font-bold">
                {calculateCategoryAverage("MENTAL")}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Physical</span>
              <p className="text-xl font-bold">
                {calculateCategoryAverage("PHYSICAL")}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Goalkeeping</span>
              <p className="text-xl font-bold">
                {calculateCategoryAverage("GOALKEEPING")}
              </p>
            </div>
          </div>

          {/* Game Metrics Section */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Game Metrics</h3>
            <ScrollArea className="h-[200px]">
              <div className="space-y-4">
                {fixtureStats && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Appearances:</span>
                      <Badge variant="outline" className="bg-blue-500/10">
                        {fixtureStats.total_appearances || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Captain Appearances:</span>
                      <Badge variant="outline" className="bg-amber-500/10">
                        {fixtureStats.captain_appearances || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Minutes:</span>
                      <Badge variant="outline" className="bg-green-500/10">
                        {fixtureStats.total_minutes_played || 0}
                      </Badge>
                    </div>
                  </div>
                )}

                {Object.entries(positionMinutes).length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Minutes by Position:</div>
                    {Object.entries(positionMinutes).map(([position, minutes]) => (
                      <div key={position} className="flex justify-between text-sm">
                        <span>{position}:</span>
                        <Badge variant="outline" className="bg-purple-500/10">
                          {minutes} mins
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {gameDetails && gameDetails.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Recent Games:</div>
                    {gameDetails.slice(0, 3).map((game) => (
                      <div key={game.id} className="text-sm flex justify-between items-center">
                        <span>
                          vs {game.fixtures?.opponent} ({game.position})
                        </span>
                        <Badge variant="outline" className="bg-blue-500/10">
                          {game.fixture_playing_periods?.duration_minutes || 0} mins
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
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
        </div>
      </CardContent>
    </Card>
  );
};