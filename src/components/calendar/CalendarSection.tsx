
import { Calendar } from "@/components/ui/calendar";
import { ObjectivesList } from "@/components/calendar/ObjectivesList";

interface CalendarSectionProps {
  date: Date;
  setDate: (date: Date) => void;
  objectives: any[];
  onEditObjective?: (objective: any) => void;
}

export const CalendarSection = ({
  date,
  setDate,
  objectives,
  onEditObjective
}: CalendarSectionProps) => {
  // Default handler for objective editing if none is provided
  const handleEditObjective = (objective: any) => {
    if (onEditObjective) {
      onEditObjective(objective);
    } else {
      console.log("Edit objective handler not provided", objective);
    }
  };

  return (
    <div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={(newDate) => newDate && setDate(newDate)}
        className="rounded-md border shadow"
      />
      <ObjectivesList 
        date={date}
        objectives={objectives} 
        onEditObjective={handleEditObjective} 
      />
    </div>
  );
};
