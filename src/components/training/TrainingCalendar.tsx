import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrainingCalendarProps {
  date: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

export const TrainingCalendar = ({ date, onDateSelect }: TrainingCalendarProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateSelect}
          className="rounded-md border"
        />
      </CardContent>
    </Card>
  );
};