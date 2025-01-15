import { Badge } from "@/components/ui/badge"

interface PlayerHeaderProps {
  name: string
  squadNumber: number
  category: string
}

export function PlayerHeader({ name, squadNumber, category }: PlayerHeaderProps) {
  return (
    <div className="p-6 border rounded-lg shadow-sm bg-white">
      <h2 className="text-2xl font-bold">{name}</h2>
      <p className="text-gray-600 text-lg">#{squadNumber} · {category}</p>
    </div>
  )
}