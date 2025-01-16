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

  // Create a map to store fixture data
  const fixturesMap = new Map()

  // Process fixture positions and aggregate minutes by fixture
  player.fixture_player_positions?.forEach((position) => {
    if (!position.fixtures || !position.fixture_id) return

    const fixtureId = position.fixture_id
    const minutes = position.fixture_playing_periods?.duration_minutes || 0

    if (!fixturesMap.has(fixtureId)) {
      fixturesMap.set(fixtureId, {
        opponent: position.fixtures.opponent,
        date: position.fixtures.date,
        totalMinutes: 0,
        positions: {},
        isMotm: position.fixtures.motm_player_id === player.id,
        isCaptain: player.fixture_team_selections?.some(
          selection => selection.fixture_id === fixtureId && selection.is_captain
        )
      })
    }

    const fixture = fixturesMap.get(fixtureId)
    fixture.totalMinutes += minutes

    if (position.position) {
      fixture.positions[position.position] = (fixture.positions[position.position] || 0) + minutes
    }
  })

  // Convert map to array and sort by date
  const sortedGames = Array.from(fixturesMap.values()).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Calculate MOTM count
  const motmCount = new Set(
    player.fixture_player_positions
      ?.filter(pos => pos.fixtures?.motm_player_id === player.id)
      .map(pos => pos.fixtures?.id)
  ).size

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