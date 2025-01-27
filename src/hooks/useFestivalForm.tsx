import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import type { FormData } from "@/components/calendar/FestivalFormFields";

export const useFestivalForm = (
  onSuccess: () => void,
  editingFestival?: any
) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      const festivalData = {
        date: format(data.date, "yyyy-MM-dd"),
        start_time: data.startTime || null,
        end_time: data.endTime || null,
        location: data.location || null,
        format: data.format,
        number_of_teams: data.numberOfTeams,
        system_category: "FESTIVAL",
      };

      let festival;
      if (editingFestival) {
        const { data: updatedFestival, error } = await supabase
          .from("festivals")
          .update(festivalData)
          .eq("id", editingFestival.id)
          .select()
          .single();

        if (error) throw error;
        festival = updatedFestival;
      } else {
        const { data: newFestival, error } = await supabase
          .from("festivals")
          .insert(festivalData)
          .select()
          .single();

        if (error) throw error;
        festival = newFestival;
      }

      queryClient.invalidateQueries({ queryKey: ["festivals"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-data"] });

      toast({
        title: "Success",
        description: `Festival ${editingFestival ? 'updated' : 'created'} successfully`,
      });

      onSuccess();
    } catch (error) {
      console.error("Error saving festival:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save festival",
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