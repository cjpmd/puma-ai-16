import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import type { FormData } from "@/components/calendar/FestivalFormFields";

export const useFestivalForm = (
  onSuccess: () => void,
  editingFestival?: any
) => {
  const { toast } = useToast();

  const handleSubmit = async (data: FormData) => {
    try {
      const festivalData = {
        date: format(data.date, "yyyy-MM-dd"),
        start_time: data.startTime || null,
        end_time: data.endTime || null,
        location: data.location || null,
        format: data.format,
        number_of_teams: data.numberOfTeams,
        system_category: 'FESTIVAL',
      };

      if (editingFestival) {
        const { error } = await supabase
          .from("festivals")
          .update(festivalData)
          .eq("id", editingFestival.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("festivals")
          .insert(festivalData);

        if (error) throw error;
      }

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
    }
  };

  return {
    handleSubmit,
  };
};