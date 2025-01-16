import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlayersStore } from "@/store/players";
import { motion } from "framer-motion";
import { AttributeSection } from "./AttributeSection";
import { CoachingComments } from "./coaching/CoachingComments";
import { PlayerObjectives } from "./coaching/PlayerObjectives";
import { RadarChart } from "./analytics/RadarChart";
import { Badge } from "./ui/badge";
import { EditPlayerDialog } from "./EditPlayerDialog";
import { Player } from "@/types/player";
import { Button } from "./ui/button";
import { FileDown, ChevronDown, Medal, Crown, Trophy, Award } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { ScrollArea } from "./ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

interface PlayerDetailsProps {
  player: Player;
}

interface GamePosition {
  position: string;
  minutes: number;
}

interface GameData {
  id: string;
  fixture_id: string;
  fixtures: {
    date: string;
    opponent: string;
    motm_player_id?: string;
  };
  positions: Record<string, number>;
  totalMinutes: number;
  isCaptain: boolean;
  isMotm: boolean;
}

interface GameMetricsData {
  stats: {
    total_appearances: number;
    captain_appearances: number;
    total_minutes_played: number;
    positions_played: Record<string, number>;
  };
  recentGames: GameData[];
  motmCount: number;
}

export const PlayerDetails = ({ player }: PlayerDetailsProps) => {
  const updateAttribute = usePlayersStore((state) => state.updateAttribute);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Query for game metrics data
  const { data: gameMetrics } = useQuery<GameMetricsData>({
    queryKey: ["player-game-metrics", player.id],
    queryFn: async () => {
      // First get the fixture stats
      const { data: fixtureStats, error: fixtureError } = await supabase
        .from("player_fixture_stats")
        .select("*")
        .eq("player_id", player.id)
        .maybeSingle();

      // Get recent games with fixture details and all positions
      const { data: recentGames, error: gamesError } = await supabase
        .from("fixtures")
        .select(`
          id,
          date,
          opponent,
          motm_player_id,
          fixture_player_positions!inner (
            id,
            position,
            fixture_playing_periods (
              duration_minutes
            )
          )
        `)
        .eq("fixture_player_positions.player_id", player.id)
        .order("date", { ascending: false })
        .limit(5);

      // Get captain information
      const { data: captainData, error: captainError } = await supabase
        .from("fixture_team_selections")
        .select("fixture_id, is_captain")
        .eq("player_id", player.id);

      if (fixtureError || gamesError || captainError) {
        throw fixtureError || gamesError || captainError;
      }

      // Create a map of fixture_id to captain status
      const captainMap = new Map(
        captainData?.map(item => [item.fixture_id, item.is_captain]) || []
      );

      // Group positions by fixture and calculate total minutes for each position
      const transformedGames = recentGames?.reduce((acc: Record<string, any>, game) => {
        if (!acc[game.id]) {
          acc[game.id] = {
            id: game.id,
            fixture_id: game.id,
            fixtures: {
              date: game.date,
              opponent: game.opponent,
              motm_player_id: game.motm_player_id
            },
            positions: {},
            totalMinutes: 0,
            isCaptain: captainMap.get(game.id) || false,
            isMotm: game.motm_player_id === player.id
          };
        }

        // Sum up minutes for each position in this fixture
        game.fixture_player_positions.forEach((pos: any) => {
          const minutes = pos.fixture_playing_periods?.duration_minutes || 0;
          if (!acc[game.id].positions[pos.position]) {
            acc[game.id].positions[pos.position] = 0;
          }
          acc[game.id].positions[pos.position] += minutes;
          acc[game.id].totalMinutes += minutes;
        });

        return acc;
      }, {});

      const games = Object.values(transformedGames || {});

      // Count MOTM appearances
      const motmCount = games.filter((game: any) => game.isMotm).length;

      return {
        stats: {
          total_appearances: fixtureStats?.total_appearances || 0,
          captain_appearances: fixtureStats?.captain_appearances || 0,
          total_minutes_played: fixtureStats?.total_minutes_played || 0,
          positions_played: fixtureStats?.positions_played as Record<string, number> || {}
        },
        recentGames: games,
        motmCount
      };
    },
  });

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

  const handleDownloadReport = async () => {
    try {
      const response = await supabase.functions.invoke('generate-player-report', {
        body: { playerId: player.id }
      });

      if (response.error) throw response.error;

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `player-report-${player.name}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Report Generated",
        description: "Your player report has been downloaded.",
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get categories based on player type
  const categories = player.playerType === "GOALKEEPER" 
    ? ["GOALKEEPING"] 
    : ["TECHNICAL", "MENTAL", "PHYSICAL"];

  console.log("Player type:", player.playerType);
  console.log("Categories:", categories);
  console.log("All attributes:", player.attributes);

  const handleFixtureClick = (fixtureId: string) => {
    if (fixtureId) {
      navigate(`/fixtures/${fixtureId}`);
    }
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
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <CardTitle>
                {player.name} - #{player.squadNumber} ({player.playerCategory})
              </CardTitle>
              <EditPlayerDialog player={player} onPlayerUpdated={() => {
                window.location.reload();
              }} />
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={handleDownloadReport}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
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
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">{player.playerType}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {categories.map((category) => {
              const categoryAttributes = player.attributes.filter(
                (attr) => attr.category === category
              );
              
              console.log(`Filtered attributes for ${category}:`, categoryAttributes);
              
              if (categoryAttributes.length > 0) {
                return (
                  <AttributeSection
                    key={category}
                    category={`${category} (${calculateCategoryAverage(category)})`}
                    attributes={categoryAttributes}
                    attributeHistory={attributeHistory || {}}
                    onUpdateAttribute={handleUpdateAttribute}
                    playerId={player.id}
                    playerCategory={player.playerCategory}
                  />
                );
              }
              return null;
            })}
          </div>
        </CardContent>
      </Card>

      {/* Game Metrics Section */}
      <Card>
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between p-6 hover:bg-accent/5 transition-colors">
            <h3 className="text-xl font-semibold">Game Metrics</h3>
            <ChevronDown className="h-5 w-5" />
          </CollapsibleTrigger>
          <CollapsibleContent className="p-6 pt-0 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-accent/5 rounded-xl border border-accent/10 transform hover:scale-105 transition-transform">
                <div className="flex items-center gap-3 mb-3">
                  <Medal className="h-8 w-8 text-purple-500" />
                  <p className="text-base font-medium text-gray-600">Total Games</p>
                </div>
                <p className="text-4xl font-bold text-gray-900">{gameMetrics?.stats?.total_appearances || 0}</p>
              </div>
              
              <div className="p-6 bg-accent/5 rounded-xl border border-accent/10 transform hover:scale-105 transition-transform">
                <div className="flex items-center gap-3 mb-3">
                  <Crown className="h-8 w-8 text-blue-500" />
                  <p className="text-base font-medium text-gray-600">Captain</p>
                </div>
                <p className="text-4xl font-bold text-gray-900">{gameMetrics?.stats?.captain_appearances || 0}</p>
              </div>
              
              <div className="p-6 bg-accent/5 rounded-xl border border-accent/10 transform hover:scale-105 transition-transform">
                <div className="flex items-center gap-3 mb-3">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  <p className="text-base font-medium text-gray-600">MOTM</p>
                </div>
                <p className="text-4xl font-bold text-gray-900">{gameMetrics?.motmCount || 0}</p>
              </div>
              
              <div className="p-6 bg-accent/5 rounded-xl border border-accent/10 transform hover:scale-105 transition-transform">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="h-8 w-8 text-green-500" />
                  <p className="text-base font-medium text-gray-600">Total Minutes</p>
                </div>
                <p className="text-4xl font-bold text-gray-900">{gameMetrics?.stats?.total_minutes_played || 0}</p>
              </div>
            </div>

            {gameMetrics?.stats?.positions_played && Object.keys(gameMetrics.stats.positions_played).length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Minutes by Position</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(gameMetrics.stats.positions_played).map(([position, minutes]) => (
                    <div key={position} 
                      className="flex justify-between items-center p-4 bg-accent/5 rounded-lg border border-accent/10 hover:bg-accent/10 transition-colors">
                      <span className="font-medium text-gray-800">{position}</span>
                      <span className="text-gray-600 font-semibold">{minutes} mins</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Recent Games</h4>
              <div className="space-y-4">
                {gameMetrics?.recentGames.map((game) => (
                  <div key={game.id} 
                    className="border rounded-lg p-5 hover:bg-accent/5 transition-colors cursor-pointer"
                    onClick={() => handleFixtureClick(game.fixture_id)}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-lg font-semibold text-gray-900">vs {game.fixtures.opponent}</span>
                      <Badge variant="secondary" className="text-sm font-medium">
                        {game.totalMinutes} mins
                      </Badge>
                      {game.isCaptain && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Crown className="h-5 w-5 text-blue-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Captain</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {game.isMotm && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Trophy className="h-5 w-5 text-yellow-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Man of the Match</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(game.positions).map(([position, minutes]) => (
                        <Badge key={position} variant="outline" className="text-sm">
                          {position}: {minutes}m
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Player Objectives and Coaching Comments */}
      <div className="grid gap-6 md:grid-cols-2">
        <PlayerObjectives playerId={player.id} />
        <CoachingComments playerId={player.id} />
      </div>

      {/* Radar Charts */}
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
