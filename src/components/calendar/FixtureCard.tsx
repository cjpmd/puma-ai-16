import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Pencil, Trash2, Users, Trophy, Minus, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TeamSelectionManager } from "@/components/fixtures/TeamSelectionManager";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { useState } from "react";

interface FixtureCardProps {
  fixture: {
    id: string;
    opponent: string;
    home_score: number | null;
    away_score: number | null;
    category: string;
    location?: string;
    time?: string | null;
    date: string;
    outcome?: string | null;
  };
  onEdit: (fixture: FixtureCardProps["fixture"]) => void;
  onDelete: (fixtureId: string) => void;
  onDateChange: (newDate: Date) => void;
}

const getOutcomeIcon = (outcome: string | null | undefined) => {
  switch (outcome) {
    case 'WIN':
      return <Trophy className="h-4 w-4 text-green-500" />;
    case 'DRAW':
      return <Minus className="h-4 w-4 text-amber-500" />;
    case 'LOSS':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};

export const FixtureCard = ({ fixture, onEdit, onDelete, onDateChange }: FixtureCardProps) => {
  const [isTeamSelectionOpen, setIsTeamSelectionOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const hasScores = fixture.home_score !== null && fixture.away_score !== null;

  return (
    <>
      <Card className="hover:bg-accent/50 transition-colors">
        <CardHeader>
          <CardTitle className="text-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{fixture.category}</Badge>
              <span>vs {fixture.opponent}</span>
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
                    selected={parseISO(fixture.date)}
                    onSelect={(date) => {
                      if (date) {
                        onDateChange(date);
                        setIsCalendarOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(fixture);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTeamSelectionOpen(true);
                }}
              >
                <Users className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(fixture.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent onClick={() => onEdit(fixture)} className="cursor-pointer">
          <div className="flex items-center gap-2">
            {hasScores ? (
              <>
                <p className="text-xl font-bold">
                  {fixture.home_score} - {fixture.away_score}
                </p>
                {getOutcomeIcon(fixture.outcome)}
              </>
            ) : (
              <p className="text-muted-foreground">Score not yet recorded</p>
            )}
          </div>
          <div className="space-y-1 mt-2 text-sm text-muted-foreground">
            {fixture.location && (
              <p>Location: {fixture.location}</p>
            )}
            {fixture.time && (
              <p>Time: {fixture.time}</p>
            )}
            <p>Date: {format(parseISO(fixture.date), "MMMM do, yyyy")}</p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isTeamSelectionOpen} onOpenChange={setIsTeamSelectionOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Team Selection - {fixture.opponent}</DialogTitle>
          </DialogHeader>
          <TeamSelectionManager 
            fixture={fixture} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
