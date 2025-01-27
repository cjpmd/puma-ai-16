import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FestivalForm } from "./FestivalForm";
import { FestivalTeamSelection } from "./FestivalTeamSelection";

interface FestivalDialogContentProps {
  showTeamSelection: boolean;
  editingFestival?: any;
  selectedDate?: Date;
  onSubmit: (data: any) => Promise<void>;
  teams: Array<{ id: string; name: string; category: string }>;
  format: string;
  onTeamSelectionsChange: (selections: Record<string, Record<string, { playerId: string; position: string }>>) => void;
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
        <FestivalTeamSelection
          teams={teams}
          format={format}
          onTeamSelectionsChange={onTeamSelectionsChange}
        />
      )}
    </DialogContent>
  );
};