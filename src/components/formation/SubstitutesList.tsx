
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface SubstitutesListProps {
  maxSubstitutes: number;
  selections: Record<string, { playerId: string; position: string }>;
  availablePlayers?: any[];
  onSelectionChange: (slotId: string, playerId: string, position: string) => void;
  selectedPlayers?: Set<string>;
}

export const SubstitutesList = ({
  maxSubstitutes,
  selections,
  availablePlayers,
  onSelectionChange,
  selectedPlayers = new Set(),
}: SubstitutesListProps) => {
  // Use a ref to track which substitute slots have been initialized
  const initializedSlotsRef = useRef<Set<string>>(new Set());
  
  // Initialize substitute slots with any existing data
  useEffect(() => {
    // Look for any substitute selections in the current selections object
    // This is needed to ensure substitutes persist properly
    Object.entries(selections).forEach(([slotId, selection]) => {
      if (selection.position === "sub" && !slotId.startsWith("sub-")) {
        // Found a substitute that isn't in a standard "sub-X" slot
        // We should transfer it to the proper format if possible
        const availableSubSlots = Array.from({length: maxSubstitutes})
          .map((_, i) => `sub-${i}`)
          .filter(id => !Object.keys(selections).includes(id));
          
        if (availableSubSlots.length > 0) {
          // Only transfer if we have an available slot
          const targetSlot = availableSubSlots[0];
          initializedSlotsRef.current.add(targetSlot);
          
          // This will trigger a selection change that the parent will save
          onSelectionChange(targetSlot, selection.playerId, "sub");
        }
      }
    });
  }, []);

  return (
    <div className="border-t pt-6">
      <Label className="text-sm font-medium mb-4">Substitutes ({maxSubstitutes} max)</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
        {Array.from({ length: maxSubstitutes }).map((_, index) => {
          const slotId = `sub-${index}`;
          const currentPlayerId = selections[slotId]?.playerId || "unassigned";
          
          return (
            <div key={slotId}>
              <Label className="text-xs text-muted-foreground">Substitute {index + 1}</Label>
              <Select
                value={currentPlayerId}
                onValueChange={(value) => onSelectionChange(slotId, value, "sub")}
              >
                <SelectTrigger className="text-left h-9">
                  <SelectValue placeholder="Select substitute" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">None</SelectItem>
                  {availablePlayers?.map(player => (
                    <SelectItem 
                      key={player.id} 
                      value={player.id}
                      className={cn(
                        selectedPlayers.has(player.id) && player.id !== currentPlayerId && "opacity-50"
                      )}
                    >
                      {player.name} {player.squad_number ? `(${player.squad_number})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>
    </div>
  );
};
