import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TournamentForm } from "./TournamentForm";
import { TeamSelectionManager } from "@/components/TeamSelectionManager";

type FormatType = "4-a-side" | "5-a-side" | "6-a-side" | "7-a-side" | "9-a-side" | "11-a-side";

interface TournamentDialogContentProps {
  showTeamSelection: boolean;
  editingTournament?: any;
  selectedDate?: Date;
  onSubmit: (data: any) => Promise<void>;
  teams: Array<{ id: string; name: string; category: string }>;
  format: FormatType;
  onTeamSelectionsChange: (selections: Record<string, Record<string, string>>) => void;
}

export const TournamentDialogContent = ({
  showTeamSelection,
  editingTournament,
  selectedDate,
  onSubmit,
  teams,
  format,
  onTeamSelectionsChange,
}: TournamentDialogContentProps) => {
  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {editingTournament ? (showTeamSelection ? 'Team Selection' : 'Edit Tournament') : 'Add New Tournament'}
        </DialogTitle>
        <DialogDescription>
          {showTeamSelection 
            ? "Select players for each team in the tournament."
            : "Fill in the tournament details below. All fields marked with * are required."}
        </DialogDescription>
      </DialogHeader>

      {!showTeamSelection ? (
        <TournamentForm
          onSubmit={onSubmit}
          editingTournament={editingTournament}
          selectedDate={selectedDate}
        />
      ) : (
        <TeamSelectionManager
          teams={teams}
          format={format}
          onTeamSelectionsChange={onTeamSelectionsChange}
        />
      )}
    </DialogContent>
  );
};