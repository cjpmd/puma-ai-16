import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FestivalFormFields, formSchema, FormData } from "../FestivalFormFields";

interface FestivalFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  editingFestival?: any;
  selectedDate?: Date;
}

export const FestivalForm = ({ onSubmit, editingFestival, selectedDate }: FestivalFormProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: editingFestival?.date ? new Date(editingFestival.date) : selectedDate || new Date(),
      format: editingFestival?.format || "7-a-side",
      numberOfTeams: editingFestival?.number_of_teams || 2,
      location: editingFestival?.location || "",
      startTime: editingFestival?.start_time || "",
      endTime: editingFestival?.end_time || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FestivalFormFields form={form} />
        <Button type="submit" className="w-full">
          {editingFestival ? 'Update Festival' : 'Save and Continue to Team Selection'}
        </Button>
      </form>
    </Form>
  );
};