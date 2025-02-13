
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

  // Find performance categories for our teams only
  const team1Time = times.find(t => t.team_number === 1);
  const team2Time = times.find(t => t.team_number === 2);
  
  // Format team names based on home/away status
  const formatTeamName = (teamNumber: number, isOurTeam: boolean) => {
    if (!isOurTeam) return fixture.opponent;
    const category = times.find(t => t.team_number === teamNumber)?.performance_category || 'MESSI';
    return `Team ${teamNumber} (${category})`;
  };

  // For home games, Team 1 is our team
  // For away games, Team 2 is our team
  const firstTeamName = fixture.is_home ? formatTeamName(1, true) : fixture.opponent;
  const secondTeamName = fixture.is_home ? fixture.opponent : formatTeamName(2, true);

  // Get outcomes for each team
  const team1Outcome = getTeamOutcome(team1Score, team2Score);
  const team2Outcome = getTeamOutcome(team2Score, team1Score);

  return (
    <div className="space-y-4">
      {/* First Team */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-xl font-bold">
            {firstTeamName}: {team1Score} - {team2Score} {secondTeamName}
          </p>
          {getOutcomeIcon(fixture.is_home ? team1Outcome : team2Outcome)}
        </div>
        {team1Time && fixture.is_home && (
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

      {/* Second Team (if multiple teams) */}
      {scores.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold">
              {secondTeamName}: {team2Score} - {team1Score} {firstTeamName}
            </p>
            {getOutcomeIcon(fixture.is_home ? team2Outcome : team1Outcome)}
          </div>
          {team2Time && !fixture.is_home && (
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
