import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FestivalForm } from "./FestivalForm";
import { TeamSelectionManager } from "@/components/TeamSelectionManager";

interface TeamSelection {
  playerId: string;
  position: string;
  is_substitute: boolean;
  performanceCategory?: string;
}

interface FestivalDialogContentProps {
  showTeamSelection: boolean;
  editingFestival?: any;
  selectedDate?: Date;
  onSubmit: (data: any) => Promise<void>;
  teams: Array<{ id: string; name: string; category: string }>;
  format: string;
  onTeamSelectionsChange: (selections: Record<string, TeamSelection[]>) => void;
}

export const FestivalDialogContent = ({
  showTeamSelection,
  editingFestival,
  selectedDate,
  onSubmit,
  teams,
  format,
  onTeamSelectionsChange,
}: FestivalDialogContentProps) => {
  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {editingFestival ? (showTeamSelection ? 'Team Selection' : 'Edit Festival') : 'Add New Festival'}
        </DialogTitle>
        <DialogDescription>
          {showTeamSelection 
            ? "Select players for each team in the festival."
            : "Fill in the festival details below. All fields marked with * are required."}
        </DialogDescription>
      </DialogHeader>

      {!showTeamSelection ? (
        <FestivalForm
          onSubmit={onSubmit}
          editingFestival={editingFestival}
          selectedDate={selectedDate}
        />
      ) : (
        <TeamSelectionManager
          teams={teams}
          format={format as "4-a-side" | "5-a-side" | "6-a-side" | "7-a-side" | "9-a-side" | "11-a-side"}
          onTeamSelectionsChange={(selections) => {
            // Convert selections to the expected format with proper typing
            const formattedSelections = Object.entries(selections).reduce<Record<string, TeamSelection[]>>((acc, [teamId, teamSelections]) => {
              acc[teamId] = Object.entries(teamSelections).map(([_, selection]) => ({
                playerId: selection.playerId,
                position: selection.position,
                is_substitute: selection.position.startsWith('sub-'),
                performanceCategory: selection.performanceCategory || 'MESSI'
              }));
              return acc;
            }, {});
            
            onTeamSelectionsChange(formattedSelections);
          }}
        />
      )}
    </DialogContent>
  );
};