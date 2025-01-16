import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Trophy, Star } from "lucide-react";
import { format } from "date-fns";

export const PlayerDetails = ({ playerId }: { playerId: string }) => {
  const navigate = useNavigate();

  const { data: recentGames } = useQuery({
    queryKey: ["recent-games", playerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixture_player_positions")
        .select(`
          *,
          fixtures (
            id,
            date,
            opponent,
            motm_player_id
          ),
          fixture_playing_periods (
            duration_minutes
          )
        `)
        .eq("player_id", playerId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  // Separate query for captain information
  const { data: captainInfo } = useQuery({
    queryKey: ["captain-info", playerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixture_team_selections")
        .select("fixture_id, is_captain")
        .eq("player_id", playerId)
        .eq("is_captain", true);

      if (error) throw error;
      return data;
    },
  });

  // Create a map of fixture IDs to captain status
  const captainMap = new Map(
    captainInfo?.map(info => [info.fixture_id, info.is_captain]) || []
  );

  const handleFixtureClick = (fixtureId: string) => {
    navigate(`/fixtures/${fixtureId}`);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recent Games</h3>
      <div className="grid gap-4">
        {recentGames?.map((game) => (
          <div
            key={game.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow cursor-pointer hover:bg-gray-50"
            onClick={() => handleFixtureClick(game.fixtures?.id || '')}
          >
            <div className="flex items-center space-x-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">
                  {game.fixtures?.date ? format(new Date(game.fixtures.date), 'dd/MM/yyyy') : 'N/A'}
                </span>
                <span className="font-medium">{game.fixtures?.opponent || 'Unknown'}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {captainMap.get(game.fixtures?.id) && (
                <Star className="h-5 w-5 text-yellow-500" />
              )}
              {game.fixtures?.motm_player_id === playerId && (
                <Trophy className="h-5 w-5 text-yellow-500" />
              )}
              <span className="px-2 py-1 text-sm bg-gray-100 rounded">
                {game.position}
              </span>
              <span className="text-sm text-gray-500">
                {game.fixture_playing_periods?.duration_minutes || 0} mins
              </span>
            </div>
          </div>
        ))}
        {(!recentGames || recentGames.length === 0) && (
          <div className="text-center py-4 text-gray-500">
            No recent games found
          </div>
        )}
      </div>
    </div>
  );
};