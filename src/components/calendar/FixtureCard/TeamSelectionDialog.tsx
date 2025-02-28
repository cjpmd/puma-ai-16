
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TeamSelectionManager } from "@/components/fixtures/TeamSelectionManager";
import { Fixture } from "@/types/fixture";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  
  const handleSuccess = () => {
    toast({
      title: "Success",
      description: "Team selections saved successfully",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Team Selection - {fixture.opponent}</DialogTitle>
          <DialogDescription>
            Configure team positions, captains and performance categories
          </DialogDescription>
        </DialogHeader>
        
        <TeamSelectionManager 
          fixture={fixture}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};
