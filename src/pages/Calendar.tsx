import { useState } from "react";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { EventsList } from "@/components/calendar/EventsList";
import { EditObjectiveDialog } from "@/components/calendar/EditObjectiveDialog";

export const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Calendar</h1>
      <CalendarHeader selectedDate={selectedDate} onDateChange={handleDateChange} />
      <CalendarGrid selectedDate={selectedDate} onEventClick={handleEventClick} />
      <EventsList selectedDate={selectedDate} onEventClick={handleEventClick} />
      <EditObjectiveDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        event={selectedEvent}
      />
    </div>
  );
};
