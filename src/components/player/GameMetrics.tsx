import { Trophy, Crown, Award, Medal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from 'next/link'

interface GameMetricsProps {
  stats: {
    total_appearances?: number
    captain_appearances?: number
    total_minutes_played?: number
    positions_played?: Record<string, number>
  }
  motmCount: number
  recentGames: Array<{
    id: string
    opponent: string
    totalMinutes: number
    positions: Record<string, number>
    isMotm: boolean
    isCaptain: boolean
    date: string
  }>
}

export function GameMetrics({ stats, motmCount, recentGames }: GameMetricsProps) {
  return (
    <div className="border rounded-lg shadow-sm bg-white">
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
              <p className="text-4xl font-bold text-gray-900">{stats?.total_appearances || 0}</p>
            </div>
            
            <div className="p-6 bg-accent/5 rounded-xl border border-accent/10 transform hover:scale-105 transition-transform">
              <div className="flex items-center gap-3 mb-3">
                <Crown className="h-8 w-8 text-blue-500" />
                <p className="text-base font-medium text-gray-600">Captain</p>
              </div>
              <p className="text-4xl font-bold text-gray-900">{stats?.captain_appearances || 0}</p>
            </div>
            
            <div className="p-6 bg-accent/5 rounded-xl border border-accent/10 transform hover:scale-105 transition-transform">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <p className="text-base font-medium text-gray-600">MOTM</p>
              </div>
              <p className="text-4xl font-bold text-gray-900">{motmCount}</p>
            </div>
            
            <div className="p-6 bg-accent/5 rounded-xl border border-accent/10 transform hover:scale-105 transition-transform">
              <div className="flex items-center gap-3 mb-3">
                <Award className="h-8 w-8 text-green-500" />
                <p className="text-base font-medium text-gray-600">Total Minutes</p>
              </div>
              <p className="text-4xl font-bold text-gray-900">{stats?.total_minutes_played || 0}</p>
            </div>
          </div>

          {stats?.positions_played && Object.keys(stats.positions_played).length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Minutes by Position</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats.positions_played).map(([position, minutes]) => (
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
              {recentGames.map((game, index) => (
                <Link 
                  key={index}
                  href={`/fixtures/${game.id}`}
                  className="block border rounded-lg p-5 hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-lg font-semibold text-gray-900">vs {game.opponent}</span>
                    <Badge variant="secondary" className="text-sm font-medium">{game.totalMinutes} mins</Badge>
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
                    {Object.entries(game.positions).map(([pos, mins]) => (
                      <Badge key={pos} variant="outline" className="text-sm">
                        {pos}: {mins}m
                      </Badge>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
