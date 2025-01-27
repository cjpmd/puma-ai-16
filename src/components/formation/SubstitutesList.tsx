import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SubstitutesListProps {
  maxSubstitutes: number;
  selections: Record<string, { playerId: string; position: string }>;
  availablePlayers?: any[];
  onSelectionChange: (slotId: string, playerId: string, position: string) => void;
}

export const SubstitutesList = ({
  maxSubstitutes,
  selections,
  availablePlayers,
  onSelectionChange,
}: SubstitutesListProps) => {
  return (
    <div className="border-t pt-6">
      <Label className="text-sm font-medium mb-4">Substitutes ({maxSubstitutes} max)</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
        {Array.from({ length: maxSubstitutes }).map((_, index) => (
          <div key={`sub-${index}`}>
            <Label className="text-xs text-muted-foreground">Substitute {index + 1}</Label>
            <Select
              value={selections[`sub-${index}`]?.playerId || "unassigned"}
              onValueChange={(value) => onSelectionChange(`sub-${index}`, value, "sub")}
            >
              <SelectTrigger className="text-left h-9">
                <SelectValue placeholder="Select substitute" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">None</SelectItem>
                {availablePlayers?.map(player => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name} ({player.squad_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
};