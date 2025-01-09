import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FixtureCardProps {
  fixture: {
    id: string;
    opponent: string;
    home_score: number | null;
    away_score: number | null;
  };
}

export const FixtureCard = ({ fixture }: FixtureCardProps) => {
  const hasScores = fixture.home_score !== null && fixture.away_score !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Match vs {fixture.opponent}
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