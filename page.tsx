import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: player, error } = await supabase
    .from('players')
    .select(`
      *,
      player_attributes (*)
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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Player Details</h1>
      <div className="p-2 border rounded">
        <h2 className="text-xl">{player.name} - #{player.squad_number}</h2>
        <p className="text-gray-600">Category: {player.player_category}</p>
        
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Attributes</h3>
          <ul className="space-y-1">
            {player.player_attributes?.map((attr) => (
              <li key={attr.id} className="flex justify-between">
                <span>{attr.name}</span>
                <span className="font-medium">{attr.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}