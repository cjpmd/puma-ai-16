import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Plus, Printer } from "lucide-react";

interface TeamSelectionHeaderProps {
  players: Array<{ id: string; name: string; squad_number: number }>;
  captain: string;
  onCaptainChange: (value: string) => void;
  onShowFormationToggle: () => void;
  showFormation: boolean;
  onAddPeriod: () => void;
  onPrint: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export const TeamSelectionHeader = ({
  players,
  captain,
  onCaptainChange,
  onShowFormationToggle,
  showFormation,
  onAddPeriod,
  onPrint,
  onSave,
  isSaving,
}: TeamSelectionHeaderProps) => {
  return (
    <div className="sticky top-0 z-10 bg-background pt-4 pb-2 border-b">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 mr-auto">
          <span className="font-medium">Captain:</span>
          <Select value={captain} onValueChange={onCaptainChange}>
            <SelectTrigger className="w-[200px] h-8">
              <SelectValue placeholder="Select captain" />
            </SelectTrigger>
            <SelectContent>
              {players?.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.name} (#{player.squad_number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={onShowFormationToggle} 
          variant="outline"
          className="print:hidden"
        >
          <LayoutGrid className="h-4 w-4 mr-2" />
          {showFormation ? "Hide" : "Show"} Formation
        </Button>
        <Button onClick={onAddPeriod} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Period
        </Button>
        <Button 
          onClick={onPrint}
          variant="outline"
          className="print:hidden"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print Team Selection
        </Button>
        <Button 
          onClick={onSave} 
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};