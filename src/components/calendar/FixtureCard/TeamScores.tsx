
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
  outcome,
  fixture
}: TeamScoresProps) => {
  if (!scores || scores.length === 0) {
    return <p className="text-muted-foreground">Score not yet recorded</p>;
  }

  return (
    <div className="space-y-4">
      {scores.map((score, index) => {
        const teamNumber = score.team_number;
        const teamTime = times.find(t => t.team_number === teamNumber);
        const performanceCategory = teamTime?.performance_category || 'MESSI';
        const ourTeamName = `Team ${teamNumber} (${performanceCategory})`;
        
        // For each team, get their score and the opposing team's score
        const ourScore = score.score;
        const opposingTeamScore = scores.find(s => s.team_number !== teamNumber)?.score || 0;
        
        // Determine if we're showing a home or away score format
        const isFirstTeam = teamNumber === 1;
        const displayScore = fixture.is_home ?
          `${ourScore} - ${opposingTeamScore}` :
          `${opposingTeamScore} - ${ourScore}`;

        const teamOutcome = fixture.is_home ?
          getTeamOutcome(ourScore, opposingTeamScore) :
          getTeamOutcome(opposingTeamScore, ourScore);

        return (
          <div key={teamNumber} className="space-y-2">
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
        );
      })}
    </div>
  );
};
