
import { CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { format } from "date-fns";
import { FixtureStatus } from "./FixtureStatus";

interface FixtureHeaderProps {
  fixture: {
    id: string;
    team_name?: string;
    opponent: string;
    is_home?: boolean;
    format?: string;
    date?: string;
    fixture_team_times?: Array<{
      team_number: number;
      start_time?: string | null;
      end_time?: string | null;
      performance_category?: string;
    }>;
    status?: string;
    home_team_name?: string;
    away_team_name?: string;
    home_team_data?: any;
    away_team_data?: any;
    home_team_score?: number;
    away_team_score?: number;
  };
}

export const FixtureHeader = ({ fixture }: FixtureHeaderProps) => {
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

  return (
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <FixtureStatus fixture={fixture} />
        <CardTitle className="text-xl font-bold">
          {vsTitle}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {formatText}
        </p>
      </div>
      <Trophy className="h-6 w-6 text-blue-500" />
    </div>
  );
};
