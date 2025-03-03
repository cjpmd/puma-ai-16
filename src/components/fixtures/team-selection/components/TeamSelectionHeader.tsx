
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeamSelection } from "../context/TeamSelectionContext";
import { format, parseISO } from "date-fns";

export const TeamSelectionHeader = () => {
  const { fixture } = useTeamSelection();
  
  if (!fixture) return null;
  
  // Format date if available
  const formattedDate = fixture.date 
    ? format(parseISO(fixture.date), "EEEE, MMMM do yyyy")
    : "Date not set";
  
  // Format time if available
  const formattedTime = fixture.time || "Time not set";
  
  // Get location
  const location = fixture.location || "Location not set";
  
  // Format matchup
  const isHome = fixture.is_home;
  const opponent = fixture.opponent || "Unknown Opponent";
  const homeTeam = isHome ? "Broughty Pumas" : opponent;
  const awayTeam = isHome ? opponent : "Broughty Pumas";
  const matchup = `${homeTeam} vs ${awayTeam}`;
  
  // Get format
  const fixtureFormat = fixture.format || "7-a-side";
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{matchup}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="outline">{formattedDate}</Badge>
          <Badge variant="outline">{formattedTime}</Badge>
          <Badge variant="outline">{location}</Badge>
          <Badge variant="outline">{fixtureFormat}</Badge>
          <Badge variant="outline">{isHome ? "Home" : "Away"}</Badge>
        </div>
      </CardContent>
    </Card>
  );
};
