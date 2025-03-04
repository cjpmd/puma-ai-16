
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TeamSelectionManager } from "@/components/fixtures/TeamSelectionManager";
import { FixtureForm } from "@/components/fixtures/FixtureForm";
import { FixtureFormData } from "@/components/fixtures/schemas/fixtureFormSchema";
import { Fixture } from "@/types/fixture";
import { sendFixtureNotification } from "@/components/fixtures/FixtureNotification";

interface AddFixtureDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onSuccess: () => void;
  editingFixture?: Fixture | null;
  showDateSelector?: boolean;
}

export const AddFixtureDialog = ({ 
  isOpen, 
  onOpenChange, 
  selectedDate: initialSelectedDate,
  onSuccess,
  editingFixture,
  showDateSelector = false
}: AddFixtureDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialSelectedDate);
  const [newFixture, setNewFixture] = useState<Fixture | null>(null);
  const [preventDuplicateSubmission, setPreventDuplicateSubmission] = useState(false);
  const [formKey, setFormKey] = useState(0); // Add a key to force re-render of the form

  // Reset form key when dialog opens or closes to force re-render
  useEffect(() => {
    setFormKey(prev => prev + 1);
  }, [isOpen]);

  // Log when component mounts and when editing fixture changes
  useEffect(() => {
    console.log("AddFixtureDialog mounted/updated with editingFixture:", editingFixture);
    
    // Initialize selectedDate when editingFixture changes
    if (editingFixture?.date) {
      setSelectedDate(new Date(editingFixture.date));
    } else if (initialSelectedDate) {
      setSelectedDate(initialSelectedDate);
    }
    
    // Reset prevention of duplicate submissions when dialog opens/closes
    if (isOpen) {
      setPreventDuplicateSubmission(false);
    }
  }, [editingFixture, initialSelectedDate, isOpen]);

  // Fetch fixture details with team times and team scores if editing
  const fixtureDetails = editingFixture ? queryClient.getQueryData<Fixture>(["fixture-details", editingFixture?.id]) : null;

  // Merge fetched fixture details with the editingFixture prop
  const completeFixture = fixtureDetails ? {
    ...editingFixture,
    ...fixtureDetails,
    fixture_team_times: fixtureDetails.fixture_team_times,
    fixture_team_scores: fixtureDetails.fixture_team_scores
  } : editingFixture;

  console.log("Complete fixture for editing:", completeFixture);
  
  // Log MOTM player IDs if available
  useEffect(() => {
    if (completeFixture?.fixture_team_scores) {
      const motmPlayerIds = completeFixture.fixture_team_scores.map(score => score.motm_player_id);
      console.log("MOTM player IDs from fixture_team_scores:", motmPlayerIds);
    }
  }, [completeFixture]);

  const onSubmit = async (data: FixtureFormData): Promise<FixtureFormData> => {
    try {
      // Prevent duplicate submissions
      if (preventDuplicateSubmission) {
        console.log("Preventing duplicate submission");
        return data; // Return the original data if we're preventing duplicate submission
      }
      
      setPreventDuplicateSubmission(true);
      setIsSubmitting(true);
      
      if (!selectedDate && !editingFixture?.date) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a date",
        });
        throw new Error("Date is required");
      }

      // Let the parent component know about the submission
      onSuccess();
      
      // We'll treat data as the enhanced fixture for our purposes
      setNewFixture(data as unknown as Fixture);
      
      if (!showTeamSelection) {
        onOpenChange(false);
      }

      return data;
    } catch (error) {
      console.error("Error in onSubmit:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
      // We do not reset preventDuplicateSubmission here to prevent multiple clicks
    }
  };

  // Get players from the query cache if available
  const players = queryClient.getQueryData<any[]>(["players"]) || [];
  const isLoading = isSubmitting || preventDuplicateSubmission;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      // Reset prevention when dialog closes
      if (!open) {
        setPreventDuplicateSubmission(false);
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingFixture ? "Edit Fixture" : "Add New Fixture"}</DialogTitle>
          <DialogDescription>
            Fill in the fixture details below. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading && (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading fixture data...</span>
          </div>
        )}
        
        {!isLoading && !showTeamSelection && (
          <FixtureForm
            key={formKey} // Use the key to force re-render
            onSubmit={onSubmit}
            selectedDate={selectedDate}
            editingFixture={completeFixture}
            players={players}
            isSubmitting={isSubmitting || preventDuplicateSubmission}
            showDateSelector={showDateSelector}
          />
        )}
        
        {!isLoading && showTeamSelection && (
          <TeamSelectionManager 
            fixture={editingFixture || newFixture} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
