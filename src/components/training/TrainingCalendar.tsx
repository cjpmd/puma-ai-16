import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface TrainingCalendarProps {
  date: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

export const TrainingCalendar = ({ date, onDateSelect }: TrainingCalendarProps) => {
  // Query for training sessions
  const { data: trainingSessions } = useQuery({
    queryKey: ["training-sessions-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_sessions")
        .select("date");
      
      if (error) throw error;
      return data.map(session => session.date);
    },
  });

  // Query for fixtures
  const { data: fixtures } = useQuery({
    queryKey: ["fixtures-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixtures")
        .select("date");
      
      if (error) throw error;
      return data.map(fixture => fixture.date);
    },
  });

  // Create a modifier for days with events
  const modifiers = {
    training: trainingSessions?.map(date => new Date(date)) || [],
    fixture: fixtures?.map(date => new Date(date)) || [],
  };

  // Custom styles for the modifiers
  const modifiersStyles = {
    training: {
      backgroundColor: "rgba(74, 222, 128, 0.2)", // Light green for training
      borderRadius: "0",
    },
    fixture: {
      backgroundColor: "rgba(59, 130, 246, 0.2)", // Light blue for fixtures
      borderRadius: "0",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateSelect}
          className="rounded-md border"
          weekStartsOn={1} // Start week on Monday
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          showOutsideDays
        />
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-green-400/20" />
            <span>Training</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-blue-400/20" />
            <span>Fixture</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};