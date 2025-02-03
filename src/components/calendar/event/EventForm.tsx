import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CommonEventFields } from "./CommonEventFields";
import { MatchEventFields } from "./MatchEventFields";

interface EventFormProps {
  onSubmit: (data: any) => void;
  selectedDate?: Date;
  editingEvent?: any;
  eventType: 'fixture' | 'friendly' | 'tournament' | 'festival';
}

export const EventForm = ({
  onSubmit,
  selectedDate,
  editingEvent,
  eventType
}: EventFormProps) => {
  const form = useForm({
    defaultValues: {
      date: selectedDate || new Date(),
      meetingTime: editingEvent?.meeting_time || "",
      startTime: editingEvent?.start_time || "",
      endTime: editingEvent?.end_time || "",
      location: editingEvent?.location || "",
      format: editingEvent?.format || "7-a-side",
      numberOfTeams: editingEvent?.number_of_teams || 1,
      teamName: editingEvent?.team_name || "",
      opponent: editingEvent?.opponent || "",
      isHome: editingEvent?.is_home ?? true,
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CommonEventFields form={form} />
        
        {(eventType === 'fixture' || eventType === 'friendly') && (
          <MatchEventFields form={form} />
        )}

        <div className="flex justify-end">
          <Button type="submit">
            {editingEvent ? 'Update' : 'Create'} {eventType}
          </Button>
        </div>
      </form>
    </Form>
  );
};