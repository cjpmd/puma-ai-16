
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

      const dateToUse = selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
      
      const fixtureData = {
        opponent: data.opponent,
        location: data.location,
        team_name: data.team_name,
        format: data.format,
        number_of_teams: parseInt(data.number_of_teams || "1"),
        is_home: data.is_home,
        home_score: data.home_score ? parseInt(data.home_score) : null,
        away_score: data.away_score ? parseInt(data.away_score) : null,
        date: dateToUse,
        potm_player_id: data.motm_player_ids?.[0] || null,
        meeting_time: data.team_times?.[0]?.meeting_time || null,
        start_time: data.team_times?.[0]?.start_time || null,
        end_time: data.team_times?.[0]?.end_time || null
      };

      let savedFixture;
      
      if (editingFixture?.id) {
        const { data: updated, error } = await supabase
          .from('fixtures')
          .update(fixtureData)
          .eq('id', editingFixture.id)
          .select(`
            *,
            fixture_team_times (
              meeting_time,
              start_time,
              end_time,
              performance_category,
              team_number
            )
          `)
          .single();
          
        if (error) throw error;
        savedFixture = updated;

        // Update team times
        if (data.team_times?.length > 0) {
          const { error: teamTimesError } = await supabase
            .from('fixture_team_times')
            .upsert(data.team_times.map((teamTime, index) => ({
              fixture_id: editingFixture.id,
              team_number: index + 1,
              meeting_time: teamTime.meeting_time || null,
              start_time: teamTime.start_time || null,
              end_time: teamTime.end_time || null,
              performance_category: teamTime.performance_category || "MESSI"
            })));

          if (teamTimesError) throw teamTimesError;
        }
      } else {
        const { data: created, error } = await supabase
          .from('fixtures')
          .insert(fixtureData)
          .select(`
            *,
            fixture_team_times (
              meeting_time,
              start_time,
              end_time,
              performance_category,
              team_number
            )
          `)
          .single();
          
        if (error) throw error;
        savedFixture = created;

        // Insert team times for new fixture
        if (data.team_times?.length > 0 && savedFixture.id) {
          const { error: teamTimesError } = await supabase
            .from('fixture_team_times')
            .insert(data.team_times.map((teamTime, index) => ({
              fixture_id: savedFixture.id,
              team_number: index + 1,
              meeting_time: teamTime.meeting_time || null,
              start_time: teamTime.start_time || null,
              end_time: teamTime.end_time || null,
              performance_category: teamTime.performance_category || "MESSI"
            })));

          if (teamTimesError) throw teamTimesError;
        }
      }

      if (!editingFixture && savedFixture) {
        try {
          await sendFixtureNotification({
            type: 'FIXTURE',
            date: format(selectedDate || new Date(), "dd/MM/yyyy"),
            time: data.team_times?.[0]?.meeting_time,
            opponent: data.opponent,
            location: data.location,
            category: data.team_name,
            eventId: savedFixture.id
          });
        } catch (notificationError) {
          console.error('Error sending notification:', notificationError);
        }

        toast({
          title: "Success",
          description: `New fixture against ${data.opponent} has been added to the calendar`,
        });
      } else {
        toast({
          title: "Success",
          description: `Fixture against ${data.opponent} has been updated`,
        });
      }

      await queryClient.invalidateQueries({ 
        queryKey: ["fixtures", dateToUse]
      });
      
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "fixtures"
      });
      
      await onSuccess();
      
      if (!showTeamSelection) {
        onOpenChange(false);
      }

      return savedFixture;
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
