import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface CalendarViewProps {
  date: Date;
  onDateSelect: (date: Date | undefined) => void;
  sessions?: any[];
  fixtures?: any[];
}

export const CalendarView = ({
  date,
  onDateSelect,
  sessions,
  fixtures
}: CalendarViewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span>Training</span>
            <div className="w-3 h-3 rounded bg-orange-500 ml-4"></div>
            <span>Fixture</span>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateSelect}
            className="rounded-md border"
            weekStartsOn={1}
            modifiers={{
              training: (day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                return sessions?.some(session => session.date === dateStr) || false;
              },
              fixture: (day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                return fixtures?.some(fixture => fixture.date === dateStr) || false;
              }
            }}
            modifiersStyles={{
              training: {
                backgroundColor: 'rgba(59, 130, 246, 0.1)'
              },
              fixture: {
                backgroundColor: 'rgba(249, 115, 22, 0.1)'
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};