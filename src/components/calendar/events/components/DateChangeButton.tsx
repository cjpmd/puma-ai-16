import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface DateChangeButtonProps {
  date: string;
  onDateChange: (date: Date) => void;
}

export const DateChangeButton = ({ date, onDateChange }: DateChangeButtonProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <Calendar className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <CalendarComponent
          mode="single"
          selected={new Date(date)}
          onSelect={(date) => {
            if (date) {
              onDateChange(date);
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};