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
import { useEffect } from "react";

interface PlayerDetailsProps {
  player: Player;
}

interface GameMetricsData {
  stats: {
    total_appearances: number;
    captain_appearances: number;
    total_minutes_played: number;
    positions_played: Record<string, number>;
  };
  recentGames: Array<{
    id: string;
    fixture_id: string;
    fixtures?: {
      date: string;
      opponent: string;
      motm_player_id?: string;
    };
    fixture_playing_periods?: {
      duration_minutes: number;
    };
    position: string;
    isCaptain: boolean;
    isMotm: boolean;
  }>;
  motmCount: number;
}

const positionMappings: Record<string, string> = {
  'GK': 'Goalkeeper',
  'SK': 'Sweeper Keeper',
  'DL': 'Left Back',
  'DCL': 'Left Center Back',
  'DCR': 'Right Center Back',
  'DR': 'Right Back',
  'WBL': 'Left Wing Back',
  'WBR': 'Right Wing Back',
  'DMCL': 'Left Defensive Midfielder',
  'DMCR': 'Right Defensive Midfielder',
  'ML': 'Left Midfielder',
  'MCL': 'Left Center Midfielder',
  'MCR': 'Right Center Midfielder',
  'MR': 'Right Midfielder',
  'AML': 'Left Attacking Midfielder',
  'AMCL': 'Left Center Attacking Midfielder',
  'AMCR': 'Right Center Attacking Midfielder',
  'AMR': 'Right Attacking Midfielder',
  'STCL': 'Left Striker',
  'STCR': 'Right Striker'
};

export const PlayerDetails = ({ player }: PlayerDetailsProps) => {
  const updateAttribute = usePlayersStore((state) => state.updateAttribute);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Add a query to fetch position definitions
  const { data: positionDefinitions } = useQuery({
    queryKey: ["position-definitions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('position_definitions')
        .select('abbreviation, full_name');
      
      if (error) throw error;
      
      return data.reduce((acc, pos) => {
        acc[pos.abbreviation] = pos.full_name;
        return acc;
      }, {} as Record<string, string>);
    },
  });

  // Query for game metrics data with real-time updates enabled
  const { data: gameMetrics, refetch: refetchGameMetrics } = useQuery({
    queryKey: ["player-game-metrics", player.id],
    queryFn: async () => {
      const { data: fixtureStats, error: fixtureError } = await supabase
        .from("player_fixture_stats")
        .select("*")
        .eq("player_id", player.id)
        .maybeSingle();

      const { data: recentGames, error: gamesError } = await supabase
        .from("fixture_player_positions")
        .select(`
          *,
          fixtures (
            date,
            opponent,
            motm_player_id
          ),
          fixture_playing_periods (
            duration_minutes
          )
        `)
        .eq("player_id", player.id)
        .order("created_at", { ascending: false });

      const { data: captainData, error: captainError } = await supabase
        .from("fixture_team_selections")
        .select("fixture_id, is_captain")
        .eq("player_id", player.id);

      if (fixtureError || gamesError || captainError) throw fixtureError || gamesError || captainError;

      // Create a map of fixture_id to captain status
      const captainMap = new Map(
        captainData?.map(item => [item.fixture_id, item.is_captain]) || []
      );

      // Calculate total minutes only from positions (excluding substitute minutes)
      const totalMinutesPlayed = recentGames?.reduce((total, game) => {
        if (!game.is_substitute && game.fixture_playing_periods?.duration_minutes) {
          return total + game.fixture_playing_periods.duration_minutes;
        }
        return total;
      }, 0) || 0;

      const transformedStats = {
        total_appearances: fixtureStats?.total_appearances || 0,
        captain_appearances: fixtureStats?.captain_appearances || 0,
        total_minutes_played: totalMinutesPlayed,
        positions_played: (fixtureStats?.positions_played as Record<string, number>) || {}
      };

      // Group positions by fixture
      const fixturePositions = new Map();
      recentGames?.forEach(game => {
        const fixtureId = game.fixture_id;
        if (!fixturePositions.has(fixtureId)) {
          fixturePositions.set(fixtureId, {
            id: game.id,
            fixture_id: fixtureId,
            fixtures: game.fixtures,
            positions: [],
            isCaptain: captainMap.get(fixtureId) || false,
            isMotm: game.fixtures?.motm_player_id === player.id,
            totalMinutes: 0
          });
        }
        
        const fixture = fixturePositions.get(fixtureId);
        if (game.fixture_playing_periods?.duration_minutes) {
          fixture.positions.push({
            position: game.position,
            minutes: game.fixture_playing_periods.duration_minutes
          });
          fixture.totalMinutes += game.fixture_playing_periods.duration_minutes;
        }
      });

      const transformedRecentGames = Array.from(fixturePositions.values())
        .sort((a, b) => {
          const dateA = new Date(a.fixtures?.date || 0);
          const dateB = new Date(b.fixtures?.date || 0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5);

      const motmCount = transformedRecentGames.filter(game => game.isMotm).length;

      return {
        stats: transformedStats,
        recentGames: transformedRecentGames,
        motmCount
      };
    },
  });

  // Query for attribute history
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

  // Query for top positions
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

  // Set up real-time listeners for relevant tables
  useEffect(() => {
    const channel = supabase
      .channel('player-game-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fixture_player_positions',
          filter: `player_id=eq.${player.id}`
        },
        () => {
          refetchGameMetrics();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fixture_team_selections',
          filter: `player_id=eq.${player.id}`
        },
        () => {
          refetchGameMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [player.id, refetchGameMetrics]);

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
                    {pos.position_definitions.full_name} ({pos.position_definitions.abbreviation})
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
                      className="flex flex-col p-4 bg-accent/5 rounded-lg border border-accent/10 hover:bg-accent/10 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-800">
                          {positionDefinitions?.[position] || position} ({position})
                        </span>
                        <span className="text-gray-600 font-semibold">{minutes} mins</span>
                      </div>
                      <Badge variant="secondary" className="self-start text-xs">
                        {player.playerCategory}
                      </Badge>
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
                      <span className="text-lg font-semibold text-gray-900">vs {game.fixtures?.opponent}</span>
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
                      <Badge variant="outline" className="ml-auto">
                        {player.playerCategory}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {game.positions.map((pos, index) => (
                        <Badge key={`${game.id}-${pos.position}-${index}`} variant="outline" className="text-sm">
                          {pos.position}: {pos.minutes}m
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
