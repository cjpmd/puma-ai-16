import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Trophy, Crown, Award, Medal } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function Page({ params }: { params: { id: string } }) {
  if (!params.id) {
    notFound()
  }

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Fetch player details and stats in parallel
  const [playerResult, statsResult] = await Promise.all([
    supabase
      .from('players')
      .select(`
        *,
        player_attributes (*),
        fixture_player_positions (
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
        ),
        fixture_team_selections (
          fixture_id,
          is_captain
        )
      `)
      .eq('id', params.id)
      .maybeSingle(),
    
    supabase
      .from('player_fixture_stats')
      .select('*')
      .eq('player_id', params.id)
      .maybeSingle()
  ])

  if (playerResult.error) {
    console.error('Error fetching player:', playerResult.error)
    throw playerResult.error
  }

  const player = playerResult.data
  const stats = statsResult.data

  // Add console logs to debug data
  console.log('Player Stats:', stats)
  console.log('Player Positions:', stats?.positions_played)

  if (!player) {
    notFound()
  }

  // Group games by opponent to consolidate positions and minutes
  const gamesByOpponent = player.fixture_player_positions?.reduce((acc, curr) => {
    const opponent = curr.fixtures?.opponent
    const fixtureId = curr.fixtures?.id
    if (!opponent || !fixtureId) return acc
    
    if (!acc[opponent]) {
      acc[opponent] = {
        opponent,
        date: curr.fixtures?.date,
        totalMinutes: 0,
        positions: {},
        isMotm: curr.fixtures?.motm_player_id === player.id,
        isCaptain: player.fixture_team_selections?.some(
          selection => selection.fixture_id === fixtureId && selection.is_captain
        )
      }
    }
    
    acc[opponent].totalMinutes += curr.fixture_playing_periods?.duration_minutes || 0
    if (curr.position) {
      acc[opponent].positions[curr.position] = (acc[opponent].positions[curr.position] || 0) + 
        (curr.fixture_playing_periods?.duration_minutes || 0)
    }
    
    return acc
  }, {} as Record<string, any>)

  const sortedGames = Object.values(gamesByOpponent || {}).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Player Details</h1>
      
      <div className="space-y-6">
        <div className="p-6 border rounded-lg shadow-sm bg-white">
          <h2 className="text-2xl font-bold">{player.name}</h2>
          <p className="text-gray-600 text-lg">#{player.squad_number} · {player.player_category}</p>
        </div>
        
        <div className="border rounded-lg shadow-sm bg-white">
          <Collapsible>
            <CollapsibleTrigger className="flex w-full items-center justify-between p-6 hover:bg-accent/5 transition-colors">
              <h3 className="text-xl font-semibold">Attributes</h3>
              <ChevronDown className="h-5 w-5" />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-6 pt-0">
              <ul className="space-y-2">
                {player.player_attributes?.map((attr) => (
                  <li key={attr.id} className="flex justify-between items-center">
                    <span className="text-gray-700">{attr.name}</span>
                    <span className="font-semibold">{attr.value}</span>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="border rounded-lg shadow-sm bg-white">
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex w-full items-center justify-between p-6 hover:bg-accent/5 transition-colors">
              <h3 className="text-xl font-semibold">Game Metrics</h3>
              <ChevronDown className="h-5 w-5" />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-6 pt-0 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-accent/5 rounded-xl border border-accent/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Medal className="h-6 w-6 text-purple-500" />
                    <p className="text-sm font-medium text-gray-600">Total Games</p>
                  </div>
                  <p className="text-3xl font-bold">{stats?.total_appearances || 0}</p>
                </div>
                
                <div className="p-6 bg-accent/5 rounded-xl border border-accent/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Crown className="h-6 w-6 text-blue-500" />
                    <p className="text-sm font-medium text-gray-600">Captain</p>
                  </div>
                  <p className="text-3xl font-bold">{stats?.captain_appearances || 0}</p>
                </div>
                
                <div className="p-6 bg-accent/5 rounded-xl border border-accent/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    <p className="text-sm font-medium text-gray-600">MOTM</p>
                  </div>
                  <p className="text-3xl font-bold">
                    {player.fixture_player_positions?.filter(
                      pos => pos.fixtures?.motm_player_id === player.id
                    ).length || 0}
                  </p>
                </div>
                
                <div className="p-6 bg-accent/5 rounded-xl border border-accent/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="h-6 w-6 text-green-500" />
                    <p className="text-sm font-medium text-gray-600">Total Minutes</p>
                  </div>
                  <p className="text-3xl font-bold">{stats?.total_minutes_played || 0}</p>
                </div>
              </div>

              {stats?.positions_played && Object.keys(stats.positions_played).length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Minutes by Position</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(stats.positions_played).map(([position, minutes]) => (
                      <div key={position} className="flex justify-between items-center p-4 bg-accent/5 rounded-lg border border-accent/10">
                        <span className="font-medium">{position}</span>
                        <span className="text-gray-600">{minutes} mins</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Recent Games</h4>
                <div className="space-y-4">
                  {sortedGames.map((game, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-accent/5 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-lg font-semibold">vs {game.opponent}</span>
                        <Badge variant="secondary" className="text-sm">{game.totalMinutes} mins</Badge>
                        {game.isCaptain && (
                          <Crown className="h-5 w-5 text-blue-500" title="Captain" />
                        )}
                        {game.isMotm && (
                          <Trophy className="h-5 w-5 text-yellow-500" title="Man of the Match" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(game.positions).map(([pos, mins]: [string, number]) => (
                          <Badge key={pos} variant="outline" className="text-sm">
                            {pos}: {mins}m
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  )
}