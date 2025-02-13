
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Pencil, Trash2, Users } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import type { Fixture } from "@/types/fixture";

interface FixtureCardHeaderProps {
  fixture: Fixture;
  isCalendarOpen: boolean;
  setIsCalendarOpen: (open: boolean) => void;
  onEdit: (fixture: Fixture) => void;
  onDelete: (fixtureId: string) => void;
  onTeamSelection: () => void;
  onDateChange: (date: Date) => void;
}

export const FixtureCardHeader = ({
  fixture,
  isCalendarOpen,
  setIsCalendarOpen,
  onEdit,
  onDelete,
  onTeamSelection,
  onDateChange,
}: FixtureCardHeaderProps) => {
  const getFixtureTitle = () => {
    if (fixture.is_home) {
      return `${fixture.team_name} vs ${fixture.opponent}`;
    }
    return `${fixture.opponent} vs ${fixture.team_name}`;
  };

  return (
    <CardHeader>
      <CardTitle className="text-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span>{getFixtureTitle()}</span>
        </div>
        <div className="flex gap-2">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <Calendar className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={new Date(fixture.date)}
                onSelect={date => {
                  if (date) {
                    onDateChange(date);
                    setIsCalendarOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="sm" onClick={e => {
            e.stopPropagation();
            onEdit(fixture);
          }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={e => {
            e.stopPropagation();
            onTeamSelection();
          }}>
            <Users className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={e => {
            e.stopPropagation();
            onDelete(fixture.id);
          }}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardTitle>
    </CardHeader>
  );
};
