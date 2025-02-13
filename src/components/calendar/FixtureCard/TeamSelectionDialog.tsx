
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TeamSelectionManager } from "@/components/fixtures/TeamSelectionManager";
import type { Fixture } from "@/types/fixture";

interface TeamSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fixture: Fixture;
}

export const TeamSelectionDialog = ({
  isOpen,
  onOpenChange,
  fixture,
}: TeamSelectionDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Team Selection - {fixture.opponent}</DialogTitle>
        </DialogHeader>
        <TeamSelectionManager fixture={fixture} />
      </DialogContent>
    </Dialog>
  );
};
