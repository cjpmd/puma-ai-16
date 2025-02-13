
import { useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
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

  const onSubmit = async (data: FixtureFormData): Promise<FixtureFormData> => {
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

      // Determine outcome
      let outcome: string | null = null;
      const homeScore = parseInt(data.home_score) || 0;
      const awayScore = parseInt(data.away_score) || 0;

      if (homeScore > awayScore) {
        outcome = 'WIN';
      } else if (homeScore === awayScore) {
        outcome = 'DRAW';
      } else if (homeScore < awayScore) {
        outcome = 'LOSS';
      }

      // We'll let the FixtureForm handle the data saving now
      const savedData = { ...data, id: editingFixture?.id };

      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ["team-data"] });
      
      onSuccess();
      if (!showTeamSelection) {
        onOpenChange(false);
      }
      toast({
        title: "Success",
        description: editingFixture 
          ? "Fixture updated successfully" 
          : "Fixture added successfully",
      });

      return savedData;
    } catch (error) {
      console.error("Error saving fixture:", error);
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
