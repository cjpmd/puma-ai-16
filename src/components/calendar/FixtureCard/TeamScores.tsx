
import { Minus } from "lucide-react";
import { format } from "date-fns";
import { Fixture } from "@/types/fixture";

interface TeamScoresProps {
  teamName?: string;
  opponent?: string;
  teamScore?: number | null;
  opponentScore?: number | null;
  isHome?: boolean;
  fixtureDate?: string;
  fixture?: Fixture;
  teamIndex?: number;
}

export const TeamScores = ({
  teamName,
  opponent,
  teamScore,
  opponentScore,
  isHome,
  fixtureDate,
  fixture,
  teamIndex = 0
}: TeamScoresProps) => {
  // If we receive a fixture object, extract properties from it
  if (fixture) {
    teamName = fixture.team_name || "Broughty Pumas 2015s";
    opponent = fixture.opponent;
    isHome = fixture.is_home;
    fixtureDate = fixture.date;
    
    // Get scores from the fixture based on teamIndex
    if (teamIndex === 0) {
      teamScore = fixture.team_1_score !== undefined ? fixture.team_1_score : null;
      opponentScore = fixture.opponent_1_score !== undefined ? fixture.opponent_1_score : null;
    } else if (teamIndex === 1) {
      teamScore = fixture.team_2_score !== undefined ? fixture.team_2_score : null;
      opponentScore = fixture.opponent_2_score !== undefined ? fixture.opponent_2_score : null;
    }
  }
  
  const isScoreAvailable = teamScore !== undefined && opponentScore !== undefined;
  
  const getStatusIcon = () => {
    if (!isScoreAvailable) {
      return <Minus className="h-4 w-4 text-amber-500" />;
    }

    if (teamScore === null || opponentScore === null) {
      return <Minus className="h-4 w-4 text-amber-500" />;
    }

    if (teamScore > opponentScore) {
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="h-4 w-4 text-green-500"
        >
          <path d="m5 12 5 5 10-10"></path>
        </svg>
      );
    } else if (teamScore < opponentScore) {
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="h-4 w-4 text-red-500"
        >
          <path d="M18 6 6 18"></path>
          <path d="m6 6 12 12"></path>
        </svg>
      );
    } else {
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="h-4 w-4 text-amber-500"
        >
          <path d="M5 12h14"></path>
        </svg>
      );
    }
  };

  // Format score display
  const getScoreDisplay = () => {
    if (!teamName || !opponent) {
      return "Score not available";
    }
    
    const homeTeam = isHome ? teamName : opponent;
    const awayTeam = isHome ? opponent : teamName;
    const homeScore = isHome ? teamScore : opponentScore;
    const awayScore = isHome ? opponentScore : teamScore;

    const formattedHomeScore = homeScore === null || homeScore === undefined ? '0' : homeScore;
    const formattedAwayScore = awayScore === null || awayScore === undefined ? '0' : awayScore;

    return `${homeTeam}: ${formattedHomeScore} - ${formattedAwayScore} ${awayTeam}`;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-base">{getScoreDisplay()}</p>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
};
