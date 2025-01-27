import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FestivalFormFields, formSchema, FormData } from "../FestivalFormFields";

interface TournamentFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  editingTournament?: any;
  selectedDate?: Date;
}

export const TournamentForm = ({ onSubmit, editingTournament, selectedDate }: TournamentFormProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: editingTournament?.date ? new Date(editingTournament.date) : selectedDate || new Date(),
      format: editingTournament?.format || "7-a-side",
      numberOfTeams: editingTournament?.number_of_teams || 2,
      location: editingTournament?.location || "",
      startTime: editingTournament?.time || "",
      endTime: editingTournament?.end_time || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FestivalFormFields form={form} />
        <Button type="submit" className="w-full">
          {editingTournament ? 'Update Tournament' : 'Save and Continue to Team Selection'}
        </Button>
      </form>
    </Form>
  );
};