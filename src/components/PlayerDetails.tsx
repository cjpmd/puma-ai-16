import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { usePlayersStore } from "@/store/players";
import { motion } from "framer-motion";
import { Badge } from "./ui/badge";
import { Player } from "@/types/player";
import { PlayerObjectives } from "./coaching/PlayerObjectives";
import { CoachingComments } from "./coaching/CoachingComments";
import { PlayerHeader } from "./player/PlayerHeader";
import { GameMetricsSection } from "./player/GameMetricsSection";
import { AttributesSection } from "./player/AttributesSection";

interface PlayerDetailsProps {
  player: Player;
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

  // Query to fetch enabled attributes
  const { data: enabledAttributes } = useQuery({
    queryKey: ["attribute-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attribute_settings')
        .select('*')
        .eq('is_enabled', true)
        .eq('is_deleted', false);
      
      if (error) throw error;
      return data.map(attr => attr.name);
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

  const handleUpdateAttribute = (name: string, value: number) => {
    updateAttribute(player.id, name, value);
  };

  const calculateCategoryAverage = (category: string) => {
    const categoryAttributes = filteredAttributes.filter(
      (attr) => attr.category === category
    );
    if (categoryAttributes.length === 0) return "0.0";
    const sum = categoryAttributes.reduce((acc, curr) => acc + curr.value, 0);
    return (sum / categoryAttributes.length).toFixed(1);
  };

  const getRadarData = (category: string) => {
    return filteredAttributes
      .filter((attr) => attr.category === category)
      .map((attr) => ({
        name: attr.name,
        value: attr.value,
        fullMark: 20,
      }));
  };

  // Filter attributes based on enabled settings
  const filteredAttributes = player.attributes.filter(attr => 
    enabledAttributes?.includes(attr.name)
  );

  // Get categories based on player type and enabled attributes
  const categories = player.playerType === "GOALKEEPER" 
    ? ["GOALKEEPING"] 
    : ["TECHNICAL", "MENTAL", "PHYSICAL"];

  // Only show categories that have enabled attributes
  const activeCategories = categories.filter(category => 
    filteredAttributes.some(attr => attr.category === category)
  );

  // Don't show radar charts or position suggestions if no attributes are enabled
  const showAttributeVisuals = filteredAttributes.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <PlayerHeader
            player={player}
            topPositions={topPositions}
            showAttributeVisuals={showAttributeVisuals}
          />
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">{player.playerType}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <AttributesSection
            activeCategories={activeCategories}
            filteredAttributes={filteredAttributes}
            attributeHistory={attributeHistory || {}}
            onUpdateAttribute={handleUpdateAttribute}
            playerId={player.id}
            calculateCategoryAverage={calculateCategoryAverage}
            getRadarData={getRadarData}
          />
        </CardContent>
      </Card>

      <Card>
        <GameMetricsSection
          gameMetrics={gameMetrics}
          positionMappings={positionMappings}
          playerCategory={player.playerCategory}
        />
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <PlayerObjectives playerId={player.id} />
        <CoachingComments playerId={player.id} />
      </div>
    </motion.div>
  );
};
