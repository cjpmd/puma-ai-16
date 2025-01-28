import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import type { FormData } from "@/components/calendar/FestivalFormFields";
import { Database } from "@/integrations/supabase/types";

type Tournament = Database["public"]["Tables"]["tournaments"]["Row"];

export const useTournamentForm = (
  onSuccess: () => void,
  editingTournament?: Tournament | null
) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      const tournamentData = {
        date: format(data.date, "yyyy-MM-dd"),
        time: data.startTime || null,
        end_time: data.endTime || null,
        location: data.location || null,
        format: data.format,
        number_of_teams: data.numberOfTeams,
        system_category: "TOURNAMENT",
      };

      let tournament;
      if (editingTournament) {
        const { data: updatedTournament, error } = await supabase
          .from("tournaments")
          .update(tournamentData)
          .eq("id", editingTournament.id)
          .select()
          .single();

        if (error) throw error;
        tournament = updatedTournament;
      } else {
        const { data: newTournament, error } = await supabase
          .from("tournaments")
          .insert(tournamentData)
          .select()
          .single();

        if (error) throw error;
        tournament = newTournament;
      }

      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-data"] });

      toast({
        title: "Success",
        description: `Tournament ${editingTournament ? 'updated' : 'created'} successfully`,
      });

      onSuccess();
    } catch (error) {
      console.error("Error saving tournament:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save tournament",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    handleSubmit,
  };
};