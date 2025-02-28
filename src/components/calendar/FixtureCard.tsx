
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { format, isAfter, isBefore, parseISO } from "date-fns";
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
  const [status, setStatus] = useState<"upcoming" | "live" | "completed">("upcoming");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);

  // Calculate fixture status based on current time and fixture times
  useEffect(() => {
    const determineFixtureStatus = () => {
      const now = new Date();
      
      // If fixture has no team times, use the main time fields
      if (!fixture.fixture_team_times || fixture.fixture_team_times.length === 0) {
        // Default status logic if no team times available
        return "upcoming";
      }
      
      // Get the latest end time from all teams
      const lastTeamToFinish = [...fixture.fixture_team_times].sort((a, b) => {
        // Default parsing for comparison, handling null values
        const endTimeA = a.end_time ? parseISO(`2000-01-01T${a.end_time}`) : new Date(0);
        const endTimeB = b.end_time ? parseISO(`2000-01-01T${b.end_time}`) : new Date(0);
        return endTimeB.getTime() - endTimeA.getTime(); // Sort descending
      })[0];
      
      // Get the earliest start time from all teams
      const firstTeamToStart = [...fixture.fixture_team_times].sort((a, b) => {
        // Default parsing for comparison, handling null values
        const startTimeA = a.start_time ? parseISO(`2000-01-01T${a.start_time}`) : new Date(0);
        const startTimeB = b.start_time ? parseISO(`2000-01-01T${b.start_time}`) : new Date(0);
        return startTimeA.getTime() - startTimeB.getTime(); // Sort ascending
      })[0];
      
      if (!lastTeamToFinish.end_time || !firstTeamToStart.start_time) {
        return "upcoming"; // Default to upcoming if times are missing
      }
      
      // Parse fixture date and times
      const fixtureDate = fixture.date ? new Date(fixture.date) : new Date();
      const todayDate = new Date();
      
      // Check if the fixture is today
      const isSameDay = 
        fixtureDate.getDate() === todayDate.getDate() &&
        fixtureDate.getMonth() === todayDate.getMonth() &&
        fixtureDate.getFullYear() === todayDate.getFullYear();
      
      if (!isSameDay) {
        // If fixture is in the past, mark as completed
        if (isBefore(fixtureDate, todayDate)) {
          return "completed";
        }
        // If fixture is in the future, mark as upcoming
        return "upcoming";
      }
      
      // For fixtures today, use the time to determine status
      // Extract hours and minutes for comparison
      const [startHours, startMinutes] = firstTeamToStart.start_time.split(':').map(Number);
      const [endHours, endMinutes] = lastTeamToFinish.end_time.split(':').map(Number);
      
      // Create Date objects for start and end times today
      const startTime = new Date();
      startTime.setHours(startHours, startMinutes, 0);
      
      const endTime = new Date();
      endTime.setHours(endHours, endMinutes, 0);
      
      // Compare current time with start and end times
      if (isBefore(now, startTime)) {
        return "upcoming";
      } else if (isAfter(now, endTime)) {
        return "completed";
      } else {
        return "live";
      }
    };
    
    setStatus(determineFixtureStatus());
  }, [fixture, currentTime]);

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
  console.log("Fixture team scores:", fixture.fixture_team_scores);
  console.log("Fixture direct scores:", {
    team_1_score: fixture.team_1_score,
    opponent_1_score: fixture.opponent_1_score,
    team_2_score: fixture.team_2_score,
    opponent_2_score: fixture.opponent_2_score
  });

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

  // Get badge color and text based on status
  const getBadgeVariant = () => {
    switch (status) {
      case "live":
        return { variant: "success" as const, text: "Live" };
      case "completed":
        return { variant: "secondary" as const, text: "Completed" };
      case "upcoming":
      default:
        return { variant: "default" as const, text: "Upcoming" };
    }
  };

  const { variant, text } = getBadgeVariant();

  return (
    <>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <Badge variant={variant}>
                {text}
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
                    Kick Off: {formattedStartTime}
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
