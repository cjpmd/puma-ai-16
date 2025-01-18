import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"

interface PlayerAttributesProps {
  attributes: Array<{
    id: string
    name: string
    value: number
  }>;
  playerId: string;
  playerType: string;
  playerCategory: string;
}

export function PlayerAttributes({ attributes, playerId, playerType, playerCategory }: PlayerAttributesProps) {
  return (
    <div className="border rounded-lg shadow-sm bg-white">
      <Collapsible>
        <CollapsibleTrigger className="flex w-full items-center justify-between p-6 hover:bg-accent/5 transition-colors">
          <h3 className="text-xl font-semibold">Attributes</h3>
          <ChevronDown className="h-5 w-5" />
        </CollapsibleTrigger>
        <CollapsibleContent className="p-6 pt-0">
          <ul className="space-y-2">
            {attributes?.map((attr) => (
              <li key={attr.id} className="flex justify-between items-center">
                <span className="text-gray-700">{attr.name}</span>
                <span className="font-semibold">{attr.value}</span>
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}