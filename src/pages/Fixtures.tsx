import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { AddFixtureDialog } from "@/components/calendar/AddFixtureDialog";
import { useState } from "react";

const Fixtures = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: fixtures, isLoading, refetch } = useQuery({
    queryKey: ["fixtures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixtures")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      
      // Group fixtures by date
      const groupedFixtures = data.reduce((acc, fixture) => {
        const date = fixture.date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(fixture);
        return acc;
      }, {});

      return groupedFixtures;
    },
  });

  const getScoreDisplay = (homeScore: number | null, awayScore: number | null) => {
    if (homeScore === null || awayScore === null) return "Not played";
    return `${homeScore} - ${awayScore}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Fixtures</h1>
        <AddFixtureDialog 
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSuccess={refetch}
        />
      </div>

      {isLoading ? (
        <div>Loading fixtures...</div>
      ) : (
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
                    <TableHead>Opponent</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dateFixtures.map((fixture) => (
                    <TableRow key={fixture.id}>
                      <TableCell>
                        <Badge variant="outline">{fixture.category}</Badge>
                      </TableCell>
                      <TableCell>{fixture.location || "TBD"}</TableCell>
                      <TableCell>{fixture.opponent}</TableCell>
                      <TableCell>
                        {getScoreDisplay(fixture.home_score, fixture.away_score)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Fixtures;