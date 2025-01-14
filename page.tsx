import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: players, error } = await supabase
    .from('players')
    .select(`
      *,
      player_attributes (*)
    `)

  if (error) {
    console.error('Error fetching players:', error)
    return <div>Error loading players</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Players</h1>
      <ul className="space-y-2">
        {players?.map((player) => (
          <li key={player.id} className="p-2 border rounded">
            {player.name} - #{player.squad_number}
          </li>
        ))}
      </ul>
    </div>
  )
}