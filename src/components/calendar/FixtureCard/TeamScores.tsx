
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

const getTeamOutcome = (teamScore: number, opponentScore: number) => {
  if (teamScore > opponentScore) return 'WIN';
  if (teamScore < opponentScore) return 'LOSS';
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

export const TeamScores = ({ scores, times, fixture }: TeamScoresProps) => {
  if (!scores || scores.length === 0) {
    return <p className="text-muted-foreground">Score not yet recorded</p>;
  }

  // Find scores for each team
  const team1Score = scores.find(s => s.team_number === 1)?.score || 0;
  const team2Score = scores.find(s => s.team_number === 2)?.score || 0;

  // Find performance categories
  const team1Time = times.find(t => t.team_number === 1);
  const team2Time = times.find(t => t.team_number === 2);
  const team1Category = team1Time?.performance_category || 'MESSI';
  const team2Category = team2Time?.performance_category || 'MESSI';

  // Determine team names based on home/away status
  const team1Name = fixture.is_home ? fixture.team_name : fixture.opponent;
  const team2Name = fixture.is_home ? fixture.opponent : fixture.team_name;

  // Get outcomes for each team
  const team1Outcome = getTeamOutcome(team1Score, team2Score);
  const team2Outcome = getTeamOutcome(team2Score, team1Score);

  return (
    <div className="space-y-4">
      {/* Team 1 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-xl font-bold">
            {team1Name} ({team1Category}): {team1Score} - {team2Score} {team2Name}
          </p>
          {getOutcomeIcon(team1Outcome)}
        </div>
        {team1Time && (
          <div className="text-sm text-muted-foreground">
            {team1Time.meeting_time && (
              <p>Meeting: {team1Time.meeting_time}</p>
            )}
            {team1Time.start_time && (
              <p>Start: {team1Time.start_time}</p>
            )}
            {team1Time.end_time && (
              <p>End: {team1Time.end_time}</p>
            )}
          </div>
        )}
      </div>

      {/* Team 2 (if it exists) */}
      {scores.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold">
              {team2Name} ({team2Category}): {team2Score} - {team1Score} {team1Name}
            </p>
            {getOutcomeIcon(team2Outcome)}
          </div>
          {team2Time && (
            <div className="text-sm text-muted-foreground">
              {team2Time.meeting_time && (
                <p>Meeting: {team2Time.meeting_time}</p>
              )}
              {team2Time.start_time && (
                <p>Start: {team2Time.start_time}</p>
              )}
              {team2Time.end_time && (
                <p>End: {team2Time.end_time}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
