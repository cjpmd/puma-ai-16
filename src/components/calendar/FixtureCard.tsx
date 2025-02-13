
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Pencil, Trash2, Users, Trophy, Minus, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TeamSelectionManager } from "@/components/fixtures/TeamSelectionManager";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { useState, useEffect } from "react";
import type { Fixture } from "@/types/fixture";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FixtureCardProps {
  fixture: Fixture;
  onEdit: (fixture: Fixture) => void;
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

export const FixtureCard = ({
  fixture,
  onEdit,
  onDelete,
  onDateChange
}: FixtureCardProps) => {
  const [isTeamSelectionOpen, setIsTeamSelectionOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [motmName, setMotmName] = useState<string | null>(null);

  // Fetch team selections, times, and scores
  const { data: teamData } = useQuery({
    queryKey: ["team-data", fixture.id],
    queryFn: async () => {
      const [timesResponse, scoresResponse] = await Promise.all([
        supabase
          .from('fixture_team_times')
          .select('*')
          .eq('fixture_id', fixture.id)
          .order('team_number'),
        supabase
          .from('fixture_team_scores')
          .select('*')
          .eq('fixture_id', fixture.id)
          .order('team_number')
      ]);
      
      if (timesResponse.error) throw timesResponse.error;
      if (scoresResponse.error) throw scoresResponse.error;
      
      return {
        times: timesResponse.data || [],
        scores: scoresResponse.data || []
      };
    }
  });

  const getTeamName = (teamNumber: number) => {
    const teamTime = teamData?.times?.find(t => t.team_number === teamNumber);
    return `Team ${teamNumber} ${teamTime?.performance_category || 'MESSI'}`;
  };

  // Fetch MOTM player name when fixture.motm_player_id changes
  useEffect(() => {
    const fetchMotmName = async () => {
      if (!fixture.motm_player_id) {
        setMotmName(null);
        return;
      }
      const { data, error } = await supabase
        .from('players')
        .select('name')
        .eq('id', fixture.motm_player_id)
        .single();
      
      if (!error && data) {
        setMotmName(data.name);
      } else {
        setMotmName('Unknown Player');
      }
    };
    fetchMotmName();
  }, [fixture.motm_player_id]);

  const getFixtureTitle = () => {
    if (fixture.is_home) {
      return `${fixture.team_name} vs ${fixture.opponent}`;
    }
    return `${fixture.opponent} vs ${fixture.team_name}`;
  };

  return (
    <>
      <Card className="hover:bg-accent/50 transition-colors">
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
                    selected={parseISO(fixture.date)}
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
                setIsTeamSelectionOpen(true);
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
        <CardContent onClick={() => onEdit(fixture)} className="cursor-pointer">
          <p className="font-semibold text-sm text-muted-foreground mb-4">
            Date: {format(parseISO(fixture.date), "MMMM do, yyyy")}
          </p>
          <div className="space-y-4">
            {teamData?.scores?.map((score, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">
                    {getTeamName(score.team_number)}: {score.score}
                  </p>
                  {index === 0 && getOutcomeIcon(fixture.outcome)}
                </div>
                {teamData?.times?.[index] && (
                  <div className="text-sm text-muted-foreground">
                    {teamData.times[index].meeting_time && (
                      <p>Meeting: {teamData.times[index].meeting_time}</p>
                    )}
                    {teamData.times[index].start_time && (
                      <p>Start: {teamData.times[index].start_time}</p>
                    )}
                    {teamData.times[index].end_time && (
                      <p>End: {teamData.times[index].end_time}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            {(!teamData?.scores || teamData.scores.length === 0) && (
              <p className="text-muted-foreground">Score not yet recorded</p>
            )}
          </div>
          <div className="space-y-1 mt-4 text-sm text-muted-foreground">
            {fixture.location && <p>Location: {fixture.location}</p>}
            {fixture.motm_player_id && motmName && <p>Man of the Match: {motmName}</p>}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isTeamSelectionOpen} onOpenChange={setIsTeamSelectionOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Team Selection - {fixture.opponent}</DialogTitle>
          </DialogHeader>
          <TeamSelectionManager fixture={fixture} />
        </DialogContent>
      </Dialog>
    </>
  );
};
