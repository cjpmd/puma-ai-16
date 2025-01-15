import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Trophy, Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function Page({ params }: { params: { id: string } }) {
  if (!params.id) {
    notFound()
  }

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: player, error } = await supabase
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
    .maybeSingle()

  if (error) {
    console.error('Error fetching player:', error)
    throw error
  }

  if (!player) {
    notFound()
  }

  // Calculate position minutes
  const positionMinutes: Record<string, number> = {}
  player.fixture_player_positions?.forEach((position) => {
    const minutes = position.fixture_playing_periods?.duration_minutes || 0
    if (position.position) {
      positionMinutes[position.position] = (positionMinutes[position.position] || 0) + minutes
    }
  })

  // Create a map of fixture IDs where player was captain
  const captainFixtures = new Set(
    player.fixture_team_selections
      ?.filter(selection => selection.is_captain)
      .map(selection => selection.fixture_id)
  )

  // Calculate captain appearances
  const captainAppearances = player.fixture_team_selections?.filter(
    selection => selection.is_captain
  ).length || 0

  // Calculate MOTM appearances
  const motmAppearances = player.fixture_player_positions?.filter(
    position => position.fixtures?.motm_player_id === player.id
  ).length || 0

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
        isCaptain: captainFixtures.has(fixtureId)
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

  const totalMinutes = Object.values(positionMinutes).reduce((a, b) => a + b, 0)

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
                    <p className="font-medium text-xl">{player.fixture_player_positions?.length || 0}</p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm text-gray-600">Captain</p>
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-xl">{captainAppearances}</p>
                      <Crown className="h-5 w-5 text-blue-500" title="Captain" />
                    </div>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm text-gray-600">MOTM</p>
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-xl">{motmAppearances}</p>
                      <Trophy className="h-5 w-5 text-yellow-500" title="Man of the Match" />
                    </div>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm text-gray-600">Total Minutes</p>
                    <p className="font-medium text-xl">{totalMinutes}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Minutes by Position</h4>
                <ul className="space-y-1">
                  {Object.entries(positionMinutes).map(([position, minutes]) => (
                    <li key={position} className="flex justify-between p-2 bg-accent/5 rounded">
                      <span>{position}</span>
                      <span className="font-medium">{minutes} mins</span>
                    </li>
                  ))}
                </ul>
              </div>

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