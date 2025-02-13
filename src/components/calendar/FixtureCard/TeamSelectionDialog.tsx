
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TeamSelectionManager } from "@/components/fixtures/TeamSelectionManager";
import type { Fixture } from "@/types/fixture";

interface TeamSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fixture: Fixture;
  onSuccess: () => void;
}

export const TeamSelectionDialog = ({
  isOpen,
  onOpenChange,
  fixture,
  onSuccess,
}: TeamSelectionDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <TeamSelectionManager 
          fixture={fixture} 
          onSave={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};
