import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Users } from "lucide-react";

interface FixtureCardProps {
  fixture: {
    id: string;
    opponent: string;
    home_score: number | null;
    away_score: number | null;
    category: string;
    location?: string;
    time?: string | null;
  };
  onEdit: (fixture: FixtureCardProps["fixture"]) => void;
  onDelete: (fixtureId: string) => void;
  onTeamSelection: (fixture: FixtureCardProps["fixture"]) => void;
}

export const FixtureCard = ({ fixture, onEdit, onDelete, onTeamSelection }: FixtureCardProps) => {
  const hasScores = fixture.home_score !== null && fixture.away_score !== null;

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardHeader>
        <CardTitle className="text-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{fixture.category}</Badge>
            <span>vs {fixture.opponent}</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(fixture);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onTeamSelection(fixture);
              }}
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(fixture.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent onClick={() => onEdit(fixture)} className="cursor-pointer">
        {hasScores ? (
          <p className="text-xl font-bold">
            {fixture.home_score} - {fixture.away_score}
          </p>
        ) : (
          <p className="text-muted-foreground">Score not yet recorded</p>
        )}
        <div className="space-y-1 mt-2 text-sm text-muted-foreground">
          {fixture.location && (
            <p>Location: {fixture.location}</p>
          )}
          {fixture.time && (
            <p>Time: {fixture.time}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};