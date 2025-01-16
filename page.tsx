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

  console.log('Raw player data:', player)

  // Create a map of fixture IDs to consolidate positions and minutes
  const gamesByFixture = player.fixture_player_positions?.reduce((acc, curr) => {
    if (!curr.fixture_id || !curr.fixtures) return acc
    
    const fixtureId = curr.fixture_id
    
    if (!acc[fixtureId]) {
      acc[fixtureId] = {
        opponent: curr.fixtures.opponent,
        date: curr.fixtures.date,
        totalMinutes: 0,
        positions: {},
        isMotm: curr.fixtures.motm_player_id === player.id,
        isCaptain: player.fixture_team_selections?.some(
          selection => selection.fixture_id === fixtureId && selection.is_captain
        )
      }
    }
    
    // Get minutes directly from fixture_playing_periods
    const minutes = curr.fixture_playing_periods?.duration_minutes || 0
    
    acc[fixtureId].totalMinutes += minutes
    
    if (curr.position) {
      acc[fixtureId].positions[curr.position] = (acc[fixtureId].positions[curr.position] || 0) + minutes
    }
    
    return acc
  }, {} as Record<string, any>) || {}

  console.log('Processed games by fixture:', gamesByFixture)

  const sortedGames = Object.values(gamesByFixture).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  console.log('Sorted games:', sortedGames)

  // Calculate MOTM count correctly by counting unique fixtures where player was MOTM
  const motmCount = new Set(
    player.fixture_player_positions
      ?.filter(pos => pos.fixtures?.motm_player_id === player.id)
      .map(pos => pos.fixtures?.id)
  ).size

  console.log('MOTM count:', motmCount)

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
          recentGames={sortedGames || []}
        />
      </div>
    </div>
  )
}