
import { useState, useEffect } from "react";
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

  // Log when component mounts and when editing fixture changes
  useEffect(() => {
    console.log("AddFixtureDialog mounted/updated with editingFixture:", editingFixture);
    
    // Initialize selectedDate when editingFixture changes
    if (editingFixture?.date) {
      setSelectedDate(new Date(editingFixture.date));
    } else if (initialSelectedDate) {
      setSelectedDate(initialSelectedDate);
    }
  }, [editingFixture, initialSelectedDate, isOpen]);

  // Fetch fixture details with team times and team scores if editing
  const { data: fixtureDetails, isLoading: isLoadingFixtureDetails } = useQuery({
    queryKey: ["fixture-details", editingFixture?.id],
    queryFn: async () => {
      if (!editingFixture?.id) return null;
      
      console.log("Fetching fixture details for ID:", editingFixture.id);
      
      try {
        const { data, error } = await supabase
          .from("fixtures")
          .select(`
            *,
            fixture_team_times(*),
            fixture_team_scores(*)
          `)
          .eq("id", editingFixture.id)
          .single();
        
        if (error) {
          console.error("Error fetching fixture details:", error);
          return null;
        }
        
        console.log("Fetched fixture details:", data);
        return data;
      } catch (err) {
        console.error("Exception fetching fixture details:", err);
        return null;
      }
    },
    enabled: !!editingFixture?.id && isOpen,
    retry: 1,
    staleTime: 0, // Don't cache this data
    refetchOnMount: true
  });

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

  const { data: players, isLoading: isLoadingPlayers } = useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("players")
          .select("id, name, squad_number")
          .order('name');
        
        if (error) {
          console.error("Error fetching players:", error);
          return [];
        }
        console.log("Fetched players:", data?.length || 0);
        return data || [];
      } catch (err) {
        console.error("Exception fetching players:", err);
        return [];
      }
    },
    enabled: isOpen,
    retry: 1,
    staleTime: 5 * 60 * 1000 // 5 minutes
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

      const dateToUse = selectedDate 
        ? format(selectedDate, "yyyy-MM-dd") 
        : editingFixture?.date 
          ? format(new Date(editingFixture.date), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd");
      
      console.log("Creating fixture with date:", dateToUse);
      console.log("Form data:", data);
      console.log("MOTM player IDs:", data.motm_player_ids);
      
      const fixtureData = {
        opponent: data.opponent,
        location: data.location,
        team_name: data.team_name,
        format: data.format,
        number_of_teams: parseInt(data.number_of_teams || "1"),
        is_home: data.is_home,
        date: dateToUse,
        motm_player_id: data.motm_player_ids?.[0] || null, // Store first team's MOTM in main table
        team_1_score: data.team_1_score !== undefined ? data.team_1_score : null,
        opponent_1_score: data.opponent_1_score !== undefined ? data.opponent_1_score : null,
        team_2_score: data.team_2_score !== undefined ? data.team_2_score : null,
        opponent_2_score: data.opponent_2_score !== undefined ? data.opponent_2_score : null,
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
          .select()
          .single();
          
        if (error) throw error;
        savedFixture = updated;
      } else {
        const { data: created, error } = await supabase
          .from('fixtures')
          .insert(fixtureData)
          .select()
          .single();
          
        if (error) throw error;
        savedFixture = created;

        if (savedFixture) {
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
        }
      }

      // Save team times with performance categories
      if (savedFixture && data.team_times) {
        // Delete existing team times
        if (editingFixture?.id) {
          await supabase
            .from('fixture_team_times')
            .delete()
            .eq('fixture_id', savedFixture.id);
        }
          
        // Insert new team times
        const teamTimesPromises = data.team_times.map((teamTime, index) => {
          return supabase
            .from('fixture_team_times')
            .insert({
              fixture_id: savedFixture.id,
              team_number: index + 1,
              meeting_time: teamTime.meeting_time || null,
              start_time: teamTime.start_time || null,
              end_time: teamTime.end_time || null,
              performance_category: teamTime.performance_category || "MESSI"
            });
        });
        
        await Promise.all(teamTimesPromises);
        console.log("Saved team times with performance categories");
      }

      // Save team scores with MOTM player IDs
      if (savedFixture && data.motm_player_ids) {
        // Delete existing scores first if editing
        if (editingFixture?.id) {
          const { error: deleteScoresError } = await supabase
            .from('fixture_team_scores')
            .delete()
            .eq('fixture_id', savedFixture.id);
            
          if (deleteScoresError) {
            console.error("Error deleting existing team scores:", deleteScoresError);
          }
        }

        console.log("Number of teams:", data.number_of_teams);
        console.log("MOTM player IDs array:", data.motm_player_ids);

        const teamScoresData = Array.from({ length: parseInt(data.number_of_teams || "1") }).map((_, index) => {
          const teamScore = data[`team_${index + 1}_score` as keyof typeof data];
          const opponentScore = data[`opponent_${index + 1}_score` as keyof typeof data];
          
          // Ensure we get the MOTM player ID for this team index
          const motmPlayerId = data.motm_player_ids && index < data.motm_player_ids.length 
            ? data.motm_player_ids[index] 
            : null;
          
          console.log(`Building team ${index + 1} score:`, {
            teamScore,
            opponentScore,
            motmPlayerId
          });

          return {
            fixture_id: savedFixture.id,
            team_number: index + 1,
            score: teamScore === undefined ? null : teamScore,
            opponent_score: opponentScore === undefined ? null : opponentScore,
            motm_player_id: motmPlayerId === "" ? null : motmPlayerId
          };
        });

        console.log("Team scores data to save:", teamScoresData);

        if (teamScoresData.length > 0) {
          const { data: scoresResult, error: scoresError } = await supabase
            .from('fixture_team_scores')
            .upsert(teamScoresData)
            .select();

          if (scoresError) {
            console.error("Error saving team scores:", scoresError);
          } else {
            console.log("Team scores saved with MOTM player IDs:", scoresResult);
          }
        }
      }

      console.log("Fixture saved successfully:", savedFixture);
      
      // Invalidate all fixture queries to ensure calendar is updated
      await queryClient.invalidateQueries({ 
        queryKey: ["fixtures"]
      });
      
      if (dateToUse) {
        await queryClient.invalidateQueries({ 
          queryKey: ["fixtures", dateToUse]
        });
      }
      
      // Add team times data to savedFixture
      const enhancedFixture = {
        ...savedFixture,
        team_times: data.team_times,
        motm_player_ids: data.motm_player_ids
      };
      
      setNewFixture(enhancedFixture);
      
      await onSuccess();
      
      if (!showTeamSelection) {
        onOpenChange(false);
      }

      toast({
        title: "Success",
        description: editingFixture ? "Fixture updated successfully" : "New fixture has been added to the calendar",
      });

      return enhancedFixture;
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

  // Loading state
  const isLoading = isLoadingFixtureDetails || isLoadingPlayers;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingFixture ? "Edit Fixture" : "Add New Fixture"}</DialogTitle>
          <DialogDescription>
            Fill in the fixture details below. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading fixture data...</span>
          </div>
        ) : !showTeamSelection ? (
          <FixtureForm
            onSubmit={onSubmit}
            selectedDate={selectedDate}
            editingFixture={completeFixture}
            players={players || []}
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
