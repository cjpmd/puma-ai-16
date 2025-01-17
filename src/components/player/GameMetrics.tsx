import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { ChevronDown } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

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
  }>;
}

interface PositionDefinition {
  abbreviation: string;
  full_name: string;
}

export function GameMetrics({ stats, motmCount, recentGames }: GameMetricsProps) {
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
      return (data as PositionDefinition[]).reduce((acc, pos) => {
        acc[pos.abbreviation] = pos.full_name;
        return acc;
      }, {} as Record<string, string>);
    },
    // Add some basic caching to avoid unnecessary refetches
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  const getPositionFullName = (abbreviation: string) => {
    if (isLoading || !positionDefinitions) return abbreviation;
    return positionDefinitions[abbreviation] 
      ? `${positionDefinitions[abbreviation]} [${abbreviation}]`
      : abbreviation;
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
                      <div className="text-sm text-gray-600">Total Appearances</div>
                      <div className="text-2xl font-bold text-gray-900">{stats.total_appearances}</div>
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
                      <span className="text-sm text-gray-600">{game.date}</span>
                      <span className="font-semibold">
                        {game.home_score !== null && game.away_score !== null
                          ? `${game.home_score} - ${game.away_score}`
                          : "vs"}{" "}
                        {game.opponent}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {game.positions.map((pos) => (
                        <Badge key={pos.position} variant="outline" className="text-sm">
                          {getPositionFullName(pos.position)}: {pos.minutes}m
                        </Badge>
                      ))}
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