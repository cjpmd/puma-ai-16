
import { useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
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

  const { data: players } = useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("id, name, squad_number")
        .order('name');
      
      if (error) {
        console.error("Error fetching players:", error);
        return [];
      }
      return data || [];
    },
    enabled: isOpen,
  });

  const onSubmit = async (data: FixtureFormData) => {
    try {
      setIsSubmitting(true);
      
      if (!selectedDate && !editingFixture?.date) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a date",
        });
        throw new Error("Date is required");
      }

      const savedData = await data;
      console.log("Fixture saved:", savedData);

      if (!editingFixture) {
        try {
          await sendFixtureNotification({
            type: 'FIXTURE',
            date: format(selectedDate || new Date(), "dd/MM/yyyy"),
            time: data.team_times?.[0]?.meeting_time,
            opponent: data.opponent,
            location: data.location,
            category: data.team_name,
            eventId: savedData.id
          });
        } catch (notificationError) {
          console.error('Error sending notification:', notificationError);
        }

        // Show success toast for new fixture
        toast({
          title: "Success",
          description: `New fixture against ${data.opponent} has been added to the calendar`,
        });
      } else {
        // Show success toast for edited fixture
        toast({
          title: "Success",
          description: `Fixture against ${data.opponent} has been updated`,
        });
      }

      // Force refetch with the specific date
      const formattedDate = format(selectedDate || new Date(), "yyyy-MM-dd");
      await queryClient.invalidateQueries({ 
        queryKey: ["fixtures", formattedDate]
      });
      
      // Also invalidate any potential date-specific queries
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "fixtures"
      });
      
      await onSuccess();
      
      if (!showTeamSelection) {
        onOpenChange(false);
      }

      return savedData;
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save fixture",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingFixture ? "Edit Fixture" : "Add New Fixture"}</DialogTitle>
          <DialogDescription>
            Fill in the fixture details below. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        
        {!showTeamSelection ? (
          <FixtureForm
            onSubmit={onSubmit}
            selectedDate={selectedDate}
            editingFixture={editingFixture}
            players={players}
            isSubmitting={isSubmitting}
            showDateSelector={showDateSelector}
          />
        ) : (
          <TeamSelectionManager 
            fixture={editingFixture || newFixture} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
