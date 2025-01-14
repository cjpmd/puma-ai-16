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
import { useToast } from "@/hooks/use-toast";

const Fixtures = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState<any>(null);
  const { toast } = useToast();

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

  const handleDelete = async (fixtureId: string) => {
    try {
      const { error } = await supabase
        .from("fixtures")
        .delete()
        .eq("id", fixtureId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fixture deleted successfully",
      });
      refetch();
    } catch (error) {
      console.error("Error deleting fixture:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete fixture",
      });
    }
  };

  const handleEdit = (fixture: any) => {
    setSelectedFixture(fixture);
    setIsDialogOpen(true);
  };

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
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setSelectedFixture(null);
          }}
          onSuccess={() => {
            refetch();
            setSelectedFixture(null);
          }}
          editingFixture={selectedFixture}
          selectedDate={selectedFixture ? parseISO(selectedFixture.date) : undefined}
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dateFixtures.map((fixture) => (
                    <TableRow key={fixture.id} className="cursor-pointer hover:bg-accent/50" onClick={() => handleEdit(fixture)}>
                      <TableCell>
                        <Badge variant="outline">{fixture.category}</Badge>
                      </TableCell>
                      <TableCell>{fixture.location || "TBD"}</TableCell>
                      <TableCell>{fixture.opponent}</TableCell>
                      <TableCell>
                        {getScoreDisplay(fixture.home_score, fixture.away_score)}
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(fixture.id);
                          }}
                          className="text-destructive hover:text-destructive/80"
                        >
                          Delete
                        </button>
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