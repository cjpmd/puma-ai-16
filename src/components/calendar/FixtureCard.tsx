
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { Fixture } from "@/types/fixture";
import { TeamSelectionDialog } from "./FixtureCard/TeamSelectionDialog";
import { FixtureHeader } from "./FixtureCard/FixtureHeader";
import { TeamDetails } from "./FixtureCard/TeamDetails";
import { FixtureFooter } from "./FixtureCard/FixtureFooter";
import { useFixtureHelpers } from "./FixtureCard/useFixtureHelpers";
import { useFixturePlayerNames } from "./FixtureCard/useFixturePlayerNames";
import { KitIcon } from "@/components/fixtures/KitIcon";

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
  const playerNames = useFixturePlayerNames(fixture);
  const { currentTime, formatTime } = useFixtureHelpers();

  console.log("Rendering fixture:", fixture.id, fixture.opponent);
  console.log("Fixture team scores:", fixture.fixture_team_scores);
  console.log("Fixture direct scores:", {
    team_1_score: fixture.team_1_score,
    opponent_1_score: fixture.opponent_1_score,
    team_2_score: fixture.team_2_score,
    opponent_2_score: fixture.opponent_2_score
  });

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

  // Determine kit type based on home/away status
  const kitType = fixture.is_home ? 'home' : 'away';

  return (
    <>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <FixtureHeader 
            fixture={fixture}
            currentTime={currentTime}
          />
        </CardHeader>

        <CardContent>
          <p className="font-semibold text-muted-foreground mb-1 text-sm flex items-center gap-2">
            Date: {fixture.date ? new Date(fixture.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "Date TBD"}
          </p>
          
          <div className="mb-3 flex items-center gap-2">
            <KitIcon type={kitType} size={20} />
            <span className="text-sm text-muted-foreground">
              {fixture.is_home ? "Home Kit" : "Away Kit"}
            </span>
          </div>

          {Array.from({ length: fixture.number_of_teams || 1 }).map((_, index) => (
            <TeamDetails 
              key={index}
              fixture={fixture}
              teamIndex={index}
              playerNames={playerNames}
              formatTime={formatTime}
            />
          ))}

          <div className="space-y-1 mt-4 text-sm text-muted-foreground">
            <p>Location: {fixture.location || "TBD"}</p>
          </div>

          <FixtureFooter 
            fixtureId={fixture.id}
            fixtureDate={fixture.date}
            onEdit={handleEdit}
            onTeamSelection={handleTeamSelection}
            onDelete={handleDelete}
            onDateChange={onDateChange}
          />
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
