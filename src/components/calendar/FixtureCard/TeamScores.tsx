
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

const getTeamOutcome = (ourScore: number, theirScore: number, isHome: boolean) => {
  // When we're away, we need to swap the scores for the outcome calculation
  const finalOurScore = isHome ? ourScore : theirScore;
  const finalTheirScore = isHome ? theirScore : ourScore;
  
  if (finalOurScore > finalTheirScore) return 'WIN';
  if (finalOurScore < finalTheirScore) return 'LOSS';
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
  outcome,
  fixture
}: TeamScoresProps) => {
  if (!scores || scores.length === 0) {
    return <p className="text-muted-foreground">Score not yet recorded</p>;
  }

  // Only show Team 1 score
  const team1Score = scores.find(s => s.team_number === 1);
  if (!team1Score) return null;

  const ourScore = fixture.is_home ? team1Score.score : (scores.find(s => s.team_number === 2)?.score || 0);
  const theirScore = fixture.is_home ? (scores.find(s => s.team_number === 2)?.score || 0) : team1Score.score;
  
  const teamTime = times.find(t => t.team_number === 1);
  const performanceCategory = teamTime?.performance_category || 'MESSI';
  const ourTeamName = `Team 1 (${performanceCategory})`;
  
  const displayScore = `${ourScore} - ${theirScore}`;
  const teamOutcome = getTeamOutcome(ourScore, theirScore, fixture.is_home);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-base">
            {fixture.is_home ? 
              `${ourTeamName}: ${displayScore} ${fixture.opponent}` :
              `${fixture.opponent}: ${displayScore} ${ourTeamName}`
            }
          </p>
          {getOutcomeIcon(teamOutcome)}
        </div>
        {teamTime && (
          <div className="text-sm text-muted-foreground">
            {teamTime.meeting_time && <p>Meeting: {teamTime.meeting_time}</p>}
            {teamTime.start_time && <p>Start: {teamTime.start_time}</p>}
            {teamTime.end_time && <p>End: {teamTime.end_time}</p>}
          </div>
        )}
      </div>
    </div>
  );
};
