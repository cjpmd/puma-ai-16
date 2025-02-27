
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamScores } from "./FixtureCard/TeamScores";
import { Fixture } from "@/types/fixture";
import { Trophy, MapPin, Calendar, Clock, Users } from "lucide-react";

interface FixtureCardProps {
  fixture: Fixture;
  onClick?: () => void;
}

export const FixtureCard = ({ fixture, onClick }: FixtureCardProps) => {
  // Format date for display
  const formattedDate = fixture.date 
    ? format(new Date(fixture.date), "MMMM do, yyyy")
    : "TBD";

  // Determine badge color and text based on outcome
  const getBadgeVariant = () => {
    if (!fixture.outcome) return "secondary";
    
    switch (fixture.outcome) {
      case "WIN":
        return "success";
      case "LOSS":
        return "destructive";
      case "DRAW":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getBadgeText = () => {
    if (!fixture.outcome) return "Upcoming";
    
    switch (fixture.outcome) {
      case "WIN":
        return "Win";
      case "LOSS":
        return "Loss";
      case "DRAW":
        return "Draw";
      default:
        return "Upcoming";
    }
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <Badge variant={getBadgeVariant()}>
              {getBadgeText()}
            </Badge>
            <CardTitle className="text-xl font-bold">
              {fixture.team_name} vs {fixture.opponent}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {fixture.format || "Standard"} Format
            </p>
          </div>
          <Trophy className={`h-6 w-6 ${fixture.is_friendly ? 'text-amber-400' : 'text-blue-500'}`} />
        </div>
      </CardHeader>
      
      <CardContent className="cursor-pointer" onClick={onClick}>
        <p className="font-semibold text-muted-foreground mb-4 text-sm">
          Date: {formattedDate}
        </p>
        
        {(fixture.number_of_teams || 0) > 0 && (
          <div className="mb-4 space-y-4">
            <h3 className="font-semibold">Team 1</h3>
            <TeamScores
              teamName={fixture.team_name || "Broughty Pumas"}
              opponent={fixture.opponent || "Opposition"}
              teamScore={fixture.team_1_score}
              opponentScore={fixture.opponent_1_score}
              isHome={fixture.is_home || false}
              fixtureDate={fixture.date}
            />
            
            {(fixture.number_of_teams || 0) > 1 && (
              <>
                <h3 className="font-semibold mt-6">Team 2</h3>
                <TeamScores
                  teamName={fixture.team_name || "Broughty Pumas"}
                  opponent={fixture.opponent || "Opposition"}
                  teamScore={fixture.team_2_score}
                  opponentScore={fixture.opponent_2_score}
                  isHome={fixture.is_home || false}
                  fixtureDate={fixture.date}
                />
              </>
            )}
          </div>
        )}
        
        <div className="space-y-1 mt-4 text-sm text-muted-foreground">
          <p>Location: {fixture.location || "TBD"}</p>
          {fixture.meeting_time && (
            <p className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> Meet: {fixture.meeting_time}
            </p>
          )}
          {fixture.start_time && (
            <p className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> Start: {fixture.start_time}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
