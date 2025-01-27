import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface CalendarViewProps {
  date: Date;
  onDateSelect: (date: Date | undefined) => void;
  sessions?: any[];
  fixtures?: any[];
  festivals?: any[];
  tournaments?: any[];
}

export const CalendarView = ({
  date,
  onDateSelect,
  sessions,
  fixtures,
  festivals,
  tournaments
}: CalendarViewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span>Training</span>
            <div className="w-3 h-3 rounded bg-orange-500 ml-4"></div>
            <span>Fixture</span>
            <div className="w-3 h-3 rounded bg-green-500 ml-4"></div>
            <span>Festival</span>
            <div className="w-3 h-3 rounded bg-purple-500 ml-4"></div>
            <span>Tournament</span>
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
              },
              festival: (day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                return festivals?.some(festival => festival.date === dateStr) || false;
              },
              tournament: (day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                return tournaments?.some(tournament => tournament.date === dateStr) || false;
              }
            }}
            modifiersStyles={{
              training: {
                backgroundColor: 'rgba(59, 130, 246, 0.1)'
              },
              fixture: {
                backgroundColor: 'rgba(249, 115, 22, 0.1)'
              },
              festival: {
                backgroundColor: 'rgba(34, 197, 94, 0.1)'
              },
              tournament: {
                backgroundColor: 'rgba(168, 85, 247, 0.1)'
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};