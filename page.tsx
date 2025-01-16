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
      fixturePositions.set(fixtureId, {
        positions: [],
        fixture: position.fixtures
      })
    }
    fixturePositions.get(fixtureId).positions.push(position)
  })

  // Calculate total minutes played
  let totalMinutesPlayed = 0

  // Then create the final games array with aggregated data
  const games = Array.from(fixturePositions.entries()).map(([fixtureId, data]) => {
    const { positions, fixture } = data

    // Calculate total minutes and positions for this game
    const positionsMap = {}
    let gameTotalMinutes = 0

    positions.forEach(pos => {
      const minutes = pos.fixture_playing_periods?.duration_minutes || 0
      if (pos.position) {
        positionsMap[pos.position] = (positionsMap[pos.position] || 0) + minutes
      }
      gameTotalMinutes += minutes
    })

    // Add to total minutes
    totalMinutesPlayed += gameTotalMinutes

    // Check if player was captain in this fixture
    const isCaptain = player.fixture_team_selections?.some(
      selection => selection.fixture_id === fixtureId && selection.is_captain
    )

    return {
      opponent: fixture.opponent,
      date: fixture.date,
      totalMinutes: gameTotalMinutes,
      positions: positionsMap,
      isMotm: fixture.motm_player_id === player.id,
      isCaptain
    }
  })

  // Sort games by date (most recent first)
  const sortedGames = games.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Calculate MOTM count
  const motmCount = new Set(
    player.fixture_player_positions
      ?.filter(pos => pos.fixtures?.motm_player_id === player.id)
      .map(pos => pos.fixtures?.id)
  ).size

  // If stats don't exist, create them from calculated values
  const calculatedStats = stats || {
    total_appearances: games.length,
    captain_appearances: player.fixture_team_selections?.filter(s => s.is_captain).length || 0,
    total_minutes_played: totalMinutesPlayed,
    positions_played: games.reduce((acc, game) => {
      Object.entries(game.positions).forEach(([pos, mins]) => {
        acc[pos] = (acc[pos] || 0) + mins
      })
      return acc
    }, {})
  }

  console.log('Processed games:', sortedGames)
  console.log('Calculated stats:', calculatedStats)

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
          stats={calculatedStats}
          motmCount={motmCount}
          recentGames={sortedGames}
        />
      </div>
    </div>
  )
}