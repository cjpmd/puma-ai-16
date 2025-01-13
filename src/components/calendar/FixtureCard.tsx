import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";

interface FixtureCardProps {
  fixture: {
    id: string;
    opponent: string;
    home_score: number | null;
    away_score: number | null;
    category: string;
    location?: string;
  };
  onEdit: (fixture: FixtureCardProps["fixture"]) => void;
  onDelete: (fixtureId: string) => void;
}

export const FixtureCard = ({ fixture, onEdit, onDelete }: FixtureCardProps) => {
  const hasScores = fixture.home_score !== null && fixture.away_score !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{fixture.category}</Badge>
            <span>vs {fixture.opponent}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(fixture)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(fixture.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
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
        {fixture.location && (
          <p className="text-sm text-muted-foreground mt-2">
            Location: {fixture.location}
          </p>
        )}
      </CardContent>
    </Card>
  );
};