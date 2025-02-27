
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { format } from "date-fns";
import { TeamScores } from "./FixtureCard/TeamScores";
import { DateChangeButton } from "./events/components/DateChangeButton";
import { EventActionButtons } from "./events/components/EventActionButtons";
import { Fixture } from "@/types/fixture";
import { TeamSelectionDialog } from "./FixtureCard/TeamSelectionDialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FixtureCardProps {
  fixture: Fixture;
  onEdit: () => void;
  onDelete: (fixtureId: string) => void;
  onDateChange: (fixtureId: string, newDate: Date) => void;
}

export const FixtureCard = ({
  fixture,
  onEdit,
  onDelete,
  onDateChange,
}: FixtureCardProps) => {
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [playerNames, setPlayerNames] = useState<Record<string, string>>({});

  // Format date for display
  const formattedDate = fixture.date
    ? format(new Date(fixture.date), "MMMM do, yyyy")
    : "Date TBD";

  // Get team and opponent names
  const teamName = fixture.team_name || "Broughty Pumas 2015s";
  
  // Ensure we have the right display title
  const vsTitle = fixture.is_home
    ? `${teamName} vs ${fixture.opponent}`
    : `${fixture.opponent} vs ${teamName}`;

  // Get format
  const formatText = fixture.format ? `${fixture.format} Format` : "";

  console.log("Rendering fixture:", fixture.id, fixture.opponent);
  console.log("Fixture MOTM player ID:", fixture.motm_player_id);
  console.log("Fixture team scores:", fixture.fixture_team_scores);

  // Format time for display, handling nullable times
  const formatTime = (timeString?: string | null) => {
    if (!timeString) return null;
    
    // Try to split the time in HH:MM:SS format
    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
      // Convert to 12-hour format
      let hours = parseInt(timeParts[0]);
      const minutes = timeParts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // Convert '0' to '12'
      return `${hours}:${minutes} ${ampm}`;
    }
    
    return timeString; // Return the original format if parsing fails
  };

  // Fetch player names for MOTM
  useEffect(() => {
    const fetchPlayerNames = async () => {
      // Collect all player IDs to fetch
      const playerIds: string[] = [];
      
      // Add the main fixture MOTM if it exists
      if (fixture.motm_player_id) {
        playerIds.push(fixture.motm_player_id);
      }
      
      // Add team-specific MOTM player IDs if they exist
      if (fixture.fixture_team_scores && fixture.fixture_team_scores.length > 0) {
        fixture.fixture_team_scores.forEach(score => {
          if (score.motm_player_id) {
            playerIds.push(score.motm_player_id);
          }
        });
      }
      
      // Only fetch if we have player IDs
      if (playerIds.length > 0) {
        const { data, error } = await supabase
          .from('players')
          .select('id, name')
          .in('id', playerIds);
          
        if (error) {
          console.error("Error fetching player names:", error);
          return;
        }
        
        // Create a map of player IDs to names
        const playerMap: Record<string, string> = {};
        data?.forEach(player => {
          playerMap[player.id] = player.name;
        });
        
        setPlayerNames(playerMap);
      }
    };
    
    fetchPlayerNames();
  }, [fixture.motm_player_id, fixture.fixture_team_scores]);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this fixture against ${fixture.opponent}?`)) {
      onDelete(fixture.id);
    }
  };

  const handleTeamSelection = () => {
    setShowTeamSelection(true);
  };

  const handleEdit = () => {
    console.log("Edit button clicked for fixture:", fixture.id);
    if (fixture.id) {
      onEdit(); // Call the parent component's onEdit handler
    }
  };

  return (
    <>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <Badge>
                Upcoming
              </Badge>
              <CardTitle className="text-xl font-bold">
                {vsTitle}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatText}
              </p>
            </div>
            <Trophy className="h-6 w-6 text-blue-500" />
          </div>
        </CardHeader>

        <CardContent>
          <p className="font-semibold text-muted-foreground mb-4 text-sm">
            Date: {formattedDate}
          </p>

          {Array.from({ length: fixture.number_of_teams || 1 }).map((_, index) => {
            // Find the team score for this team index
            const teamScore = fixture.fixture_team_scores?.find(
              score => score.team_number === index + 1
            );
            
            // Get the MOTM player ID and name for this team
            const motmPlayerId = teamScore?.motm_player_id || 
              (index === 0 ? fixture.motm_player_id : null);
            const motmPlayerName = motmPlayerId ? playerNames[motmPlayerId] : null;
            
            // Get the team's performance category and start time
            const teamTime = fixture.fixture_team_times?.find(
              time => time.team_number === index + 1
            );
            const performanceCategory = teamTime?.performance_category || "MESSI";
            const startTime = teamTime?.start_time || fixture.start_time;
            const formattedStartTime = formatTime(startTime);
            
            return (
              <div key={index} className="mb-4 space-y-4">
                <h3 className="font-semibold">Team {index + 1} {performanceCategory}</h3>
                {formattedStartTime && (
                  <p className="text-sm text-muted-foreground">
                    Start Time: {formattedStartTime}
                  </p>
                )}
                <TeamScores 
                  fixture={fixture} 
                  teamIndex={index} 
                />
                {motmPlayerName && (
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Trophy className="h-4 w-4 mr-1 inline-block text-yellow-500" />
                    Player of the Match: {motmPlayerName}
                  </p>
                )}
              </div>
            );
          })}

          <div className="space-y-1 mt-4 text-sm text-muted-foreground">
            <p>Location: {fixture.location || "TBD"}</p>
          </div>

          <div className="flex justify-end items-center gap-2 mt-4">
            <DateChangeButton 
              date={fixture.date ? new Date(fixture.date) : new Date()} 
              onDateChange={(newDate) => {
                // Convert Date to string format before passing to parent component
                onDateChange(fixture.id, newDate);
              }}
            />
            <EventActionButtons 
              onEdit={handleEdit}
              onTeamSelection={handleTeamSelection} 
              onDelete={handleDelete} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Team Selection Dialog */}
      <TeamSelectionDialog 
        fixture={fixture}
        isOpen={showTeamSelection}
        onOpenChange={setShowTeamSelection}
      />
    </>
  );
};
