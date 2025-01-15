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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Player Details</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="text-xl">{player.name} - #{player.squad_number}</h2>
          <p className="text-gray-600">Category: {player.player_category}</p>
        </div>
        
        <div className="border rounded">
          <Collapsible>
            <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-accent">
              <h3 className="font-semibold">Attributes</h3>
              <ChevronDown className="h-5 w-5" />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 pt-0">
              <ul className="space-y-1">
                {player.player_attributes?.map((attr) => (
                  <li key={attr.id} className="flex justify-between">
                    <span>{attr.name}</span>
                    <span className="font-medium">{attr.value}</span>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="border rounded">
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-accent">
              <h3 className="font-semibold">Game Metrics</h3>
              <ChevronDown className="h-5 w-5" />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 pt-0 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Appearances</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm text-gray-600">Total Games</p>
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-xl">{stats?.total_appearances || 0}</p>
                      <Medal className="h-5 w-5 text-purple-500" title="Total Games" />
                    </div>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm text-gray-600">Captain</p>
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-xl">{stats?.captain_appearances || 0}</p>
                      <Crown className="h-5 w-5 text-blue-500" title="Captain" />
                    </div>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm text-gray-600">MOTM</p>
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-xl">
                        {player.fixture_player_positions?.filter(
                          pos => pos.fixtures?.motm_player_id === player.id
                        ).length || 0}
                      </p>
                      <Trophy className="h-5 w-5 text-yellow-500" title="Man of the Match" />
                    </div>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm text-gray-600">Total Minutes</p>
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-xl">{stats?.total_minutes_played || 0}</p>
                      <Award className="h-5 w-5 text-green-500" title="Total Minutes Played" />
                    </div>
                  </div>
                </div>
              </div>

              {stats?.positions_played && Object.keys(stats.positions_played).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Minutes by Position</h4>
                  <ul className="space-y-1">
                    {Object.entries(stats.positions_played).map(([position, minutes]) => (
                      <li key={position} className="flex justify-between p-2 bg-accent/5 rounded">
                        <span>{position}</span>
                        <span className="font-medium">{minutes} mins</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Recent Games</h4>
                <ul className="space-y-3">
                  {sortedGames.map((game, index) => (
                    <li key={index} className="border-b pb-2 last:border-b-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">vs {game.opponent}</span>
                        <Badge variant="secondary">{game.totalMinutes} mins</Badge>
                        {game.isCaptain && (
                          <Crown className="h-4 w-4 text-blue-500" title="Captain" />
                        )}
                        {game.isMotm && (
                          <Trophy className="h-4 w-4 text-yellow-500" title="Man of the Match" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600 flex flex-wrap gap-2">
                        {Object.entries(game.positions).map(([pos, mins]: [string, number]) => (
                          <Badge key={pos} variant="outline" className="text-xs">
                            {pos}: {mins}m
                          </Badge>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  )
}