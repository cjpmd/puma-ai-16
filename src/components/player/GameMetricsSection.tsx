import { ChevronDown, Medal, Crown, Trophy, Award } from "lucide-react";
import { Badge } from "../ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useNavigate } from "react-router-dom";

interface GameMetricsSectionProps {
  gameMetrics: {
    stats: {
      total_appearances: number;
      captain_appearances: number;
      total_minutes_played: number;
      positions_played: Record<string, number>;
    };
    recentGames: Array<{
      id: string;
      fixture_id: string;
      date: string;
      opponent: string;
      home_score: number | null;
      away_score: number | null;
      outcome: 'WIN' | 'DRAW' | 'LOSS' | null;
      totalMinutes: number;
      positions: Array<{ position: string; minutes: number }>;
      isMotm: boolean;
      isCaptain: boolean;
      category: string;
    }>;
    motmCount: number;
  };
  positionMappings: Record<string, string>;
  playerCategory: string;
}

export const GameMetricsSection = ({ gameMetrics, positionMappings, playerCategory }: GameMetricsSectionProps) => {
  const navigate = useNavigate();

  const handleFixtureClick = (fixtureId: string) => {
    navigate(`/fixtures/${fixtureId}`);
  };

  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="flex w-full items-center justify-between p-6 hover:bg-accent/5 transition-colors">
        <h3 className="text-xl font-semibold">Game Metrics</h3>
        <ChevronDown className="h-5 w-5" />
      </CollapsibleTrigger>
      <CollapsibleContent className="p-6 pt-0 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            icon={<Medal className="h-8 w-8 text-purple-500" />}
            title="Total Games"
            value={gameMetrics?.stats?.total_appearances || 0}
          />
          <MetricCard
            icon={<Crown className="h-8 w-8 text-blue-500" />}
            title="Captain"
            value={gameMetrics?.stats?.captain_appearances || 0}
          />
          <MetricCard
            icon={<Trophy className="h-8 w-8 text-yellow-500" />}
            title="MOTM"
            value={gameMetrics?.motmCount || 0}
          />
          <MetricCard
            icon={<Award className="h-8 w-8 text-green-500" />}
            title="Total Minutes"
            value={gameMetrics?.stats?.total_minutes_played || 0}
          />
        </div>

        {gameMetrics?.stats?.positions_played && Object.keys(gameMetrics.stats.positions_played).length > 0 && (
          <PositionsPlayed
            positions={gameMetrics.stats.positions_played}
            positionMappings={positionMappings}
            playerCategory={playerCategory}
          />
        )}

        <RecentGames
          games={gameMetrics?.recentGames}
          playerCategory={playerCategory}
          onFixtureClick={handleFixtureClick}
        />
      </CollapsibleContent>
    </Collapsible>
  );
};

const MetricCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: number }) => (
  <div className="p-6 bg-accent/5 rounded-xl border border-accent/10 transform hover:scale-105 transition-transform">
    <div className="flex items-center gap-3 mb-3">
      {icon}
      <p className="text-base font-medium text-gray-600">{title}</p>
    </div>
    <p className="text-4xl font-bold text-gray-900">{value}</p>
  </div>
);

const PositionsPlayed = ({ positions, positionMappings, playerCategory }: { 
  positions: Record<string, number>;
  positionMappings: Record<string, string>;
  playerCategory: string;
}) => (
  <div className="space-y-4">
    <h4 className="text-lg font-semibold">Minutes by Position</h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(positions).map(([position, minutes]) => (
        <div key={position} 
          className="flex flex-col p-4 bg-accent/5 rounded-lg border border-accent/10 hover:bg-accent/10 transition-colors">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-800">
              {positionMappings[position] || position} ({position})
            </span>
            <span className="text-gray-600 font-semibold">{minutes} mins</span>
          </div>
          <Badge variant="secondary" className="self-start text-xs">
            {playerCategory}
          </Badge>
        </div>
      ))}
    </div>
  </div>
);

const RecentGames = ({ games, playerCategory, onFixtureClick }: {
  games: any[];
  playerCategory: string;
  onFixtureClick: (fixtureId: string) => void;
}) => (
  <div className="space-y-4">
    <h4 className="text-lg font-semibold">Recent Games</h4>
    <div className="space-y-4">
      {games?.map((game) => (
        <div key={game.id} 
          className="border rounded-lg p-5 hover:bg-accent/5 transition-colors cursor-pointer"
          onClick={() => onFixtureClick(game.fixture_id)}>
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
              {playerCategory}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {game.positions.map((pos: any, index: number) => (
              <Badge key={`${game.id}-${pos.position}-${index}`} variant="outline" className="text-sm">
                {pos.position}: {pos.minutes}m
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
