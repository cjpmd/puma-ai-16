import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface FixtureCardProps {
  fixture: {
    id: string;
    opponent: string;
    home_score: number | null;
    away_score: number | null;
  };
  onEdit: (fixture: FixtureCardProps["fixture"]) => void;
}

export const FixtureCard = ({ fixture, onEdit }: FixtureCardProps) => {
  const hasScores = fixture.home_score !== null && fixture.away_score !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Match vs {fixture.opponent}</span>
          <Button variant="ghost" size="sm" onClick={() => onEdit(fixture)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasScores ? (
          <p className="text-xl font-bold">
            {fixture.home_score} - {fixture.away_score}
          </p>
        ) : (
          <p className="text-muted-foreground">Score not yet recorded</p>
        )}
      </CardContent>
    </Card>
  );
};