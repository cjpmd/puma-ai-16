
import { Trophy } from "lucide-react";
import { Fixture } from "@/types/fixture";
import { TeamScores } from "./TeamScores";

interface TeamDetailsProps {
  fixture: Fixture;
  teamIndex: number;
  playerNames: Record<string, string>;
  formatTime: (timeString?: string | null) => string | null;
}

export const TeamDetails = ({ 
  fixture, 
  teamIndex, 
  playerNames, 
  formatTime 
}: TeamDetailsProps) => {
  // Find the team score for this team index
  const teamScore = fixture.fixture_team_scores?.find(
    score => score.team_number === teamIndex + 1
  );
  
  // Get the MOTM player ID and name for this team
  const motmPlayerId = teamScore?.motm_player_id || 
    (teamIndex === 0 ? fixture.motm_player_id : null);
  const motmPlayerName = motmPlayerId ? playerNames[motmPlayerId] : null;
  
  // Get the team's performance category and start time
  const teamTime = fixture.fixture_team_times?.find(
    time => time.team_number === teamIndex + 1
  );
  const performanceCategory = teamTime?.performance_category || "MESSI";
  const startTime = teamTime?.start_time || fixture.start_time;
  const formattedStartTime = formatTime(startTime);

  return (
    <div className="mb-4 space-y-4">
      <h3 className="font-semibold">Team {teamIndex + 1} {performanceCategory}</h3>
      {formattedStartTime && (
        <p className="text-sm text-muted-foreground">
          Kick Off: {formattedStartTime}
        </p>
      )}
      <TeamScores 
        fixture={fixture} 
        teamIndex={teamIndex} 
      />
      {motmPlayerName && (
        <p className="text-sm text-muted-foreground flex items-center">
          <Trophy className="h-4 w-4 mr-1 inline-block text-yellow-500" />
          Player of the Match: {motmPlayerName}
        </p>
      )}
    </div>
  );
};
