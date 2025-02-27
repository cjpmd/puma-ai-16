
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TeamSelectionManager } from "@/components/fixtures/TeamSelectionManager";
import { Fixture } from "@/types/fixture";

interface TeamSelectionDialogProps {
  fixture: Fixture;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TeamSelectionDialog = ({
  fixture,
  isOpen,
  onOpenChange,
}: TeamSelectionDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Team Selection - {fixture.opponent}</DialogTitle>
        </DialogHeader>
        
        <TeamSelectionManager 
          fixture={fixture} 
        />
      </DialogContent>
    </Dialog>
  );
};
