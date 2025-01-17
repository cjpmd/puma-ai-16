import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Trophy, Minus, XCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { format, parseISO } from "date-fns"

interface GameMetricsProps {
  stats: {
    total_appearances: number;
    total_minutes_played: number;
    positions_played: {
      [key: string]: number;
    };
  };
  motmCount: number;
  recentGames: Array<{
    id: string;
    date: string;
    opponent: string;
    home_score: number | null;
    away_score: number | null;
    positions: Array<{
      position: string;
      minutes: number;
    }>;
    category: string;
    outcome: 'WIN' | 'DRAW' | 'LOSS' | null;
  }>;
}

export function GameMetrics({ stats, motmCount, recentGames }: GameMetricsProps) {
  const gamesPerCategory = recentGames.reduce((acc, game) => {
    acc[game.category] = (acc[game.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Fetch position definitions from the database
  const { data: positionDefinitions, isLoading } = useQuery({
    queryKey: ["position-definitions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("position_definitions")
        .select("abbreviation, full_name");

      if (error) {
        console.error("Error fetching position definitions:", error);
        return {};
      }
      
      // Create a map of abbreviation to full name
      return data.reduce((acc, pos) => {
        acc[pos.abbreviation] = pos.full_name;
        return acc;
      }, {} as Record<string, string>);
    },
    gcTime: 30 * 60 * 1000, // 30 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getPositionFullName = (abbreviation: string) => {
    if (isLoading || !positionDefinitions) return abbreviation;
    return positionDefinitions[abbreviation] 
      ? `${positionDefinitions[abbreviation]} [${abbreviation}]`
      : abbreviation;
  };

  const getOutcomeIcon = (outcome: string | null) => {
    switch (outcome) {
      case 'WIN':
        return <Trophy className="h-4 w-4 text-green-500" />;
      case 'DRAW':
        return <Minus className="h-4 w-4 text-amber-500" />;
      case 'LOSS':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatScore = (home: number | null, away: number | null) => {
    if (home === null || away === null) return "vs";
    return `${home} - ${away}`;
  };

  return (
    <div className="border rounded-lg shadow-sm bg-white">
      <Collapsible defaultOpen>
        <div className="border-b">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-gray-50">
            <h3 className="text-lg font-semibold">Game Metrics</h3>
            <ChevronDown className="h-5 w-5" />
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="p-4 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="p-4 bg-accent/5 rounded-lg border border-accent/10 hover:bg-accent/10 transition-colors">
                      <div className="text-sm text-gray-600">Total Games</div>
                      <div className="text-2xl font-bold text-gray-900">{stats.total_appearances}</div>
                      <div className="mt-2 space-y-1">
                        {Object.entries(gamesPerCategory).map(([category, count]) => (
                          <div key={category} className="flex items-center justify-between text-sm">
                            <Badge variant="outline" className="text-xs">
                              {category}
                            </Badge>
                            <span className="text-gray-600">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Number of games played</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="p-4 bg-accent/5 rounded-lg border border-accent/10 hover:bg-accent/10 transition-colors">
                      <div className="text-sm text-gray-600">Total Minutes</div>
                      <div className="text-2xl font-bold text-gray-900">{stats.total_minutes_played}</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total minutes played across all games</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="p-4 bg-accent/5 rounded-lg border border-accent/10 hover:bg-accent/10 transition-colors">
                      <div className="text-sm text-gray-600">MOTM Awards</div>
                      <div className="text-2xl font-bold text-gray-900">{motmCount}</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Man of the Match awards received</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Minutes by Position */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Minutes by Position</h4>
              <div className="grid gap-2">
                {Object.entries(stats.positions_played).map(([position, minutes]) => (
                  <div key={position} 
                    className="flex justify-between items-center p-4 bg-accent/5 rounded-lg border border-accent/10 hover:bg-accent/10 transition-colors">
                    <span className="font-medium text-gray-800">
                      {getPositionFullName(position)}
                    </span>
                    <span className="text-gray-600 font-semibold">{minutes} mins</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Games */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Recent Games</h4>
              <div className="grid gap-4">
                {recentGames.map((game) => (
                  <Link
                    key={game.id}
                    to={`/fixtures/${game.id}`}
                    className="block p-4 bg-accent/5 rounded-lg border border-accent/10 hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {format(parseISO(game.date), "EEEE, MMMM do, yyyy")}
                        </span>
                        {getOutcomeIcon(game.outcome)}
                      </div>
                      <span className="font-semibold">
                        {formatScore(game.home_score, game.away_score)} {game.opponent}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {game.positions.map((pos) => (
                        <Badge key={pos.position} variant="outline" className="text-sm">
                          {getPositionFullName(pos.position)}: {pos.minutes}m
                        </Badge>
                      ))}
                      <Badge variant="secondary" className="text-sm">
                        {game.category}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}