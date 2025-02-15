
import { Trophy, Minus, XCircle } from "lucide-react";
import type { Database } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type TeamTime = Database['public']['Tables']['fixture_team_times']['Row'];
type TeamScore = {
  id: string;
  fixture_id: string;
  team_number: number;
  score: number;
  opponent_score: number;
  created_at: string;
  updated_at: string;
};

interface TeamScoresProps {
  scores: TeamScore[];
  times: TeamTime[];
  fixture: {
    opponent: string;
    team_name: string;
    is_home?: boolean; // Made optional to match Fixture type
    team_1_score?: number | null;
    opponent_1_score?: number | null;
    team_2_score?: number | null;
    opponent_2_score?: number | null;
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
  const { profile } = useAuth();
  
  const { data: teamSettings } = useQuery({
    queryKey: ['team-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Check if we have direct scores on the fixture first
  const hasDirectScores = fixture.team_1_score !== undefined && fixture.opponent_1_score !== undefined;

  if (!hasDirectScores && (!scores || scores.length === 0)) {
    return <p className="text-muted-foreground">Score not yet recorded</p>;
  }

  const shouldHideScores = teamSettings?.hide_scores_from_parents && profile?.role === 'parent';

  return (
    <div className="space-y-4">
      {hasDirectScores ? (
        // Display scores directly from fixture object
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-base">
              {fixture.is_home 
                ? `${fixture.team_name}: ${shouldHideScores ? 'hidden' : fixture.team_1_score} - ${shouldHideScores ? 'hidden' : fixture.opponent_1_score} ${fixture.opponent}`
                : `${fixture.opponent}: ${shouldHideScores ? 'hidden' : fixture.opponent_1_score} - ${shouldHideScores ? 'hidden' : fixture.team_1_score} ${fixture.team_name}`
              }
            </p>
            {!shouldHideScores && getOutcomeIcon(getTeamOutcome(fixture.team_1_score || 0, fixture.opponent_1_score || 0))}
          </div>

          {fixture.team_2_score !== null && fixture.opponent_2_score !== null && (
            <div className="flex items-center gap-2">
              <p className="font-semibold text-base">
                {fixture.is_home 
                  ? `${fixture.team_name}: ${shouldHideScores ? 'hidden' : fixture.team_2_score} - ${shouldHideScores ? 'hidden' : fixture.opponent_2_score} ${fixture.opponent}`
                  : `${fixture.opponent}: ${shouldHideScores ? 'hidden' : fixture.opponent_2_score} - ${shouldHideScores ? 'hidden' : fixture.team_2_score} ${fixture.team_name}`
                }
              </p>
              {!shouldHideScores && getOutcomeIcon(getTeamOutcome(fixture.team_2_score || 0, fixture.opponent_2_score || 0))}
            </div>
          )}
        </div>
      ) : (
        // Display scores from scores array
        scores.map((score, index) => {
          const teamTime = times.find(t => t.team_number === score.team_number);
          const performanceCategory = teamTime?.performance_category || 'MESSI';
          const ourTeamName = `Team ${score.team_number} (${performanceCategory})`;
          const displayScore = fixture.is_home 
            ? `${shouldHideScores ? 'hidden' : score.score} - ${shouldHideScores ? 'hidden' : score.opponent_score}`
            : `${shouldHideScores ? 'hidden' : score.opponent_score} - ${shouldHideScores ? 'hidden' : score.score}`;

          const outcome = !shouldHideScores ? getTeamOutcome(score.score, score.opponent_score) : null;

          return (
            <div key={score.team_number} className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-base">
                  {fixture.is_home 
                    ? `${ourTeamName}: ${displayScore} ${fixture.opponent}`
                    : `${fixture.opponent}: ${displayScore} ${ourTeamName}`
                  }
                </p>
                {!shouldHideScores && getOutcomeIcon(outcome)}
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
        })
      )}
    </div>
  );
};
