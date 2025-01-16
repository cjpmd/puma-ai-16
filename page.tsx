import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { PlayerHeader } from '@/components/player/PlayerHeader'
import { PlayerAttributes } from '@/components/player/PlayerAttributes'
import { GameMetrics } from '@/components/player/GameMetrics'

export default async function Page({ params }: { params: { id: string } }) {
  if (!params.id) {
    notFound()
  }

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const [playerResult, statsResult] = await Promise.all([
    supabase
      .from('players')
      .select(`
        *,
        player_attributes (*),
        fixture_player_positions (
          id,
          position,
          fixture_id,
          fixture_playing_periods (
            duration_minutes
          ),
          fixtures (
            id,
            date,
            opponent,
            motm_player_id
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

  // First, group all positions by fixture
  const fixturePositions = new Map()
  
  player.fixture_player_positions?.forEach(position => {
    if (!position.fixtures || !position.fixture_id) return

    const fixtureId = position.fixture_id
    if (!fixturePositions.has(fixtureId)) {
      fixturePositions.set(fixtureId, [])
    }
    fixturePositions.get(fixtureId).push(position)
  })

  // Then create the final games array with aggregated data
  const games = Array.from(fixturePositions.entries()).map(([fixtureId, positions]) => {
    const firstPosition = positions[0] // Use first position to get fixture details
    const fixture = firstPosition.fixtures

    // Calculate total minutes and positions
    const positionsMap = {}
    let totalMinutes = 0

    positions.forEach(pos => {
      const minutes = pos.fixture_playing_periods?.duration_minutes || 0
      if (pos.position) {
        positionsMap[pos.position] = (positionsMap[pos.position] || 0) + minutes
      }
      totalMinutes += minutes
    })

    // Check if player was captain in this fixture
    const isCaptain = player.fixture_team_selections?.some(
      selection => selection.fixture_id === fixtureId && selection.is_captain
    )

    return {
      opponent: fixture.opponent,
      date: fixture.date,
      totalMinutes,
      positions: positionsMap,
      isMotm: fixture.motm_player_id === player.id,
      isCaptain
    }
  })

  // Sort games by date (most recent first)
  const sortedGames = games.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Calculate MOTM count from fixture positions
  const motmCount = new Set(
    player.fixture_player_positions
      ?.filter(pos => pos.fixtures?.motm_player_id === player.id)
      .map(pos => pos.fixtures?.id)
  ).size

  console.log('Processed games:', sortedGames)

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Player Details</h1>
      
      <div className="space-y-6">
        <PlayerHeader 
          name={player.name}
          squadNumber={player.squad_number}
          category={player.player_category}
        />
        
        <PlayerAttributes attributes={player.player_attributes} />

        <GameMetrics 
          stats={stats || {
            total_appearances: 0,
            captain_appearances: 0,
            total_minutes_played: 0,
            positions_played: {}
          }}
          motmCount={motmCount}
          recentGames={sortedGames}
        />
      </div>
    </div>
  )
}