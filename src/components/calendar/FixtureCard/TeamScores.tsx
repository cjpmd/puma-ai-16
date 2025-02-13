
import { Trophy, Minus, XCircle } from "lucide-react";
import type { Database } from "@/integrations/supabase/client";

type TeamTime = Database['public']['Tables']['fixture_team_times']['Row'];
type TeamScore = Database['public']['Tables']['fixture_team_scores']['Row'];

interface TeamScoresProps {
  scores: TeamScore[];
  times: TeamTime[];
  outcome: string | null | undefined;
  fixture: {
    opponent: string;
    team_name: string;
    is_home: boolean;
  };
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

const getTeamName = (teamNumber: number, times: TeamTime[], fixture: TeamScoresProps['fixture']) => {
  const teamTime = times.find(t => t.team_number === teamNumber);
  if (teamNumber === 1) {
    return fixture.is_home ? fixture.team_name : fixture.opponent;
  }
  return fixture.is_home ? fixture.opponent : fixture.team_name;
};

export const TeamScores = ({ scores, times, outcome, fixture }: TeamScoresProps) => {
  if (!scores || scores.length === 0) {
    return <p className="text-muted-foreground">Score not yet recorded</p>;
  }

  return (
    <div className="space-y-4">
      {scores.map((score, index) => {
        const isHomeTeam = fixture.is_home ? index === 0 : index === 1;
        const teamName = getTeamName(score.team_number, times, fixture);
        const teamTime = times.find(t => t.team_number === score.team_number);
        const performanceCategory = teamTime?.performance_category || 'MESSI';
        
        return (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold">
                {teamName} ({performanceCategory}): {score.score} {isHomeTeam ? 'vs' : ''} {isHomeTeam && fixture.opponent}
              </p>
              {isHomeTeam && getOutcomeIcon(outcome)}
            </div>
            {teamTime && (
              <div className="text-sm text-muted-foreground">
                {teamTime.meeting_time && (
                  <p>Meeting: {teamTime.meeting_time}</p>
                )}
                {teamTime.start_time && (
                  <p>Start: {teamTime.start_time}</p>
                )}
                {teamTime.end_time && (
                  <p>End: {teamTime.end_time}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
