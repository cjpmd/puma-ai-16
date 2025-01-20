import { format, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Minus, XCircle } from "lucide-react";

interface FixturesListProps {
  fixtures: Record<string, any[]>;
  onEdit: (fixture: any) => void;
  onDelete: (fixtureId: string) => void;
  onTeamSelection: (fixture: any) => void;
}

export const FixturesList = ({ fixtures, onEdit, onDelete, onTeamSelection }: FixturesListProps) => {
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

  return (
    <div className="space-y-8">
      {Object.entries(fixtures || {}).map(([date, dateFixtures]: [string, any[]]) => (
        <div key={date} className="space-y-4">
          <h2 className="text-xl font-semibold">
            {format(parseISO(date), "EEEE, MMMM do, yyyy")}
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Opponent</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dateFixtures.map((fixture) => (
                <TableRow 
                  key={fixture.id} 
                  className="cursor-pointer hover:bg-accent/50" 
                  onClick={() => onEdit(fixture)}
                >
                  <TableCell>
                    <Badge variant="outline">{fixture.category}</Badge>
                  </TableCell>
                  <TableCell>{fixture.location || "TBD"}</TableCell>
                  <TableCell>{fixture.time || "TBD"}</TableCell>
                  <TableCell>{fixture.opponent}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {fixture.home_score !== null && fixture.away_score !== null ? (
                        <>
                          <span>{fixture.home_score} - {fixture.away_score}</span>
                          {getOutcomeIcon(fixture.outcome)}
                        </>
                      ) : (
                        "Not played"
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTeamSelection(fixture);
                      }}
                    >
                      Team Selection
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(fixture.id);
                      }}
                      className="text-destructive hover:text-destructive/80"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
};