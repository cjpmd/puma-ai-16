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
const getTeamOutcome = (ourScore: number, theirScore: number) => {
  if (ourScore > theirScore) return 'WIN';
  if (ourScore < theirScore) return 'LOSS';
  return 'DRAW';
};
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
export const TeamScores = ({
  scores,
  times,
  fixture
}: TeamScoresProps) => {
  if (!scores || scores.length === 0) {
    return <p className="text-muted-foreground">Score not yet recorded</p>;
  }
  return <div className="space-y-4">
      {scores.map(score => {
      const teamNumber = score.team_number;
      const teamTime = times.find(t => t.team_number === teamNumber);
      const performanceCategory = teamTime?.performance_category || 'MESSI';
      const ourTeamName = `Team ${teamNumber} (${performanceCategory})`;

      // For each of our teams, get their score and the opponent's score
      const ourScore = score.score;
      const opponentScore = ourScore; // Since each score entry represents our team's score

      // Calculate outcome based on whether it's a home or away game
      const outcome = fixture.is_home ? getTeamOutcome(ourScore, opponentScore) : getTeamOutcome(opponentScore, ourScore);
      return <div key={teamNumber} className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-base">
                {fixture.is_home ? `${ourTeamName}: ${ourScore} - ${opponentScore} ${fixture.opponent}` : `${fixture.opponent}: ${opponentScore} - ${ourScore} ${ourTeamName}`}
              </p>
              {getOutcomeIcon(outcome)}
            </div>
            {teamTime && <div className="text-sm text-muted-foreground">
                {teamTime.meeting_time && <p>Meeting: {teamTime.meeting_time}</p>}
                {teamTime.start_time && <p>Start: {teamTime.start_time}</p>}
                {teamTime.end_time && <p>End: {teamTime.end_time}</p>}
              </div>}
          </div>;
    })}
    </div>;
};