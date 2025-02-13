
import { Trophy, Minus, XCircle } from "lucide-react";
import type { Database } from "@/integrations/supabase/client";

type TeamTime = Database['public']['Tables']['fixture_team_times']['Row'];
type TeamScore = Database['public']['Tables']['fixture_team_scores']['Row'];

interface TeamScoresProps {
  scores: TeamScore[];
  times: TeamTime[];
  outcome: string | null | undefined;
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

const getTeamName = (teamNumber: number, times: TeamTime[]) => {
  const teamTime = times.find(t => t.team_number === teamNumber);
  return `Team ${teamNumber} ${teamTime?.performance_category || 'MESSI'}`;
};

export const TeamScores = ({ scores, times, outcome }: TeamScoresProps) => {
  if (!scores || scores.length === 0) {
    return <p className="text-muted-foreground">Score not yet recorded</p>;
  }

  return (
    <div className="space-y-4">
      {scores.map((score, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold">
              {getTeamName(score.team_number, times)}: {score.score}
            </p>
            {index === 0 && getOutcomeIcon(outcome)}
          </div>
          {times[index] && (
            <div className="text-sm text-muted-foreground">
              {times[index].meeting_time && (
                <p>Meeting: {times[index].meeting_time}</p>
              )}
              {times[index].start_time && (
                <p>Start: {times[index].start_time}</p>
              )}
              {times[index].end_time && (
                <p>End: {times[index].end_time}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
