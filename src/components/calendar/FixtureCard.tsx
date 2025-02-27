
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { TeamScores } from "./FixtureCard/TeamScores";
import { FixtureCardHeader } from "./FixtureCard/FixtureCardHeader";
import { DateChangeButton } from "./events/components/DateChangeButton";
import { EventActionButtons } from "./events/components/EventActionButtons";
import { Fixture } from "@/types/fixture";
import { TeamSelectionDialog } from "./FixtureCard/TeamSelectionDialog";
import { useState } from "react";

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

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this fixture against ${fixture.opponent}?`)) {
      onDelete(fixture.id);
    }
  };

  const handleTeamSelection = () => {
    setShowTeamSelection(true);
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

        <CardContent className="cursor-pointer">
          <p className="font-semibold text-muted-foreground mb-4 text-sm">
            Date: {formattedDate}
          </p>

          {Array.from({ length: fixture.number_of_teams || 1 }).map((_, index) => (
            <div key={index} className="mb-4 space-y-4">
              <h3 className="font-semibold">Team {index + 1}</h3>
              <TeamScores 
                fixture={fixture} 
                teamIndex={index} 
              />
            </div>
          ))}

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
              onEdit={onEdit} 
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
