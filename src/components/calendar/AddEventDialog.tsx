import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventForm } from "./event/EventForm";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface AddEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onSuccess: () => void;
  editingEvent?: any;
  eventType?: 'fixture' | 'friendly' | 'tournament' | 'festival';
}

export const AddEventDialog = ({
  isOpen,
  onOpenChange,
  selectedDate,
  onSuccess,
  editingEvent,
  eventType: initialEventType
}: AddEventDialogProps) => {
  const { toast } = useToast();
  const [eventType, setEventType] = useState<'fixture' | 'friendly' | 'tournament' | 'festival'>(
    initialEventType || 'fixture'
  );

  const handleSubmit = async (data: any) => {
    try {
      const eventData = {
        date: format(data.date, "yyyy-MM-dd"),
        meeting_time: data.meetingTime,
        start_time: data.startTime,
        end_time: data.endTime,
        location: data.location,
        format: data.format,
        number_of_teams: data.numberOfTeams,
        team_name: data.teamName,
        system_category: eventType.toUpperCase(),
        ...(eventType === 'fixture' || eventType === 'friendly' ? {
          opponent: data.opponent,
          is_home: data.isHome,
          is_friendly: eventType === 'friendly',
          category: data.teamName // Use teamName as category
        } : {})
      };

      let savedEvent;
      let tableName: "fixtures" | "tournaments" | "festivals";

      // Determine the correct table name based on event type
      if (eventType === 'fixture' || eventType === 'friendly') {
        tableName = "fixtures";
      } else if (eventType === 'tournament') {
        tableName = "tournaments";
      } else {
        tableName = "festivals";
      }

      if (editingEvent) {
        const { error } = await supabase
          .from(tableName)
          .update(eventData)
          .eq('id', editingEvent.id);
          
        if (error) throw error;
        savedEvent = { ...editingEvent, ...eventData };
      } else {
        const { data: insertedEvent, error } = await supabase
          .from(tableName)
          .insert(eventData)
          .select()
          .single();
          
        if (error) throw error;
        savedEvent = insertedEvent;
      }

      toast({
        title: "Success",
        description: `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} ${editingEvent ? 'updated' : 'created'} successfully`,
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(`Error saving ${eventType}:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to save ${eventType}`,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {editingEvent ? `Edit ${eventType}` : 'Add New Event'}
          </DialogTitle>
        </DialogHeader>

        {!editingEvent && (
          <Tabs defaultValue={eventType} onValueChange={(value) => setEventType(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="fixture">Fixture</TabsTrigger>
              <TabsTrigger value="friendly">Friendly</TabsTrigger>
              <TabsTrigger value="tournament">Tournament</TabsTrigger>
              <TabsTrigger value="festival">Festival</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <EventForm
          onSubmit={handleSubmit}
          selectedDate={selectedDate}
          editingEvent={editingEvent}
          eventType={eventType}
        />
      </DialogContent>
    </Dialog>
  );
};